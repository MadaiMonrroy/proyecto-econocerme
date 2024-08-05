<template>
  <div class="p-4">
    <!-- Botón de "Volver" -->
    <button
      @click="volverACursos"
      class="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
    >
      ← Volver a Cursos
    </button>
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <img
          src="/src/assets/avatar.png"
          alt="Logo"
          class="w-12 h-12 rounded-full"
        />
        <h1 class="ml-4 text-2xl font-bold">Desarrolla Tu Esencia</h1>
        <span
          class="ml-2 bg-yellow-200 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
          >Borrador</span
        >
      </div>
      <div>
        <button class="text-gray-600">Observa cómo está quedando</button>
      </div>
    </div>

    <div
      class="mt-4 p-4 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-md"
    >
      Este producto no está publicado. Para saber más, accede al panel del
      producto y sigue las instrucciones.
      <a href="#" class="text-yellow-800 underline">Panel de producto</a>
    </div>

    <nav class="mt-4">
      <ul class="flex space-x-4 border-b">
        <!-- Navegación de pestañas -->
        <li><a href="#" @click.prevent="irARuta('/panelControl/contenido')" class="text-blue-600 pb-2 border-b-2 border-blue-600">Contenido</a></li>
        <li><a href="#" @click.prevent="irARuta('/panelControl/configuraciones')" class="text-gray-600 hover:text-blue-600">Configuraciones</a></li>
        <li><a href="#" @click.prevent="irARuta('/panelControl/personalizacion')" class="text-gray-600 hover:text-blue-600">Personalización</a></li>
        <li><a href="#" @click.prevent="irARuta('/panelControl/certificado')" class="text-gray-600 hover:text-blue-600">Certificado</a></li>
        <li><a href="#" @click.prevent="irARuta('/panelControl/usuarios')" class="text-gray-600 hover:text-blue-600">Inscritos</a></li>
        <li><a href="#" @click.prevent="irARuta('/panelControl/grupos')" class="text-gray-600 hover:text-blue-600">Grupos</a></li>
        <li><a href="#" @click.prevent="irARuta('/panelControl/comentarios')" class="text-gray-600 hover:text-blue-600">Comentarios</a></li>
        <li><a href="#" @click.prevent="irARuta('/panelControl/comunidades')" class="text-gray-600 hover:text-blue-600">Comunidades</a></li>
        <li><a href="#" @click.prevent="irARuta('/panelControl/registro-gratuito')" class="text-gray-600 hover:text-blue-600">Registro gratuito</a></li>
        <li><a href="#" @click.prevent="irARuta('/panelControl/vitrina')" class="text-gray-600 hover:text-blue-600">Vitrina</a></li>
      </ul>
    </nav>

    <!-- Título del curso -->
    <h2 class="text-2xl mb-4">{{ curso.titulo }}</h2>

    <!-- Botón para añadir módulo -->
    <button
      @click="abrirModal()"
      class="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
    >
      Añadir Módulo
    </button>

    <!-- Lista de módulos -->
    <div class="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="modulo in modulos"
        :key="modulo.id"
        class="bg-white rounded-lg shadow-md p-4"
      >
        <h3 class="text-lg font-semibold mb-2">{{ modulo.nombre }}</h3>
        <p class="text-gray-600 mb-4">{{ modulo.descripcion }}</p>
        <button
          @click="abrirModal(modulo)"
          class="text-blue-500 hover:underline"
        >
          Ver detalles
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg shadow-md p-6 w-11/12 md:w-1/2 lg:w-1/3">
        <h3 class="text-xl mb-4">
          {{ moduloSeleccionado ? "Editar Módulo" : "Añadir Módulo" }}
        </h3>
        <div class="mb-4">
          <label
            for="nombre"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Nombre:</label
          >
          <input
            v-model="moduloForm.nombre"
            type="text"
            id="nombre"
            name="nombre"
            class="block w-full px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="mb-4">
          <label
            for="descripcion"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Descripción:</label
          >
          <textarea
            v-model="moduloForm.descripcion"
            id="descripcion"
            name="descripcion"
            class="block w-full px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div class="mb-4">
          <label
            for="videoURL"
            class="block text-sm font-medium text-gray-700 mb-1"
            >URL del Video:</label
          >
          <input
            v-model="moduloForm.videoURL"
            type="text"
            id="videoURL"
            name="videoURL"
            class="block w-full px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="mb-4">
          <label
            for="contenidoExtra"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Contenido Extra:</label
          >
          <textarea
            v-model="moduloForm.contenidoExtra"
            id="contenidoExtra"
            name="contenidoExtra"
            class="block w-full px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div class="flex justify-end">
          <button
            @click="cerrarModal()"
            class="px-4 py-2 bg-gray-300 rounded mr-2 hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            @click="guardarModulo()"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from "@/stores/authStore";
import api from '@/axiosConfig.js'

export default {
  setup() {
    const authStore = useAuthStore();
    const route = useRoute(); // Correct usage of useRoute
    const router = useRouter();
    const token = authStore.token;

    const curso = ref({});
    const modulos = ref([]);
    const mostrarModal = ref(false);
    const moduloSeleccionado = ref(null);
    const moduloForm = ref({
      nombre: "",
      descripcion: "",
      videoURL: "",
      contenidoExtra: "",
    });

    const cargarCurso = async () => {
      const cursoId = route.params.idCurso; // Use route.params
      if (cursoId) {
        curso.value = {
          id: cursoId,
          titulo: "Curso de Vue.js", // Fetch actual data here
        };
      }
    };

    const cargarModulos = async () => {
      const cursoId = route.params.idCurso; // Use route.params
      if (cursoId) {
        try {
          const response = await api.get(`/modulos/modulo/${cursoId}`);
          modulos.value = response.data;
        } catch (error) {
          console.error('Error al cargar los módulos:', error);
        }
      }
    };

    const abrirModal = (modulo = null) => {
      moduloSeleccionado.value = modulo;
      if (modulo) {
        moduloForm.value = { ...modulo };
      } else {
        moduloForm.value = {
          nombre: "",
          descripcion: "",
          videoURL: "",
          contenidoExtra: "",
        };
      }
      mostrarModal.value = true;
    };

    const cerrarModal = () => {
      mostrarModal.value = false;
      moduloForm.value = {
        nombre: "",
        descripcion: "",
        videoURL: "",
        contenidoExtra: "",
      };
      moduloSeleccionado.value = null;
    };

    const guardarModulo = () => {
      if (moduloSeleccionado.value) {
        // Aquí debes actualizar el módulo en tu API o base de datos
      } else {
        modulos.value.push({ ...moduloForm.value, id: modulos.value.length + 1 });
      }
      cerrarModal();
    };

    const volverACursos = () => {
      router.push("/panelControl/cursos");
    };

    onMounted(() => {
      const { idCurso } = route.params;
      if (idCurso) {
        cargarCurso();
        cargarModulos();
      } else {
        console.error('No se encontró idCurso en la ruta actual');
      }
    });

    return {
      curso,
      modulos,
      mostrarModal,
      moduloSeleccionado,
      moduloForm,
      cargarCurso,
      cargarModulos,
      abrirModal,
      cerrarModal,
      guardarModulo,
      volverACursos,
      irARuta: router.push,
    };
  },
};
</script>

<style scoped>
/* Estilos específicos para este componente */
</style>
