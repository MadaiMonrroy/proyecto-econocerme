<template>
    <div v-if="isActive"  class="p-8 max-w-4xl mx-auto shadow-2xl">
      <!-- Formulario de preguntas -->
      <div
        v-for="(question, index) in questions"
        :key="index"
        class="mb-8 shadow-md p-6 rounded-lg"
      >
        <div class="flex justify-between items-center mb-4">
        </div>
  
        <p class="text-lg mb-4">{{ question.text }}</p>
  
        <!-- Opciones de respuestas -->
        <div class="mb-4">
          <div
            v-for="(option, optIndex) in question.options"
            :key="optIndex"
            class="flex items-center mb-2"
          >
            <RadioButton
              type="radio"
              :name="'correctAnswer-' + index"
              :value="optIndex"
              v-model="question.correctAnswer"
              class="mr-3"
              readonly=""
            />
            <p class="flex-grow">{{ option }}</p>
          </div>
        </div>
      </div>
  
      <!-- <Button
        @click="submitForm"
        severity="success"
        class="bg-green-500 text-white px-6 py-3 rounded-md shadow hover:bg-green-600 transition-colors"
      >
        <i class="pi pi-save mr-2"></i> Guardar Examen
      </Button> -->
    </div>
  </template>
  
  <script>
  import api from "@/axiosConfig.js";
  import { useAuthStore } from "@/stores/authStore";
  import { watch } from "vue";

  
  export default {
    props: {
      cursoId: {
        type: Number,
        required: true,
      },
      isActive: { // Prop para indicar si es la pestaña activa
      type: Boolean,
      default: false,
    },
    },
    data() {
      return {
        questions: [],
      };
    },
    computed: {
      idUsuario() {
        const authStore = useAuthStore();
        return authStore.usuario.id;
      },
    },
    methods: {
      // Cargar preguntas existentes desde el backend
      loadQuestions() {
        api
          .get(`/evaluaciones/obtenerPreguntas/${this.cursoId}`)
          .then((response) => {
            this.questions = response.data.map((pregunta) => ({
              idPregunta: pregunta.idPregunta,
              text: pregunta.text,
              options: pregunta.options || [],
              correctAnswer: pregunta.correctAnswer !== undefined ? pregunta.correctAnswer : null,
            }));
          })
          .catch((error) => {
            console.error("Error al cargar preguntas", error);
          });
      },
    },
    mounted() {
      this.loadQuestions();
    },
    watch: {
    isActive(newVal) {
      if (newVal) {
        this.loadQuestions(); // Cargar preguntas cuando la pestaña se activa
      }
    },
  },
  };
  </script>
  