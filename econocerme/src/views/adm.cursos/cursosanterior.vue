<template>
    <div class="flex justify-center items-center  p-2 ">
      <div class="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-6 text-center">{{ curso.idCurso ? 'Editar Curso' : 'Agregar Nuevo Curso' }}</h2>
        <form @submit.prevent="curso.idCurso ? actualizarCurso() : agregarCurso()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Lado izquierdo -->
            <div class="space-y-4">
              <div>
                <label for="titulo" class="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <InputText
                  v-model="curso.titulo"
                  type="text"
                  id="titulo"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ingrese título"
                  required
                />
              </div>
  
              <div>
                <label for="autor" class="block text-sm font-medium text-gray-700 mb-2">Autor</label>
                <inputText
                  v-model="curso.autor"
                  type="text"
                  id="autor"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ingrese autor"
                />
              </div>
  
              <div>
                <label for="especialidad" class="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                <InputText
                  v-model="curso.especialidad"
                  type="text"
                  id="especialidad"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ingrese especialidad"
                />
              </div>
  
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="duracion" class="block text-sm font-medium text-gray-700 mb-2">Duración (horas)</label>
                  <InputNumber
                    v-model="curso.duracion"
                    inputId="duracion"
                    mode="decimal"
                    step="0.5"
                    min="0"
                    class="w-full"
                    :formatter="formatHours"
                    :unformatter="parseHours"
                    showButtons
                  />
                </div>
  
                <div>
                  <label for="precio" class="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                  <InputNumber
                    v-model="curso.precio"
                    inputId="precio"
                    mode="currency"
                    currency="BOB"
                    class="w-full"
                    placeholder="Ingrese precio"
                    :formatter="formatPrice"
                    :unformatter="parsePrice"
                    showButtons
                  />
                </div>
              </div>
  
              <div>
                <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  v-model="curso.descripcion"
                  id="descripcion"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="4"
                  placeholder="Ingrese descripción"
                  required
                />
              </div>
            </div>
  
            <!-- Lado derecho -->
            <div>
              <CustomFileInput
                id="miniatura"
                label="Miniatura"
                v-model="curso.miniatura"
                @change="onFileChange"
              />
            </div>
          </div>
  
          <div class="mt-6 flex justify-end space-x-4">
            <button
              type="submit"
              class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {{ curso.idCurso ? 'Guardar' : 'Agregar' }}
            </button>
            <button
              type="button"
              @click="cancelarEdicion"
              class="inline-block px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  <script setup>
  import { reactive, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter, useRoute } from 'vue-router';
  import InputNumber from 'primevue/inputnumber'; // Asegúrate de que InputNumber está importado
  import CustomFileInput from '@/components/CustomFileInput.vue';
  
  const route = useRoute();
  const router = useRouter();
  
  const curso = reactive({
    idCurso: null,
    titulo: '',
    miniatura: '',
    autor: '',
    especialidad: '',
    descripcion: '',
    duracion: '',
    precio: '',
  });
  
  const onFileChange = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
  
    formData.append('miniatura', new File([file], 'nombre.png', { type: file.type }));
  
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      curso.miniatura = 'image-url.png'; // URL fija
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    }
  };
  
  
  
  const agregarCurso = async () => {
    try {
      await axios.post(`http://localhost:3000/api/cursos/agregarCurso`, {
        ...curso,
        miniatura: 'image-url.png', // URL fija
      });
      router.push('/panelControl/cursos');
    } catch (error) {
      console.error(error);
    }
  };
  
  const cargarCurso = async (idCurso) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/cursos/obtenerCurso/${idCurso}`);
      Object.assign(curso, response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  const actualizarCurso = async () => {
    try {
      await axios.put(`http://localhost:3000/api/cursos/editarCurso/${curso.idCurso}`, curso);
      router.push('/panelControl/cursos');
    } catch (error) {
      console.error(error);
    }
  };
  
  const cancelarEdicion = () => {
    router.push('/panelControl/cursos');
  };
  
  onMounted(() => {
    const { idCurso } = route.params;
    if (idCurso) {
      cargarCurso(idCurso);
    }
  });
  </script>
  
  