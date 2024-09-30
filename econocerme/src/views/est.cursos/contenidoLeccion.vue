<template>
    <div  class="card min-h-screen flex flex-col p-6 lg:p-12 bg-gray-100">
      <!-- Título de la Lección -->
      <div class="mb-8">
        <h1 class="text-3xl lg:text-4xl font-bold  mb-4">{{ leccion.tituloSeccion }}</h1>
        <p class="text-sm text-gray-500">Última actualización: {{ formatearFecha(leccion.ultimaActualizacion) }}</p>
      </div>
      
      <!-- Video -->
       <div class="card rounded-lg shadow-lg">
      <div class="aspect-w-16 aspect-h-9 mb-8 rounded-lg shadow-lg">
        <video
          v-if="leccion.videoURL"
          :src="leccion.videoURL"
          controls
          class="w-full h-full rounded-lg shadow-lg"
        >
          Tu navegador no soporta la reproducción de videos.
        </video>
        <p v-else class="text-center text-gray-500">El video no está disponible.</p>
      </div>
       </div>
  
      <!-- Descripción de la Lección -->
      <div class="card flex-grow bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 class="text-2xl font-semibold mb-4">Descripción</h2>
        <p v-html="leccion.descripcion"></p>
      </div>
  
      <!-- Sección de Navegación del Curso -->
      <div class="card flex flex-col lg:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <Button label="Lección Anterior" icon="pi pi-arrow-left" class="p-button-outlined mb-4 lg:mb-0" />
        <Button label="Lección Siguiente" icon="pi pi-arrow-right" iconPos="right" class="p-button-outlined" />
      </div>

      
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import api from '@/axiosConfig.js';
  
  export default {
    setup() {
      const route = useRoute();
      const idLeccion = ref(route.params.idLeccion);
      const leccion = ref({});
  
      const cargarLeccion = async () => {
        try {
          const response = await api.get(`/lecciones/obtenerLeccion/${idLeccion.value}`);
          leccion.value = response.data;
        } catch (error) {
          console.error("Error al cargar la lección:", error);
        }
      };
  
      const formatearFecha = (fecha) => {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
      };
  
      onMounted(() => {
        cargarLeccion();
      });
  
      watch(() => route.params.idLeccion, (nuevoValor) => {
        idLeccion.value = nuevoValor;
        cargarLeccion();
      });
  
      return { idLeccion, leccion, formatearFecha };
    },
  };
  </script>
  