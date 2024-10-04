<template>
  <div class="p-4">
    <div class="card">
      <Divider align="left" type="solid">
        <b class="text-3xl text-black dark:text-white">ANUNCIOS</b>
      </Divider>

      <div v-if="anunciosFiltrados.length === 0" class="text-red-500 mb-4">
        No hay resultados que coincidan con su búsqueda.
      </div>

      <Carousel
        v-if="anunciosFiltrados.length > 0"
        :value="anunciosFiltrados"
        :numVisible="1"
        :numScroll="1"
        orientation="vertical"
        verticalViewPortHeight="270px"
        :responsiveOptions="responsiveOptions"
        :autoplayInterval="4000"
        circular
        containerClass="flex items-center justify-center"
      >
        <template #item="slotProps">
          <div
            class="card !bg-gradient-to-tr from-[rgba(191, 90, 242, 0.5)] to-[rgba(191, 90, 242, 0.2)] min-h-[240px] md:max-h-[310px] !border-0 !rounded-full m-2 p-4 flex flex-col md:flex-row items-center justify-center"
          >
            <!-- Imagen a la izquierda, ajustable para pantallas pequeñas -->

            <div
              class="w-1/5 h-40 flex-shrink-0 mb-4 md:mb-0 justify-center items-center"
            >
              <img
                :src="slotProps.data.miniatura"
                :alt="slotProps.data.titulo"
                class="w-full h-full object-contain rounded-3xl border-0 shadow-2xl transform -rotate-6"
              />
            </div>

            <!-- Contenedor para el título y la descripción -->
            <div
              class="w-1/2 flex flex-col md:ml-6 justify-center items-center"
            >
              <!-- Título centrado -->
              <div
                class="mb-2 font-bold text-xl md:text-2xl font-serif text-center md:text-left"
              >
                {{ slotProps.data.titulo }}
              </div>

              <!-- Descripción alineada a la izquierda -->
              <div
                class="hidden md:block w-auto md:w-auto md:ml-6 flex flex-col justify-center"
              >
                <div
                  class="bg-violet-50 dark:bg-violet-900 p-3 items-center justify-center rounded-lg shadow-sm w-fit"
                >
                  <div
                    v-html="slotProps.data.descripcion"
                    class="text-sm text-left"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Carousel>
    </div>

    <div class="card">
      <Divider align="left" type="solid">
        <b class="text-3xl text-black dark:text-white"
          >CURSOS DISPONIBLES</b
        >
      </Divider>

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
        <div class="flex items-center relative w-full md:w-1/2">
          <div class="flex flex-1 max-w-3xl">
            <IconField class="flex flex-1">
              <InputIcon>
                <i class="pi pi-search" />
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
        <Fieldset class="!border-spacing-3">
          <template #legend>
            <span
              class="text-2xl tracking-wide text-violet-950 dark:text-white"
              >{{ especialidad }}</span
            >
          </template>

          <Carousel
            v-if="cursosFiltradosPorEspecialidad(especialidad).length > 0"
            :value="cursosFiltradosPorEspecialidad(especialidad)"
            :numVisible="4"
            :numScroll="1"
            :responsiveOptions="responsiveOptions"
            class="m-3"
          >
            <template #item="slotProps">
              <div
                class="p-8 mt-4 mb-4 ml-2 mr-2 border bg-surface-50 dark:bg-black border-violet-200 shadow-xl dark:border-gray-950  dark:shadow-lg dark:shadow-violet-950 rounded-2xl transform hover:scale-105 transition-all duration-300"
                
                style="height: 450px"
              >
                <div class=" bg-violet-50   dark:bg-gray-900 flex justify-center rounded-xl pt-2  h-48">
                  <div
                    class="w-full h-44 mb-4 flex justify-center items-center overflow-hidden"
                  >
                    <img
                      :src="slotProps.data.miniatura"
                      :alt="slotProps.data.titulo"
                      class="rounded-xl object-cover"
                      style="max-width: 100%; max-height: 100%"
                    />
                  </div>
                </div>
                <div class="pt-6 flex flex-col justify-between flex-grow">
                  <div class="text-lg font-medium mt-1 uppercase h-16">
                    {{ slotProps.data.titulo }}
                  </div>
                  <div class="text-sm text-gray-500 mb-4 pt-6">
                    Duración: {{ slotProps.data.duracion }} horas
                  </div>
                  <div class="text-2xl font-semibold ">
                    Bs. {{ slotProps.data.precio }} 
                  </div>
                  <div class="flex items-center space-x-3 pt-3 pb-3">
                    <Button
                      icon="pi pi-external-link"
                      severity="contrast"
                      raised
                      label="Ver más"
                      class="flex-auto whitespace-nowrap text-base py-3 px-4"
                      @click="accederCurso(slotProps.data.idCurso)"
                    ></Button>

                    <Button
                      rounded
                      
                      text raised
                      outlined
                      severity="success"
                      
                      
                      v-tooltip.top="{
                        value: 'Añadir a la cesta',
                        showDelay: 0,
                        hideDelay: 100,
                      }"
                    >
                      <span class="pi pi-cart-arrow-down" style="font-size: x-large" @click="añadirACesta(slotProps.data.idCurso)"></span>
                    </Button>
                  </div>
                </div>
              </div>
            </template>
          </Carousel>
        </Fieldset>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";

const anuncios = ref([]);
const cursos = ref([]);
const busquedaAnuncios = ref("");
const busqueda = ref("");
const especialidadSeleccionada = ref(null);
const responsiveOptions = ref([
  { breakpoint: "1400px", numVisible: 4, numScroll: 1 },
  { breakpoint: "1199px", numVisible: 2, numScroll: 1 },
  { breakpoint: "767px", numVisible: 2, numScroll: 1 },
  { breakpoint: "575px", numVisible: 1, numScroll: 1 },
]);
const toast = useToast();

const authStore = useAuthStore();
const usuario = authStore.usuario.id;
const router = useRouter();
const especialidades = ref([]);
const añadirACesta = async (idCurso) => {
  try {
    // Obtener los detalles del curso desde el servidor
    const cursoDetalles = await authStore.cargarCursos([idCurso]);

    // Obtener el carrito del localStorage
    let carrito = JSON.parse(localStorage.getItem(`carrito_${authStore.usuario.id}`)) || [];

    // Verificar si el curso ya está en el carrito
    const existeCurso = carrito.some(curso => curso.idCurso === idCurso);

    if (existeCurso) {

      console.log("El curso ya está en el carrito.");
      toast.add({
      severity: "info",
      summary: "Carrito",
      detail: "El curso ya está en el carrito.",
      life: 3000
    });
      return; // No añadir el curso si ya está presente
    }

    // Añadir los detalles del nuevo curso al carrito
    carrito.push(cursoDetalles[0]); // Añade el curso obtenido desde el endpoint

    // Guardar el carrito actualizado en el localStorage
    localStorage.setItem(`carrito_${authStore.usuario.id}`, JSON.stringify(carrito));

    console.log("Curso añadido al carrito:", cursoDetalles[0]);
      toast.add({
      severity: "success",
      summary: "Carrito",
      detail: "El curso se ha añadido al carrito.",
      life: 3000
    });
  } catch (error) {
    console.error("Error al añadir curso a la cesta:", error);
  }
};
// Función para obtener los anuncios
const obtenerAnuncios = async () => {
  try {
    const response = await api.get("/anuncios/anuncio"); // Cambia esta ruta según tu API
    anuncios.value = response.data;
  } catch (err) {
    console.error("Error al cargar los anuncios:", err);
  }
};

// Función para obtener los cursos
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
  router.push(`/panelEstudiante/verMasCurso/${idCurso}`);
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
  return cursos.value.filter((curso) =>
    curso.titulo.toLowerCase().includes(busqueda.value.toLowerCase())
  );
});

// Computed para manejar los anuncios filtrados
const anunciosFiltrados = computed(() => {
  return anuncios.value.filter((anuncio) =>
    anuncio.titulo.toLowerCase().includes(busquedaAnuncios.value.toLowerCase())
  );
});

// Cargar los datos al montar el componente
onMounted(() => {
  obtenerAnuncios();
  obtenerCursos();
});
</script>

<style scoped></style>
