<template>
  <div class="pt-5">
  <div class="p-8 max-w-4xl mx-auto rounded-3xl shadow-2xl dark:shadow-lg dark:shadow-violet-950">
    <!-- Formulario de preguntas -->
    <div
      v-for="(question, index) in questions"
      :key="index"
      class="mb-8 shadow-lg p-6 rounded-3xl dar dark:shadow-lg dark:shadow-violet-950"
    >
      <div class="flex justify-between items-center mb-4">
        <label class="block text-xl font-medium"
          >Pregunta {{ index + 1 }}</label
        >
        <Button
          @click="deleteQuestion(question.idPregunta, index)"
          severity="danger"
          text
          class="text-red-500 hover:text-red-600 transition-colors"
        >
          <i class="pi pi-trash"></i>
        </Button>
      </div>

      <InputText
        v-model="question.text"
        type="text"
        placeholder="Escribe la pregunta"
        class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />

      <!-- Opciones de respuestas -->
      <div
        v-for="(option, optIndex) in question.options"
        :key="optIndex"
        class="flex items-center mb-4"
      >
        <i class="pi pi-circle mr-3"></i>

        <InputText
          v-model="question.options[optIndex]"
          type="text"
          placeholder="Opción"
          class="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <RadioButton
          type="radio"
          :name="'correctAnswer-' + index"
          :value="optIndex"
          v-model="question.correctAnswer"
          class="ml-4"
        />

        <Button
          @click="removeOption(index, optIndex)"
          severity="danger"
          text
          class="ml-4 text-red-500 hover:text-red-600 transition-colors"
        >
          <i class="pi pi-minus-circle"></i>
        </Button>
      </div>

      <!-- Botón para añadir opción -->
      <Button
        icon="pi pi-plus-circle"
        severity="info"
        text
        @click="addOption(index)"
        label="Añadir Opción"
      />
    </div>

    <!-- Botones para añadir pregunta y guardar examen -->
    <Button
      @click="addQuestion"
      severity="info"
      class="bg-blue-500 text-white px-6 py-3 rounded-md shadow hover:bg-blue-600 transition-colors"
    >
      <i class="pi pi-plus-circle mr-2"></i> Añadir Pregunta
    </Button>

    <Button
      @click="submitForm"
      severity="success"
      class="ml-4 bg-green-500 text-white px-6 py-3 rounded-md shadow hover:bg-green-600 transition-colors"
    >
      <i class="pi pi-save mr-2"></i> Guardar Examen
    </Button>
  </div>
</div>
</template>

<script>
import api from "@/axiosConfig.js";
import { useAuthStore } from "@/stores/authStore";

export default {
  props: {
    cursoId: {
      type: Number,
      required: true,
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
    // Añadir una nueva pregunta
    addQuestion() {
      this.questions.push({ text: "", options: [""], correctAnswer: null });
    },

    // Eliminar una pregunta
    async deleteQuestion(idPregunta, index) {
      const authStore = useAuthStore();
      const idUsuario = authStore.usuario.id;
      console.log(idUsuario);
      try {
        const response = await api.delete(
          `/evaluaciones/eliminarPregunta/${idPregunta}`,
          {
            params: { idUsuario },
          }
        );
        console.log("Pregunta eliminada", response.data);

        // Eliminar la pregunta del array local solo si la eliminación fue exitosa
        this.questions.splice(index, 1);
      } catch (error) {
        console.error(
          "Error al eliminar la pregunta",
          error.response?.data || error.message
        );
      }
    },

    // Añadir una opción a una pregunta específica
    addOption(questionIndex) {
      this.questions[questionIndex].options.push("");
    },

    // Eliminar una opción de una pregunta específica
    removeOption(questionIndex, optionIndex) {
      this.questions[questionIndex].options.splice(optionIndex, 1);
    },

    // Enviar formulario al backend
    submitForm() {
      const nuevasPreguntas = this.questions.filter((q) => !q.idPregunta); // Preguntas nuevas
      const preguntasExistentes = this.questions.filter((q) => q.idPregunta); // Preguntas existentes

      const payloadNuevas = {
        cursoId: this.cursoId,
        preguntas: nuevasPreguntas.map((p) => ({
          text: p.text,
          options: p.options,
          correctAnswer: p.correctAnswer !== null ? p.correctAnswer : null,
        })),
        idUsuario: this.idUsuario,
      };

      const payloadEditar = {
        cursoId: this.cursoId,
        preguntas: preguntasExistentes.map((p) => ({
          idPregunta: p.idPregunta,
          text: p.text,
          options: p.options,
          correctAnswer: p.correctAnswer !== null ? p.correctAnswer : null,
        })),
        idUsuario: this.idUsuario,
      };

      // Enviar preguntas nuevas al backend
      if (nuevasPreguntas.length) {
        api
          .post("/evaluaciones/agregarPreguntas", payloadNuevas)
          .then((response) => {
            console.log("Nuevas preguntas guardadas", payloadNuevas);
            this.loadQuestions();
            // this.redirectToAnotherView(); // Redirige después de actualizar

          })

          .catch((error) => {
            console.error(
              "Error al guardar nuevas preguntas",
              error.response?.data || error.message
            );
          });
      }

      // Actualizar preguntas existentes en el backend
      if (preguntasExistentes.length) {
        api
          .put("/evaluaciones/editarPreguntas", payloadEditar)
          .then((response) => {
            console.log("Preguntas actualizadas", response.data);
            this.loadQuestions();


            // this.redirectToAnotherView(); // Redirige después de actualizar

          })
          .catch((error) => {
            console.error(
              "Error al actualizar preguntas",
              error.response?.data || error.message
            );
          });
      }
      this.$emit("changeTab", "1"); // Emitimos el evento para cambiar a la pestaña de vista previa

    },
    // // Método para redirigir a otra vista
    // redirectToAnotherView() {
    //   this.$router.push(`/panelControl/evaluacion/${this.cursoId}`);
    // },
    // Cargar preguntas existentes desde el backend
    loadQuestions() {
      api
        .get(`/evaluaciones/obtenerPreguntas/${this.cursoId}`)
        .then((response) => {
          console.log("Datos recibidos:", response.data);

          // Mapeo correcto de preguntas, opciones y respuestas
          this.questions = response.data.map((pregunta) => {
            console.log("Pregunta en datos:", pregunta); // Verifica el nombre correcto del campo

            let opciones = pregunta.options || [];
            let correctAnswerIndex = pregunta.correctAnswer; // Utiliza el índice directamente

            console.log(
              `Pregunta: ${pregunta.text} - Respuesta Correcta: ${pregunta.correctAnswer} - Índice: ${correctAnswerIndex}`
            );

            return {
              idPregunta: pregunta.idPregunta,
              text: pregunta.text,
              options: opciones.length > 0 ? opciones : [""],
              // Usa directamente el índice proporcionado
              correctAnswer:
                correctAnswerIndex !== undefined ? correctAnswerIndex : null,
            };
          });
        })
        .catch((error) => {
          console.error("Error al cargar preguntas", error);
        });
    },
  },
  mounted() {
    console.log("sdhajksdfhkjahdfkjhadjsk", this.idUsuario);
    // Cargar las preguntas cuando se monta el componente
    this.loadQuestions();
  },
};
</script>

<style scoped>
/* Puedes agregar estilos adicionales aquí si es necesario */
</style>
