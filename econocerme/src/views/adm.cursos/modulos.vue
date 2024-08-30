<!-- src/views/Modulos.vue -->
<template>
  <div class="p-4">
    <!-- Botón de "Volver" -->
    <button
      @click="volverACursos"
      class="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
    >
      ← Volver a Cursos
    </button>

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
        <h3 class="text-xl mb-4">{{ moduloSeleccionado ? 'Editar Módulo' : 'Añadir Módulo' }}</h3>
        <div class="mb-4">
          <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
          <input
            v-model="moduloForm.nombre"
            type="text"
            id="nombre"
            name="nombre"
            class="block w-full px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="mb-4">
          <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">Descripción:</label>
          <textarea
            v-model="moduloForm.descripcion"
            id="descripcion"
            name="descripcion"
            class="block w-full px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div class="mb-4">
          <label for="videoURL" class="block text-sm font-medium text-gray-700 mb-1">URL del Video:</label>
          <input
            v-model="moduloForm.videoURL"
            type="text"
            id="videoURL"
            name="videoURL"
            class="block w-full px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="mb-4">
          <label for="contenidoExtra" class="block text-sm font-medium text-gray-700 mb-1">Contenido Extra:</label>
          <textarea
            v-model="moduloForm.contenidoExtra"
            id="contenidoExtra"
            name="contenidoExtra"
            class="block w-full px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div class="flex justify-end">
          <button @click="cerrarModal()" class="px-4 py-2 bg-gray-300 rounded mr-2 hover:bg-gray-400">Cancelar</button>
          <button @click="guardarModulo()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      curso: {},
      modulos: [],
      mostrarModal: false,
      moduloSeleccionado: null,
      moduloForm: {
        nombre: '',
        descripcion: '',
        videoURL: '',
        contenidoExtra: ''
      }
    };
  },
  created() {
    this.cargarCurso();
    this.cargarModulos();
  },
  methods: {
    cargarCurso() {
      const cursoId = this.$route.params.cursoId;
      // Aquí debes cargar los detalles del curso desde tu API o base de datos
      this.curso = {
        id: cursoId,
        titulo: 'Curso de Vue.js',
        // Otros atributos del curso
      };
    },
    cargarModulos() {
      const cursoId = this.$route.params.cursoId;
      // Aquí debes cargar los módulos del curso seleccionado desde tu API o base de datos
      this.modulos = [
        { id: 1, nombre: 'Módulo 1', descripcion: 'Descripción del módulo 1', videoURL: '', contenidoExtra: '' },
        { id: 2, nombre: 'Módulo 2', descripcion: 'Descripción del módulo 2', videoURL: '', contenidoExtra: '' },
        { id: 3, nombre: 'Módulo 3', descripcion: 'Descripción del módulo 3', videoURL: '', contenidoExtra: '' },
        // Otros módulos
      ];
    },
    abrirModal(modulo = null) {
      this.moduloSeleccionado = modulo;
      if (modulo) {
        this.moduloForm = { ...modulo };
      } else {
        this.moduloForm = { nombre: '', descripcion: '', videoURL: '', contenidoExtra: '' };
      }
      this.mostrarModal = true;
    },
    cerrarModal() {
      this.mostrarModal = false;
      this.moduloForm = { nombre: '', descripcion: '', videoURL: '', contenidoExtra: '' };
      this.moduloSeleccionado = null;
    },
    guardarModulo() {
      if (this.moduloSeleccionado) {
        // Aquí debes actualizar el módulo en tu API o base de datos
      } else {
        // Aquí debes crear un nuevo módulo en tu API o base de datos
        this.modulos.push({ ...this.moduloForm, id: this.modulos.length + 1 });
      }
      this.cerrarModal();
    },
    volverACursos() {
      this.$router.push('/panelControl/modulos');
    }
  }
};
</script>

<style scoped>
/* Estilos específicos para este componente */
</style>
