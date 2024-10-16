<template>
  <div class="card">
    <Fieldset legend="FORMACIONES FINALIZADAS">
      <div v-if="cursos.length > 0">
        <DataView :value="cursos" layout="grid">
          <!-- Grid View -->
          <template #grid="slotProps">
            <div class="grid grid-cols-12 gap-4">
              <div
                v-for="(curso, index) in slotProps.items"
                :key="index"
                class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3 p-2"
              >
                <div
                  class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col h-full"
                >
                  <div
                    class="bg-surface-50 flex justify-center rounded p-4 h-48"
                  >
                    <img
                      class="rounded w-full h-full object-cover"
                      :src="curso.miniatura"
                      alt="Imagen del curso"
                      style="max-width: 300px"
                    />
                  </div>
                  <div class="pt-6 flex flex-col justify-between flex-grow">
                    <div>
                      <div class="text-lg font-medium mt-1">
                        {{ curso.titulo }}
                      </div>
                    </div>
                    <div class="flex flex-col gap-6 mt-6">
                      <Button
                        icon="pi pi-trophy"
                        label="Ver certificado"
                        class="flex-auto whitespace-nowrap"
                        severity="secondary"
                        raised
                        @click="verCertificado(curso.idCurso)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </DataView>
      </div>
      <!-- Mensaje cuando no hay cursos -->
      <Message v-else
        >No estás inscrito en ningún curso todavía. Explora nuestra oferta de
        cursos y únete a uno que te interese.</Message
      >
    </Fieldset>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";

const cursos = ref([]);
const loading = ref(true);
const error = ref(null);
const authStore = useAuthStore();
const usuario = authStore.usuario.id;
const router = useRouter();

const obtenerCursos = async () => {
  try {
    const response = await api.get(`/misCursos/obtenerMisCursos/${usuario}`);
    cursos.value = response.data;
    console.log(cursos.value);
  } catch (err) {
    error.value = "Error al cargar los cursos.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const verCertificado = async (idCurso) => {
    router.push(`/panelEstudiante/vistaPreviaCertificado/${usuario}?idCurso=${idCurso}`);

    };

onMounted(() => {
  obtenerCursos();
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
