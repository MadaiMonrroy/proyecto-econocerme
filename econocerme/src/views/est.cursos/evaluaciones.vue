<template>
  <div class="card rounded-lg shadow-lg min-h-screen">
    <div
      class="course-info p-6 mb-6 rounded-2xl shadow-xl dark:shadow-violet-950"
    >
      <img
        :src="curso.miniatura"
        alt="Miniatura del curso"
        class="w-full h-32 object-cover rounded-lg mb-4"
      />
      <h2 class="text-2xl font-bold font-sans uppercase">{{ curso.titulo }}</h2>
      <Tag class="text-gray-700 mt-2"> {{ curso.especialidad }}</Tag>
      <Message severity="info" class="mt-4">
        <p class="text-gray-600">{{ curso.descripcion }}</p></Message
      >
    </div>
    <div
      class="max-w-full shadow-2xl flex flex-col items-center rounded-2xl p-8 pt-11 dark:shadow-violet-950"
    >
      <p class="text-gray-600 text-left mb-3">
        Por favor, completa la evaluación en un máximo de tres intentos, sin
        salir de la misma hasta haber terminado, y asegúrate de seleccionar una
        respuesta para cada pregunta; de lo contrario, no podrás continuar.
      </p>
      <div class="max-w-[680px]">
        <Stepper :value="currentStep">
          <StepItem
            v-for="(pregunta, index) in preguntas"
            :key="pregunta.idPregunta"
            :value="index + 1"
          >
            <Step>{{ `Pregunta ${index + 1}` }}</Step>
            <StepPanel v-slot="{ activateCallback }">
              <div class="flex flex-col">
                <div class="mb-4">
                  <h2 class="text-xl font-semibold">{{ pregunta.text }}</h2>
                </div>
                <div>
                  <div
                    v-for="(option, optIndex) in pregunta.options"
                    :key="optIndex"
                    class="flex items-center mb-3"
                  >
                    <RadioButton
                      type="radio"
                      :id="`option-${pregunta.idPregunta}-${optIndex}`"
                      :value="optIndex"
                      v-model="selectedAnswers[index]"
                      :name="`pregunta-${index}`"
                      class="mr-3"
                    />
                    <label
                      :for="`option-${pregunta.idPregunta}-${optIndex}`"
                      class=""
                    >
                      {{ option }}
                    </label>
                  </div>
                </div>
              </div>
              <div class="flex py-6 gap-2">
                <Button
                  v-if="index > 0"
                  label="Volver"
                  severity="contrast"
                  text
                  @click="activateCallback(index)"
                />
                <Button
                  v-if="index < preguntas.length - 1"
                  label="Siguiente"
                  severity="help"
                  @click="activateCallback(index + 2)"
                  raised=""
                />
                <Button
                  v-if="index === preguntas.length - 1"
                  label="Finalizar Evaluacion"
                  severity="contrast"
                  @click="submitAnswers"
                />
              </div>
            </StepPanel>
          </StepItem>
        </Stepper>
      </div>
    </div>
    <!-- Modal para mostrar la nota -->
    <!-- Modal para mostrar la nota -->
    <Dialog
      v-model:visible="showModal"
      :header="modalHeader"
      :visible="showModal"
      modal
      @hide="handleCloseDialog"
      class="p-4 rounded-lg bg-white shadow-lg"
    >
      <div class="flex flex-col items-center">
        <h2
          class="text-xl font-semibold mb-4"
          :class="aprobado ? '!text-green-600 ' : '!text-red-600'"
        >
          {{ aprobado ? "¡Felicidades!" : "Lo siento!" }}
        </h2>
        <p class="text-center mb-6">
          {{
            aprobado
              ? `Has aprobado con una nota de ${notaFinal}.`
              : `No has aprobado. Tu nota es de ${notaFinal}.`
          }}
        </p>
        <Button
          :label="aprobado ? 'Obtener Certificado' : 'Volver a Intentarlo'"
          @click="aprobado ? generarCertificado() : intentarNuevamente()"
          class="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition duration-200"
        />
      </div>
    </Dialog>

    <Dialog
      v-model:visible="isLeaving"
      header="Confirmación de salida"
      modal
      class="max-w-md"
    >
      <template #container>
        <div
          class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded-3xl"
        >
          <div
            class="rounded-full bg-primary text-primary-contrast inline-flex justify-center items-center h-24 w-24 -mt-20"
          >
            <i
              class="pi pi-exclamation-triangle !text-violet-950"
              style="color: dimgray; font-size: 3rem"
            ></i>
          </div>
          <span class="font-bold text-2xl block mb-2 mt-6"
            >¿Estás seguro que deseas salir?</span
          >
          <p class="mb-0 text-center text-gray-700">
            Si decides salir, perderás todo el progreso en esta evaluación, y tu
            calificación se registrará como <strong>0</strong>. Además, ten en
            cuenta que solo tienes <strong>3 intentos</strong> disponibles.
          </p>

          <div class="flex items-center gap-2 mt-6">
            <Button
              label="Cancelar"
              raised
              severity="primary"
              outlined
              @click="cancelLeave"
            ></Button>
            <Button
              label="Salir"
              severity="danger"
              class="min-w-24"
              raised
              @click="confirmLeave"
            ></Button>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";
import confetti from "canvas-confetti"; // Asegúrate de que esta importación esté al principio

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();
    const authStore = useAuthStore();
    const idUsuario = authStore.usuario.id;
    const idCurso = route.params.idCurso;
    const preguntas = ref([]);
    const selectedAnswers = ref([]);
    const currentStep = ref(1);
    const showModal = ref(false);
    const notaFinal = ref(null);
    const aprobado = ref(false);
    const modalHeader = ref("");
    const curso = ref({});
    const isNavigatingAway = ref(false); // Nuevo estado para controlar la navegación.

    onMounted(() => {
      cargarCurso(idCurso);
      loadPreguntas(idCurso);
    });

    const isLeaving = ref(false); // Controla si mostrar el modal de salida.

    const cargarCurso = async (idCurso) => {
      try {
        const response = await api.get(`/cursos/obtenerCurso/${idCurso}`);
        console.log(response);
        curso.value = response.data;
      } catch (error) {
        console.error("Error al cargar el curso:", error);
      }
    };
    const loadPreguntas = async (idCurso) => {
      try {
        const response = await api.get(
          `/evaluaciones/obtenerPreguntasEstudiante/${idCurso}?idUsuario=${idUsuario}`
        );
        preguntas.value = response.data;
      } catch (error) {
        console.error("Error al cargar las preguntas:", error);
      }
    };
    const handleCloseDialog = () => {

      isLeaving.value = false;
      isNavigatingAway.value = true; // Cambiamos el estado a true al confirmar la salida
      router.push("/panelEstudiante/misCursos");

      // const destinationRoute = "/panelEstudiante/certificaciones";

      // // Reemplazar la ruta actual con la misma ruta
      // router.replace(destinationRoute).then(() => {
      //   isNavigatingAway.value = false; // Restablecer el estado después de la navegación
      // });
    };

    router.beforeEach((to, from, next) => {
      if (
        shouldShowExitWarning() &&
        !isLeaving.value &&
        !isNavigatingAway.value
      ) {
        // Mostrar el modal en lugar de permitir la navegación inmediata.
        isLeaving.value = true;
      } else {
        next(); // Permitir la navegación si no hay advertencia.
      }
    });

    const shouldShowExitWarning = () => {
      return currentStep.value < preguntas.value.length;
    };

    const confirmLeave = () => {
      isLeaving.value = false;
      isNavigatingAway.value = true; // Cambiamos el estado a true al confirmar la salida
      const destinationRoute = "/panelEstudiante/dashboard";

      // Reemplazar la ruta actual con la misma ruta
      router.replace(destinationRoute).then(() => {
        isNavigatingAway.value = false; // Restablecer el estado después de la navegación
      });
    };

    const cancelLeave = () => {
      isLeaving.value = false; // Cerrar el modal sin cambiar de ruta.
    };

    const submitAnswers = async () => {
      const preguntasSinResponder = preguntas.value
        .map((pregunta, index) => {
          if (selectedAnswers.value[index] === undefined) {
            return `Pregunta ${index + 1}: ${pregunta.text}`;
          }
          return null;
        })
        .filter((pregunta) => pregunta !== null);

      if (preguntasSinResponder.length > 0) {
        const mensaje = preguntasSinResponder.join("\n");
        toast.add({
          severity: "warn",
          summary: "Evaluación incompleta",
          detail: `Por favor, responde las siguientes preguntas:\n${mensaje}`,
          life: 5000,
        });
        return; // Evita continuar con el envío si hay preguntas sin responder
      }
      const respuestas = preguntas.value.map((pregunta, index) => {
        return {
          idPregunta: pregunta.idPregunta,
          respuesta: pregunta.options[selectedAnswers.value[index]],
        };
      });

      const payload = {
        idUsuario,
        idCurso,
        respuestas,
      };

      try {
        const response = await api.post(
          "/evaluaciones/ingresarEvaluacion",
          payload
        );
        notaFinal.value = response.data.notaFinal;
        if (notaFinal.value >= 70) {
          aprobado.value = true;
          modalHeader.value = "¡Aprobado!";
          mostrarConfetti(); // Llama a la función aquí
        } else {
          aprobado.value = false;
          modalHeader.value = "Reprobado";
        }
        showModal.value = true;
      } catch (error) {
        console.error("Error al enviar respuestas:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo enviar la evaluación",
          life: 3000,
        });
      }
    };

    const generarCertificado = async () => {
      try {
        const response = await api.post("/evaluaciones/generarCertificado", {
          idUsuario,
          idCurso,
        });
        toast.add({
          severity: "success",
          summary: "Certificado",
          detail: "Certificado generado exitosamente",
          life: 3000,
        });
        if (response.data.url) {
          window.open(response.data.url);
        } else {
          throw new Error("No se pudo generar el PDF.");
        }
      } catch (error) {
        console.error("Error al generar certificado:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo generar el certificado",
          life: 3000,
        });
      }
    };

    const intentarNuevamente = () => {
      showModal.value = false;
      isLeaving.value = false;
      isNavigatingAway.value = true; // Cambiamos el estado a true al confirmar la salida
      router.push("/panelEstudiante/misCursos");
    };
    // Agrega la función mostrarConfetti
    const mostrarConfetti = () => {
      confetti.create(document.getElementById("confettiContainer"), {
        resize: true,
        useWorker: true,
      })({ particleCount: 150, spread: 250 });
    };
    return {
      curso,
      isLeaving,
      preguntas,
      cancelLeave,
      confirmLeave,
      selectedAnswers,
      currentStep,
      submitAnswers,
      showModal,
      aprobado,
      modalHeader,
      notaFinal,
      generarCertificado,
      intentarNuevamente,
      handleCloseDialog,
    };
  },
};
</script>

<style scoped>
/* Puedes personalizar cualquier estilo específico aquí, si es necesario */
</style>
