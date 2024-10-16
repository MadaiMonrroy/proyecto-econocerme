<template>
    <div class="card rounded-lg shadow-lg ">
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
                  <label :for="`option-${pregunta.idPregunta}-${optIndex}`" class="">
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
  
      <!-- Modal para mostrar la nota -->
      <Dialog v-model="showModal" :header="modalHeader" :visible="showModal" modal>
        <div v-if="aprobado">
          <p>¡Felicidades! Has aprobado con una nota de {{ notaFinal }}.</p>
          <Button label="Obtener Certificado" @click="generarCertificado" />
        </div>
        <div v-else>
          <p>Lo siento, no has aprobado. Tu nota es de {{ notaFinal }}.</p>
          <Button label="Volver a Intentarlo" @click="intentarNuevamente" />
        </div>
      </Dialog>
    </div>
  </template>
  
  
  <script>
 import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";

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

    onMounted(() => {
      loadPreguntas(idCurso);
    });

    const loadPreguntas = async (idCurso) => {
      try {
        const response = await api.get(
          `/evaluaciones/obtenerPreguntas/${idCurso}`
        );
        preguntas.value = response.data;
      } catch (error) {
        console.error("Error al cargar las preguntas:", error);
      }
    };

    const submitAnswers = async () => {
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
        const response = await api.post('/evaluaciones/ingresarEvaluacion', payload);
        notaFinal.value = response.data.notaFinal;
        if (notaFinal.value >= 60) {
          aprobado.value = true;
          modalHeader.value = "¡Aprobado!";
        } else {
          aprobado.value = false;
          modalHeader.value = "No Aprobado";
        }
        showModal.value = true;
      } catch (error) {
        console.error("Error al enviar respuestas:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar la evaluación', life: 3000 });
      }
    };

    const generarCertificado = async () => {
      try {
        const response = await api.post('/evaluaciones/generarCertificado', { idUsuario, idCurso });
        toast.add({ severity: 'success', summary: 'Certificado', detail: 'Certificado generado exitosamente', life: 3000 });
        if (response.data.url) {
      window.open(response.data.url);
    } else {
      throw new Error("No se pudo generar el PDF.");
    }
      } catch (error) {
        console.error("Error al generar certificado:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el certificado', life: 3000 });
      }
    };

    const intentarNuevamente = () => {
      showModal.value = false;
      router.push(`/panelEstudiante/misCursos`);
    };

    return {
      preguntas,
      selectedAnswers,
      currentStep,
      submitAnswers,
      showModal,
      aprobado,
      modalHeader,
      notaFinal,
      generarCertificado,
      intentarNuevamente,
    };
  },
};

  </script>
  
  <style scoped>
  /* Puedes personalizar cualquier estilo específico aquí, si es necesario */
  </style>
  