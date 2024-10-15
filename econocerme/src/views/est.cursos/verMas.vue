<template>
  <div class="pt-7">
    <div class="card flex flex-col items-center  justify-center">
      <div class="card w-full dark:shadow-2xl dark:shadow-violet-900 shadow-2xl !border-none">
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
            class="bg-white  dark:border dark:border-violet-800  transform hover:scale-105 transition-all duration-300  dark:bg-violet-950 p-4 m-2 rounded-xl dark:shadow-2xl dark:shadow-violet-900 shadow-2xl flex flex-col items-start"
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
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 w-full mt-8 pt-4 ">
        
        <!-- Listado de módulos (Columna izquierda - ocupa más espacio) -->
        <div class=" md:col-span-8 w-full">
            <div class="card  dark:shadow-2xl dark:shadow-violet-900 shadow-2xl  !border-none">
                <h2 class="text-2xl font-bold mb-4">Sobre el Curso</h2>

            <p class="text-lg text-gray-700 dark:text-gray-300">
              {{ curso.descripcion }}
            </p>
        </div>
        <div class="card  dark:shadow-2xl dark:shadow-violet-900 shadow-2xl  !border-none">
            <h2 class="text-2xl font-bold mb-4">Módulos</h2>
          <ul>
            <li
              v-for="modulo in modulos"
              :key="modulo.nombreModulo"
              class="mb-2"
            >
              <div class="bg-white p-4 rounded-lg shadow-lg">
                <h3 class="text-lg font-bold">{{ modulo.nombreModulo }}</h3>
                <p>Lección: {{ modulo.lecciones }}</p>
              </div>
            </li>
          </ul>
        </div>
        </div>

        <!-- Detalles del usuario/coach (Columna derecha - ocupa menos espacio) -->
        <div
          class="card shadow-2xl  !border-none  w-full p-6 md:col-span-4 bg-white rounded-xl  transform hover:scale-105 transition-all duration-300 dark:shadow-2xl dark:shadow-violet-900"
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
            <h2 class="text-2xl font-semibold text-violet-600 mb-2">
              {{ usuario.nombres }} {{ usuario.primerApellido }}
              {{ usuario.segundoApellido }}
            </h2>

            <!-- Especialidad -->
            <Message
              severity="info"
              class="text-lg font-medium text-gray-700 mb-2"
            >
              <span class="text-violet-500">Especialidad:</span>

              <Tag severity="help"> {{ usuario.especialidad }} </Tag>
            </Message>

            <!-- Experiencia -->
            <div class="text-lg font-medium mb-4">
              <span class="text-violet-500">Experiencia:</span>
              {{ usuario.experiencia }}
            </div>

            <!-- Biografía -->
            <p class="leading-relaxed mb-6 text-left w-full">
              {{ usuario.biografia }}
            </p>

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

      <!-- Botones de acciones -->
      <div class="w-full max-w-5xl flex justify-start mt-8">
        <button
          @click="iniciarCurso"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg mr-4"
        >
          Iniciar Curso
        </button>
        <button
          @click="toggleAcciones"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
        >
          Otras acciones
          <span class="material-icons ml-2">expand_more</span>
        </button>
        <div
          v-if="mostrarAcciones"
          class="absolute bg-white shadow-lg rounded-lg mt-2 w-48 text-left"
        >
          <ul class="text-gray-800">
            <li class="py-2 px-4 hover:bg-gray-100 cursor-pointer">
              Ver Detalles
            </li>
            <li class="py-2 px-4 hover:bg-gray-100 cursor-pointer">
              Agregar a Favoritos
            </li>
            <li class="py-2 px-4 hover:bg-gray-100 cursor-pointer">
              Compartir
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/axiosConfig.js";

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

onMounted(() => {
  const idCurso = route.params.idCurso; // Asegúrate de capturar el idCurso de la ruta
  obtenerCursoCompleto(idCurso);
});
</script>

<style>
/* Aquí puedes agregar estilos adicionales si es necesario */
</style>
