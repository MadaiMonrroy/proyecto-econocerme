<!-- src/views/ListaCursos.vue -->
<template>
    <div class="p-4">
      <h2 class="text-2xl mb-4">Cursos</h2>
      <div class="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="curso in cursos"
          :key="curso.id"
          class="card bg-white rounded-lg shadow-md p-4"
        >
          <h3 class="text-lg font-semibold mb-2">{{ curso.titulo }}</h3>
          <p class="text-gray-600 mb-2">{{ curso.descripcion }}</p>
          <router-link
            :to="'/panelControl/modulos/' + curso.id"
            class="text-blue-500 hover:underline"
            >Seleccionar curso</router-link
          >
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        cursos: [
          { id: 1, titulo: 'Curso de Vue.js', descripcion: 'Aprende Vue.js desde cero.' },
          { id: 2, titulo: 'Curso de Node.js', descripcion: 'Aprende Node.js y construye aplicaciones robustas.' },
          { id: 3, titulo: 'Curso de UI/UX', descripcion: 'Aprende diseño UI/UX y mejora la experiencia de usuario.' },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  /* Estilos específicos para este componente */
  </style>
  