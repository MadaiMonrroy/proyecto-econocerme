<template>
  <div class="flex justify-center items-center p-7">
    <div class=" card p-6 max-w-4xl mx-auto bg-white bg-opacity-40 shadow-md rounded-lg">
      <Toast />
      <h2 class="text-2xl font-semibold mb-6">
        {{ anuncio.id ? "Editar Anuncio" : "Agregar Nuevo Anuncio" }}
      </h2>
      <form @submit.prevent="anuncio.id ? actualizarAnuncio() : agregarAnuncio()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Parte izquierda: Campos del formulario -->
          <div class="space-y-6">
            <div>
              <label for="titulo">Título</label>
              <InputText 
                v-model="anuncio.titulo"
                type="text"
                id="titulo"
                class="p-inputtext block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ingrese título"
                required
              />
            </div>
            <div>
              <label for="tipo" >Tipo de Anuncio</label>
              <Select
                v-model="anuncio.tipo"
                :options="tipoOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione un tipo"
                checkmark
                id="tipo"
                :highlightOnSelect="false"
                class="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="fecha_inicio" >Fecha de Inicio</label>
                <input
                  v-model="anuncio.fecha_inicio"
                  type="date"
                  id="fecha_inicio"
                  class="block w-full text-sm border-gray-300 text-slate-950 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label for="fecha_fin" >Fecha de Fin</label>
                <input
                  v-model="anuncio.fecha_fin"
                  type="date"
                  id="fecha_fin"
                  class="block w-full from-neutral-950 text-sm text-slate-950 border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label for="descripcion" >Descripción</label>
              <textarea
                v-model="anuncio.descripcion"
                id="descripcion"
                class="block w-full text-sm border-gray-300 text-slate-950 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="4"
                placeholder="Ingrese descripción"
              />
            </div>
          </div>

          <!-- Parte derecha: Carga de imagen -->
          <div class="flex items-start">
            <div class="w-full">
              <CustomFileInput
                id="miniatura"
                label="Miniatura"
                @change="onFileChange"
              />
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4 mt-6">
          <button
            type="submit"
            class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {{ anuncio.id ? "Guardar" : "Agregar" }}
          </button>
          <button
            type="button"
            @click="cancelarEdicion"
            class="inline-block px-6 py-3 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import CustomFileInput from '@/components/CustomFileInput.vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from "@/stores/authStore";
import api from '@/axiosConfig.js'

const authStore = useAuthStore();

const toast = useToast();
const route = useRoute();
const router = useRouter();
const token = authStore.token;


const anuncio = reactive({
  id: null,
  titulo: '',
  miniatura: '',
  descripcion: '',
  fecha_inicio: '',
  fecha_fin: '',
  tipo: '',
});

let selectedFile = null;

const onFileChange = (event) => {
  selectedFile = event.target.files[0];
};

const tipoOptions = ref([
  { label: 'Seleccione un tipo', value: '' },
  { label: 'Descuento', value: 'descuento' },
  { label: 'Oferta', value: 'oferta' },
  { label: 'Nuevo Curso', value: 'nuevo curso' },
  { label: 'Curso Retirado', value: 'curso retirado' },
  { label: 'Evento Especial', value: 'evento especial' },
  { label: 'Recordatorio', value: 'recordatorio' },
  { label: 'Reconocimiento', value: 'reconocimiento' },
  { label: 'Colaboracion', value: 'colaboracion' },
  { label: 'Actualizacion de Contenido', value: 'actualizacion de contenido' },
  { label: 'Historias de Exito', value: 'historias de exito' },
  { label: 'Otro', value: 'otro' },
]);

const cargarAnuncio = async (id) => {
  try {
    const response = await api.get(`/anuncios/obtenerAnuncio/${id}`);
    const { fecha_inicio, fecha_fin, descripcion, tipo, ...rest } = response.data;
    anuncio.fecha_inicio = new Date(fecha_inicio).toISOString().split('T')[0];
    anuncio.fecha_fin = new Date(fecha_fin).toISOString().split('T')[0];
    anuncio.descripcion = descripcion;
    anuncio.tipo = tipo;
    Object.assign(anuncio, rest);
  } catch (error) {
    console.error(error);
  }
};

const actualizarAnuncio = async () => {
  const formData = new FormData();
  formData.append('titulo', anuncio.titulo);
  formData.append('tipo', anuncio.tipo);
  formData.append('fecha_inicio', anuncio.fecha_inicio);
  formData.append('fecha_fin', anuncio.fecha_fin);
  formData.append('descripcion', anuncio.descripcion);
  if (selectedFile) {
    formData.append('miniatura', selectedFile);
  }

  try {
    await api.put(`/anuncios/editarAnuncio/${anuncio.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',

      },
    });
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Anuncio actualizado correctamente', life: 1000 });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
    router.push('/panelControl/anuncios');
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el anuncio', life: 2000 });
    console.error(error);
  }
};

const agregarAnuncio = async () => {
  const formData = new FormData();
  formData.append('titulo', anuncio.titulo);
  formData.append('tipo', anuncio.tipo);
  formData.append('fecha_inicio', anuncio.fecha_inicio);
  formData.append('fecha_fin', anuncio.fecha_fin);
  formData.append('descripcion', anuncio.descripcion);
  formData.append('miniatura', selectedFile);

  try {
    await api.post('/anuncios/agregarAnuncio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',

      },
    });
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Anuncio agregado correctamente', life: 1000 });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
    router.push('/panelControl/anuncios');
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al agregar el anuncio', life: 2000 });
    console.error(error);
  }
};

const cancelarEdicion = () => {
  router.push('/panelControl/anuncios');
};

onMounted(() => {
  const id = route.params.id;
  if (id) {
    cargarAnuncio(id);
  }
});
</script>
