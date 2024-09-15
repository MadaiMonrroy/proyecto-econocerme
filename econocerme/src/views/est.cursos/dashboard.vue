<template>
    <div class="card">
      <Fieldset legend="CURSOS DISPONIBLES">
        <!-- Contenedor para el buscador y el select -->
        <div class="flex justify-between mb-4">
          <Select
            v-model="especialidadSeleccionada"
            :options="especialidadesConTodas"
            optionLabel="label"
            optionValue="value"
            checkmark
            :highlightOnSelect="false"
            placeholder="Seleccionar especialidad"
            class="w-full md:w-1/4 mr-4"
          />
          <!-- Contenedor para alinear el botón y el buscador en la misma línea -->
          <div class="flex items-center relative w-full md:w-1/2">
            <div class="flex flex-1 max-w-3xl">
              <IconField class="flex flex-1">
                <InputIcon>
                  <i class="pi pi-search" />
                  <!-- Ícono de lupa -->
                </InputIcon>
                <InputText
                  v-model="busqueda"
                  placeholder="Buscar curso..."
                  class="w-full pl-2"
                />
              </IconField>
            </div>
          </div>
        </div>
  
        <!-- Carruseles por especialidad -->
        <div v-if="cursosFiltrados.length === 0" class="text-red-500 mb-4">
          No hay resultados que coincidan con su búsqueda en:
        </div>
        <div
          v-for="especialidad in especialidadSeleccionada
            ? [especialidadSeleccionada]
            : especialidades"
          :key="especialidad"
          class="mb-6"
        >
          <h2 class="text-xl font-bold mb-4">{{ especialidad }}</h2>
          <Carousel
            v-if="cursosFiltradosPorEspecialidad(especialidad).length > 0"
            :value="cursosFiltradosPorEspecialidad(especialidad)"
            :numVisible="4"
            :numScroll="4"
            :responsiveOptions="responsiveOptions"
          >
            <template #item="slotProps">
              <div class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4">
                <div class="mb-4">
                  <div class="relative mx-auto flex justify-center h-72">
                    <Image
                      :src="slotProps.data.miniatura"
                      :alt="slotProps.data.titulo"
                      preview
                      class="max-w-full max-h-full object-cover rounded"
                    />
                  </div>
                </div>
                <div class="mb-4 font-medium">{{ slotProps.data.titulo }}</div>
                <ScrollPanel style="width: 100%; height: 100px">
                  <div class="text-sm text-gray-500 mb-4">
                    {{ slotProps.data.descripcion }}
                  </div>
                </ScrollPanel>
                <div class="text-sm text-gray-500 mb-4">
                  Duración: {{ slotProps.data.duracion }} horas
                </div>
                <div class="mt-0 font-semibold text-xl">
                  {{ slotProps.data.precio }} Bs
                </div>
                <Button
                  icon="pi pi-external-link"
                  severity="info"
                  raised
                  label="Ver más"
                  class="mt-2"
                  @click="accederCurso(slotProps.data.idCurso)"
                />
              </div>
            </template>
          </Carousel>
        </div>
      </Fieldset>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/authStore";
  import api from "@/axiosConfig.js";
  
  const cursos = ref([]);
  const busqueda = ref("");
  const especialidadSeleccionada = ref(null);
  const responsiveOptions = ref([
    { breakpoint: "1400px", numVisible: 4, numScroll: 1 },
    { breakpoint: "1199px", numVisible: 2, numScroll: 1 },
    { breakpoint: "767px", numVisible: 2, numScroll: 1 },
    { breakpoint: "575px", numVisible: 1, numScroll: 1 },
  ]);
  
  const authStore = useAuthStore();
  const usuario = authStore.usuario.id;
  const router = useRouter();
  const especialidades = ref([]);
  
  const obtenerCursos = async () => {
    try {
      const response = await api.get(
        `/misCursos/obtenerCursosNoInscritos/${usuario}`
      );
      cursos.value = response.data;
  
      // Obtener especialidades únicas
      especialidades.value = [
        ...new Set(cursos.value.map((curso) => curso.especialidad)),
      ];
    } catch (err) {
      console.error("Error al cargar los cursos:", err);
    }
  };
  
  const accederCurso = (idCurso) => {
    router.push(`/panelEstudiante/panelCurso/${idCurso}`);
  };
  
  // Computed para incluir la opción "Todas las especialidades"
  const especialidadesConTodas = computed(() => {
    return [
      { label: "Todas las Categorias", value: null },
      ...especialidades.value.map((especialidad) => ({
        label: especialidad,
        value: especialidad,
      })),
    ];
  });
  
  // Filtrar cursos por especialidad
  const cursosFiltradosPorEspecialidad = (especialidad) => {
    if (!especialidad) {
      // Si no hay especialidad seleccionada (todas), devolver todos los cursos
      return cursos.value.filter((curso) =>
        curso.titulo.toLowerCase().includes(busqueda.value.toLowerCase())
      );
    }
    return cursos.value.filter(
      (curso) =>
        curso.especialidad === especialidad &&
        curso.titulo.toLowerCase().includes(busqueda.value.toLowerCase())
    );
  };
  
  // Computed para manejar los cursos filtrados
  const cursosFiltrados = computed(() => {
    return cursos.value.filter(curso =>
      curso.titulo.toLowerCase().includes(busqueda.value.toLowerCase())
    );
  });
  
  onMounted(() => {
    obtenerCursos();
  });
  </script>
  