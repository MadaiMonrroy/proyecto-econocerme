<template>
    <div  class="card min-h-screen flex flex-col p-6 lg:p-12 bg-gray-100">
      <!-- Título de la Lección -->
      <div class="mb-8">
        <h1 class="text-3xl lg:text-4xl font-bold  mb-4 ">{{ modulo.nombre }}</h1>
        <p class="text-sm text-gray-500">Última actualización: {{ formatearFecha(modulo.ultimaActualizacion) }}</p>
      </div>
      
      <!-- Video -->
       <div class="card rounded-lg shadow-lg">
      <div class="aspect-w-16 aspect-h-9 mb-8 rounded-lg shadow-lg">
        <video
          v-if="modulo.videoIntroURL"
          :src="modulo.videoIntroURL"
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
        <p v-html="modulo.descripcion"></p>
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
      const idModulo = ref(route.params.idModulo);
      const modulo = ref({});
  
      const cargarModulo = async () => {
        try { 
          const response = await api.get(`/modulos/obtenerModulo/${idModulo.value}`);
          modulo.value = response.data;
          console.log(response)
        } catch (error) {
          console.error("Error al cargar la lección:", error);
        }
      };
  
      const formatearFecha = (fecha) => {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
      };
  
      onMounted(() => {
        cargarModulo();
        console.log("ya entre")
      });
  
      watch(() => route.params.idModulo, (nuevoValor) => {
        idModulo.value = nuevoValor;
        cargarModulo();
      });
  
      return { idModulo, modulo, formatearFecha };
    },
  };
  </script>
  