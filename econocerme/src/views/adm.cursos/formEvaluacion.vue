<template>
  <div class="card p-8 max-w-4xl mx-auto bg-gray-100 shadow-2xl">
    <!-- Formulario de preguntas -->
    <div v-for="(question, index) in questions" :key="index" class="card mb-8 bg-white shadow-md p-6 rounded-lg">
      <div class="flex justify-between items-center mb-4">
        <label class="block text-xl font-medium text-gray-700">Pregunta {{ index + 1 }}</label>
        <button @click="removeQuestion(index)" class="text-red-500 hover:text-red-600 transition-colors">
          <i class="pi pi-trash"></i>
        </button>
      </div>

      <input
        v-model="question.text"
        type="text"
        placeholder="Escribe la pregunta"
        class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-gray-700"
      />

      <!-- Opciones de respuestas -->
      <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center mb-4">
        <i class="pi pi-circle mr-3 text-gray-500"></i>

        <input
          v-model="question.options[optIndex]"
          type="text"
          placeholder="Opción"
          class="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        />

        <input
          type="radio"
          :name="'correctAnswer-' + index"
          v-model="question.correctAnswer"
          :value="optIndex"
          class="ml-4"
        />

        <button @click="removeOption(index, optIndex)" class="ml-4 text-red-500 hover:text-red-600 transition-colors">
          <i class="pi pi-minus-circle"></i>
        </button>
      </div>

      <!-- Botón para añadir opción -->
      <button @click="addOption(index)" class="text-blue-500 hover:text-blue-600 transition-colors">
        <i class="pi pi-plus-circle mr-2"></i> Añadir Opción
      </button>
    </div>

    <!-- Botones para añadir pregunta y guardar examen -->
    <button @click="addQuestion" class="bg-blue-500 text-white px-6 py-3 rounded-md shadow hover:bg-blue-600 transition-colors">
      <i class="pi pi-plus-circle mr-2"></i> Añadir Pregunta
    </button>

    <button @click="submitForm" class="ml-4 bg-green-500 text-white px-6 py-3 rounded-md shadow hover:bg-green-600 transition-colors">
      <i class="pi pi-save mr-2"></i> Guardar Examen
    </button>
  </div>
</template>

<script>
import api from "@/axiosConfig.js";

export default {
  props: {
    cursoId: {
      type: Number,
      required: true
    },
    idUsuario: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      questions: []
    };
  },
  methods: {
    // Añadir una nueva pregunta
    addQuestion() {
      this.questions.push({ text: '', options: [''], correctAnswer: null });
    },

    // Eliminar una pregunta
    removeQuestion(index) {
      this.questions.splice(index, 1);
    },

    // Añadir una opción a una pregunta específica
    addOption(questionIndex) {
      this.questions[questionIndex].options.push('');
    },

    // Eliminar una opción de una pregunta específica
    removeOption(questionIndex, optionIndex) {
      this.questions[questionIndex].options.splice(optionIndex, 1);
    },

    // Enviar formulario al backend
    submitForm() {
  const nuevasPreguntas = this.questions.filter(q => !q.idPregunta); // Preguntas nuevas
  const preguntasExistentes = this.questions.filter(q => q.idPregunta); // Preguntas existentes

  const payloadNuevas = {
    cursoId: this.cursoId,
    preguntas: nuevasPreguntas,
    idUsuario: this.idUsuario
  };

  const payloadEditar = {
    cursoId: this.cursoId,
    preguntas: preguntasExistentes,
    idUsuario: this.idUsuario
  };

  // Enviar preguntas nuevas al backend
  if (nuevasPreguntas.length) {
    api.post('/evaluaciones/agregarPreguntas', payloadNuevas)
      .then(response => {
        console.log("Nuevas preguntas guardadas", response.data);
      })
      .catch(error => {
        console.error("Error al guardar nuevas preguntas", error.response?.data || error.message);
      });
  }

  // Actualizar preguntas existentes en el backend
  if (preguntasExistentes.length) {
    api.put('/evaluaciones/editarPreguntas', payloadEditar)
      .then(response => {
        console.log("Preguntas actualizadas", response.data);
      })
      .catch(error => {
        console.error("Error al actualizar preguntas", error.response?.data || error.message);
      });
  }
},


    // Cargar preguntas existentes desde el backend
    loadQuestions() {
  api.get(`/evaluaciones/obtenerPreguntas/${this.cursoId}`)
    .then(response => {
      console.log("Datos recibidos:", response.data); // Verifica los datos aquí
      this.questions = response.data.map(pregunta => ({
        idPregunta: pregunta.idPregunta,
        text: pregunta.text,
        options: pregunta.options || [], // Asegúrate de que options es un array
        correctAnswer: pregunta.correctAnswer
      }));
    })
    .catch(error => {
      console.error("Error al cargar preguntas", error);
    });
}


  },
  mounted() {
    // Cargar las preguntas cuando se monta el componente
    this.loadQuestions();
  }
};
</script>

<style scoped>
/* Puedes agregar estilos adicionales aquí si es necesario */
</style>
