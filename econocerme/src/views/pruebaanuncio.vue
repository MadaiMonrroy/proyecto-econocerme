<template>
    <div class="p-4">
      <h2 class="text-2xl mb-4">{{ anuncio.id ? 'Editar Anuncio' : 'Agregar Nuevo Anuncio' }}</h2>
      <form @submit.prevent="anuncio.id ? actualizarAnuncio() : agregarAnuncio()">
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label for="titulo" class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input v-model="datasuser.titulo" type="text" id="titulo" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ingrese título" required>
            
         </div>
          <div>
            <label for="miniatura" class="block text-sm font-medium text-gray-700 mb-1">Miniatura</label>
            <input @change="handleFileUpload($event, 'miniatura')" type="file" id="miniatura" accept="image/*" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <div v-if="datasuser.miniatura" class="mt-2">
              <img :src="datasuser.miniatura" alt="Miniatura" class="h-16 w-16 object-cover rounded">
            </div>
          </div>
          <div>
            <h1>dsfsdf</h1>
            <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <Editor v-model="datasuser.descripcion"  id="descripcion" editorStyle="height: 320px" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" rows="4" placeholder="Ingrese descripción"/>

        </div>
          <div>
            <label for="fecha_inicio" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
            <input v-model="datasuser.fecha_inicio" type="date" id="fecha_inicio" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
          </div>
          <div>
            <label for="fecha_fin" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
            <input v-model="datasuser.fecha_fin" type="date" id="fecha_fin" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
          </div>
          <div>
            <label for="tipo" class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <input v-model="datasuser.tipo" type="text" id="tipo" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ingrese tipo" required>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button type="submit" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">{{ anuncio.id ? 'Guardar' : 'Agregar' }}</button>
          <button type="button" @click="cancelarEdicion" class="inline-block ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancelar</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter, useRoute } from 'vue-router';
  
  const route = useRoute();
  const router = useRouter();

  datasuser = ref('');

  const anuncio = reactive({
    id: null,
    titulo: '',
    miniatura: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo: '',
  });
  
  const handleFileUpload = (event, field) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        anuncio[field] = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const cargarAnuncio = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/anuncios/obtenerAnuncio/${id}`);
      datasuser.value = response.data;
      console.log(datasuser.value);

    } catch (error) {
      console.error(error);
      // Manejar el error de forma adecuada
    }
  };
  
  const actualizarAnuncio = async () => {
    try {
      await axios.put(`http://localhost:3000/api/anuncios/editarAnuncio${anuncio.id}`, anuncio);
      router.push('/panelControl/anuncios');
    } catch (error) {
      console.error(error);
      // Manejar el error de forma adecuada
    }
  };
  
  const agregarAnuncio = async () => {
    try {
      await axios.post(`http://localhost:3000/api/anuncios`, anuncio);
      router.push('/panelControl/anuncios');
    } catch (error) {
      console.error(error);
      // Manejar el error de forma adecuada
    }
  };
  
  const cancelarEdicion = () => {
    router.push('/panelControl/anuncios');
  };
  
  onMounted(() => {
    const { id } = route.params;
    if (id) {
      cargarAnuncio(id);
    }
  });
  </script>
  