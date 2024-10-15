<template>
  <div class="pt-7">
    <div class="card flex flex-col items-center justify-center">
      <div
        class="card w-full dark:shadow-2xl dark:shadow-violet-900 shadow-2xl !border-none"
      >
        <!-- Breadcrumb -->
        <Breadcrumb
          :home="home"
          :model="items"
          class="h-14 dark:shadow-violet-800"
        />

        <div class="flex justify-between items-center p-4">
          <div class="md:w-40 relative">
            <Image
              class="block xl:block mx-auto rounded w-full"
              :src="curso.miniatura"
              alt="Imagen del curso"
            />
          </div>
          <!-- Información del curso -->
          <div>
            <h1 class="text-3xl">Curso de</h1>
            <h1 class="text-5xl font-bold mb-4">{{ curso.titulo }}</h1>
          </div>

          <!-- Detalles del curso -->
          <div
            class="bg-white dark:border dark:border-violet-800 transform hover:scale-105 transition-all duration-300 dark:bg-violet-950 p-4 m-2 rounded-xl dark:shadow-2xl dark:shadow-violet-900 shadow-2xl flex flex-col items-start"
          >
            <div class="flex items-center mb-5">
              <span
                class="pi pi-clock pi-8x pr-2"
                style="font-size: x-large"
              ></span>

              <p class="pr-2">Carga Horaria:</p>
              <strong> {{ curso.duracion }} h </strong>
            </div>
            <div class="flex items-center mb-5">
              <span
                class="pi pi-money-bill pi-8x pr-2"
                style="font-size: x-large"
              ></span>
              <p class="pr-2">Precio:</p>
              <strong> {{ curso.precio }} Bs. </strong>
            </div>
            <p class="flex items-center mb-5">
              <span
                class="pi pi-refresh pi-8x pr-2"
                style="font-size: x-large"
              ></span>
              Última actualización: {{ curso.ultimaActualizacion }}
            </p>
          </div>
        </div>
      </div>

      <!-- Grid con módulos a la izquierda y detalles del usuario/coach a la derecha -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 w-full mt-8 pt-4">
        <!-- Listado de módulos (Columna izquierda - ocupa más espacio) -->
        <div class="md:col-span-8 w-full">
          <div
            class="card dark:shadow-2xl dark:shadow-violet-900 shadow-2xl !border-none"
          >
            <h2 class="text-2xl font-bold mb-4">Sobre el Curso</h2>

            <p class="text-lg text-gray-700 dark:text-gray-300">
              {{ curso.descripcion }}
            </p>
          </div>
          <div
            class="card dark:shadow-2xl dark:shadow-violet-900 shadow-2xl !border-none"
          >
            <h2 class="text-2xl font-bold mb-4">Contenido del curso</h2>
            <Accordion>
              <AccordionPanel
                v-for="modulo in modulos"
                :key="modulo.nombreModulo"
                :value="modulo.nombreModulo"
              >
                <AccordionHeader>{{ modulo.nombreModulo }}</AccordionHeader>
                <AccordionContent>
                  <div class="card flex flex-wrap gap-12 !border-none">
                    <Timeline
                      :value="
                        modulo.lecciones.map((leccion, index) => ({
                          status: leccion,
                        }))
                      "
                      class="!-ml-[800px] w-full md:w-80"
                    >
                      <template #content="slotProps">
                        <div class="">
                          <!-- Margen específico para cada item -->
                          <div class="py-0">
                            <!-- Espacio vertical para cada item -->
                            {{ slotProps.item.status }}
                          </div>
                        </div>
                      </template>
                    </Timeline>
                  </div>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </div>
        </div>

        <!-- Detalles del usuario/coach (Columna derecha - ocupa menos espacio) -->
        <div
          class="card shadow-2xl !border-none w-full p-6 md:col-span-4 bg-white rounded-xl transform hover:scale-105 transition-all duration-300 dark:shadow-2xl dark:shadow-violet-900"
        >
          <div
            v-if="usuario.tipoUsuario === 'coach'"
            class="w-full flex flex-col items-center"
          >
            <!-- Foto de perfil -->
            <div
              class="relative rounded-full w-32 h-32 mb-4 overflow-hidden border-4 border-violet-600"
            >
              <img
                class="absolute inset-0 object-cover w-full h-full"
                :src="usuario.fotoPerfil"
                alt="Foto del Coach"
              />
            </div>

            <!-- Nombre del Coach -->
            <h2 class="text-2xl font-semibold mb-2">
              {{ usuario.nombres }} {{ usuario.primerApellido }}
              {{ usuario.segundoApellido }}
            </h2>

            <!-- Especialidad -->
            <div
              class="text-lg font-medium text-gray-700 mb-2 flex justify-center max-w-80"
            >
              <div class="flex flex-wrap justify-center items-center space-x-2">
                <!-- Iterar sobre las especialidades y renderizar un Tag para cada una -->
                <Tag
                  v-for="(item, index) in usuario.especialidad"
                  :key="index"
                  severity="info"
                  class="m-1"
                >
                  {{ item }}
                </Tag>
              </div>
            </div>

            <!-- Biografía -->
            <div>
              <span
                class="text-violet-500 justify-items-center font-semibold font-sans"
                >Sobre mí</span
              >
              <p class="leading-relaxed mb-6 mt-3 text-left w-full">
                {{ usuario.biografia }}
              </p>
            </div>

            <!-- Experiencia -->
            <div class="mb-4">
              <Editor
                v-model="usuario.experiencia"
                editorStyle="auto"
                :headerTemplate="null"
                readonly
                :toolbar="false"
              >
                <template v-slot:toolbar>
                  <span class="ql-formats">
                    <span
                      class="text-violet-500 justify-items-center font-semibold font-sans"
                      >Experiencia previa:</span
                    >
                  </span>
                </template>
              </Editor>
            </div>
            <!-- Botón de contacto con validación de email -->
            <a
              v-if="usuario.email && usuario.email !== 'undefined'"
              :href="'mailto:' + usuario.email"
              class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300"
            >
              Contactar <i class="pi pi-envelope"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/axiosConfig.js";
import DOMPurify from "dompurify";

const router = useRouter();
const route = useRoute();
const idCurso = route.params.idCurso;
const curso = ref({});
const usuario = ref({});
const modulos = ref([]);
const error = ref(null);
const home = ref({
  label: "",
  icon: "pi pi-th-large",
  route: `/panelEstudiante/verMasCurso/${idCurso}`,
});
const items = ref([
  {
    label: "",
    icon: "pi pi-slack",
    route: `/panelEstudiante/verMasCurso/${idCurso}`,
  },
]);
const obtenerCursoCompleto = async (idCurso) => {
  try {
    const { data } = await api.get(
      `/misCursos/obtenerCursoCompleto/${idCurso}`
    );
    curso.value = data.curso;
    usuario.value = data.usuario;
    modulos.value = data.modulos;
    // Actualizar la propiedad 'home' después de que el curso se haya cargado
    home.value.label = curso.value.especialidadCurso;
    items.value[0].label = curso.value.titulo;

    console.log(data.curso);
  } catch (err) {
    error.value = "Error al obtener los datos del curso";
    console.error(err);
  }
};
const sanitizedExperience = computed(() => {
  if (usuario.value.experiencia) {
    const sanitized = DOMPurify.sanitize(usuario.value.experiencia, {
      ALLOWED_TAGS: ["ul", "ol", "li", "p"], // Asegúrate de permitir etiquetas necesarias
      FORBID_ATTR: ["style"],
    });
    return sanitized;
  }
  return ""; // Devuelve una cadena vacía si no hay experiencia.
});

onMounted(() => {
  const idCurso = route.params.idCurso; // Asegúrate de capturar el idCurso de la ruta
  obtenerCursoCompleto(idCurso);
});
</script>

<style>
/* Aquí puedes agregar estilos adicionales si es necesario */
</style>
