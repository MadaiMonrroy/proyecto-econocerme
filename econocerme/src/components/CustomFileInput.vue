<template>
  <div class="relative">
    <label :for="id" class="">{{ label }}</label>
    <div class="relative">
      <!-- Input oculto para archivos -->
      <input
        type="file"
        :id="id"
        accept="image/*"
        class="absolute inset-0 opacity-0 cursor-pointer"
        @change="handleFileChange"
        ref="fileInput"
      />
      <!-- Botón personalizado para seleccionar archivos -->
      <button
        type="button"
        class="flex items-center justify-center w-full py-2 px-4 bg-gray-200 text-gray-700 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        @click="triggerFileInput"
      >
        <svg
          class="w-5 h-5 mr-2 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4.25m0 0L9.75 10.5M12 12.25l2.25-1.75M3 12l2.5-6h15l2.5 6m-15 0v6a2 2 0 002 2h12a2 2 0 002-2v-6"
          />
        </svg>
        Elegir archivo
      </button>
      <!-- Indicador de carga -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-50 opacity-75 rounded-md">
        <svg
          class="w-6 h-6 text-gray-500 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v8m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      </div>
    </div>
    <!-- Nombre del archivo seleccionado -->
    <div v-if="fileName" class="mt-2 text-sm text-gray-600">
      Archivo seleccionado: <span class="font-medium">{{ fileName }}</span>
    </div>
    <!-- Vista previa de la imagen -->
    <div v-if="imagePreview" class="mt-2">
      <img
        :src="imagePreview"
        alt="Vista previa de la imagen"
        class="w-full h-auto max-h-48 border rounded-md shadow-md object-contain"
      />
    </div>
    <!-- Mensaje de error -->
    <div v-if="errorMessage" class="mt-2 text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  modelValue: {
    type: File,
    default: null
  },
  imageUrl: {
    type: String,
    default: ''
  },
  maxSizeMB: {
    type: Number,
    default: 5 // Tamaño máximo del archivo en MB
  }
});

const emit = defineEmits(['update:modelValue']);

const fileName = ref('');
const imagePreview = ref('');
const loading = ref(false);
const errorMessage = ref('');

const triggerFileInput = () => {
  if ($refs.fileInput) {
    $refs.fileInput.click();
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size / 1024 / 1024 > props.maxSizeMB) {
      errorMessage.value = `El archivo no debe superar los ${props.maxSizeMB} MB.`;
      fileName.value = '';
      imagePreview.value = '';
      emit('update:modelValue', null);
      return;
    }
    fileName.value = file.name;
    errorMessage.value = '';
    loading.value = true;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
      loading.value = false;
    };
    reader.readAsDataURL(file);
    emit('update:modelValue', file);  // Emitiendo el archivo
  } else {
    fileName.value = '';
    imagePreview.value = '';
    errorMessage.value = '';
    loading.value = false;
    emit('update:modelValue', null);
  }
};

// Actualiza la vista previa cuando cambia modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(newVal);
  } else {
    imagePreview.value = '';
  }
});

// Actualiza la vista previa cuando cambia imageUrl
watch(() => props.imageUrl, (newVal) => {
  if (newVal) {
    imagePreview.value = newVal;
  }
});
</script>

<style scoped>
/* Añadir estilos si es necesario */
</style>
