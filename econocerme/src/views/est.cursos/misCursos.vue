<template>
  <div class="card">
    <Fieldset legend="MIS CURSOS">

    <DataView :value="cursos" :layout="layout">
      <!-- Header -->
      <template #header>
        <div class="flex justify-end">
          <SelectButton v-model="layout" :options="options" :allowEmpty="false">
            <template #option="{ option }">
              <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
            </template>
          </SelectButton>
        </div>
      </template>

      <!-- List View -->
      <template #list="slotProps">
        <div class="flex flex-col">
          <div v-for="(curso, index) in slotProps.items" :key="index">
            <div
              class="flex flex-col sm:flex-row sm:items-center p-6 gap-4"
              :class="{
                'border-t border-surface-200 dark:border-surface-700':
                  index !== 0,
              }"
            >
              <div class="md:w-40 relative">
                <img
                  class="block xl:block mx-auto rounded w-full"
                  :src="curso.miniatura"
                  alt="Imagen del curso"
                />
              </div>
              <div
                class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6"
              >
                <div
                  class="flex flex-row md:flex-col justify-between items-start gap-2"
                >
                  <div>
                    <div class="text-lg font-medium mt-2">
                      {{ curso.titulo }}
                    </div>
                    <p class="text-gray-700 mb-4">{{ curso.descripcion }}</p>
                    <p class="text-sm text-gray-500 mb-4">
                      Duración: {{ curso.duracion }} horas
                    </p>
                  </div>
                </div>
                <div class="flex flex-col md:items-end gap-8">
                  <span class="text-xl font-semibold text-green-600"
                    >{{ curso.precio }} Bs</span
                  >
                  <div class="flex flex-row-reverse md:flex-row gap-2">
                    <Button
                      icon="pi pi-external-link"
                      label="Acceder al curso"
                      class="flex-auto md:flex-initial whitespace-nowrap"
                      @click="accederCurso(curso.idCurso)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

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
              <div class="bg-surface-50 flex justify-center rounded p-4 h-48">
                <img
                  class="rounded w-full h-full object-cover"
                  :src="curso.miniatura"
                  alt="Imagen del curso"
                  style="max-width: 300px"
                />
              </div>
              <div class="pt-6 flex flex-col justify-between flex-grow">
                <div>
                  <div class="text-lg font-medium mt-1">{{ curso.titulo }}</div>
                  <ScrollPanel style="width: 100%; height: 100px">

                  <p class="text-gray-700 mb-4">{{ curso.descripcion }}</p>
                </ScrollPanel>

                  <p class="text-sm text-gray-500 mb-4 pt-3">
                    Duración: {{ curso.duracion }} horas
                  </p>
                </div>
                <div class="flex flex-col gap-6 mt-6">
                  <span class="text-2xl font-semibold text-green-600"
                    >{{ curso.precio }} Bs</span
                  >
                  <Button
                    icon="pi pi-external-link"
                    label="Acceder al curso"
                    class="flex-auto whitespace-nowrap"
                    severity="help" raised
                    @click="accederCurso(curso.idCurso)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>
</Fieldset>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";

const cursos = ref([]);
const layout = ref("grid");
const options = ref(["list", "grid"]);
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

const accederCurso = (idCurso) => {
  router.push(`/panelEstudiante/panelCurso/${idCurso}`);
};

onMounted(() => {
  obtenerCursos();
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
