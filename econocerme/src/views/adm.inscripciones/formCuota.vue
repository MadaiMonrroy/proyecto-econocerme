<template>
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Modificar Cuota</h2>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="nombre" class="block text-sm font-medium">Número de la Cuota</label>
          <InputText
            id="nombre"
            v-model="modulo.nombre"
            required
            placeholder="Ingrese el nombre del módulo"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
  
        <div>
          <label for="descripcion" class="block text-sm font-medium">Descripción</label>
          <Editor
            v-model="modulo.descripcion"
            editorStyle="height: 320px"
            placeholder="Ingrese una descripción del módulo"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
  
        <label for="imagen" class="block text-sm font-medium">Imagen</label>
        <div class="card border-4 border-black dark:border-white">
          <CustomFileInput
            id="imagen"
            label=""
            :valueimg="modulo.imagen"
            @change="onFileChange"
          />
        </div>
  
        <div>
          <label for="videoIntro" class="block text-sm font-medium">Video de Introducción</label>
          <FileUpload
            name="videoIntro"
            @upload="onTemplatedUpload"
            accept="video/*"
            :maxFileSize="50000000"
            :multiple="false"
            @select="onSelectedFiles"
            @progress="onProgress"
          >
            <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
              <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
                <div class="flex gap-2">
                  <Button @click="chooseCallback()" icon="pi pi-video" rounded outlined severity="secondary"></Button>
                  <Button @click="uploadEvent(uploadCallback)" icon="pi pi-cloud-upload" rounded outlined severity="success" :disabled="!files || files.length === 0"></Button>
                  <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0"></Button>
                </div>
                <ProgressBar :value="progress" :showValue="false" class="md:w-20rem h-1 w-full md:ml-auto">
                  <span class="whitespace-nowrap">{{ totalSize }}B / 50Mb</span>
                </ProgressBar>
              </div>
            </template>
  
            <template #content="{ files, removeFileCallback }">
              <div class="flex flex-col gap-8 pt-4" v-if="files.length > 0">
                <h5>Pending</h5>
                <div class="flex flex-wrap gap-4">
                  <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="p-8 rounded-border flex flex-col border border-surface items-center gap-4">
                    <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{ file.name }}</span>
                    <div>{{ formatSize(file.size) }}</div>
                    <Badge value="Pending" severity="warn" />
                    <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" outlined rounded severity="danger" />
                  </div>
                </div>
              </div>
            </template>
  
            <template #empty>
              <div class="flex items-center justify-center flex-col">
                <i class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color" />
                <p class="mt-6 mb-0">Arrastre el archivo de video aquí para subir.</p>
              </div>
            </template>
          </FileUpload>
        </div>
  
        <Button label="Agregar Módulo" type="submit" severity="help" :disabled="!isFormValid" />
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import CustomFileInput from '@/components/CustomFileInput.vue';
  import api from '@/axiosConfig.js';
  import { useAuthStore } from '@/stores/authStore';
  
  const authStore = useAuthStore();
  const toast = useToast();
  const idUsuario = authStore.usuario.id;
  
  const props = defineProps({
    cursoId: {
      type: String,
      required: true
    }
  });
  
  const modulo = ref({
    nombre: '',
    descripcion: '',
    imagen: null,
    videoIntroURL: null,
  });
  
  let selectedFile = null;
  const totalSize = ref(0);
  const progress = ref(0);
  const isUploading = ref(false);
  
  // Computed property to validate form
  const isFormValid = computed(() => {
    return modulo.value.nombre && 
           modulo.value.descripcion && 
           modulo.value.imagen && 
           modulo.value.videoIntroURL && 
           isUploading.value;
  });
  
  // Manejo de archivos
  const onFileChange = (event) => {
    selectedFile = event.target.files[0];
    modulo.value.imagen = selectedFile;
  };
  
  const onSelectedFiles = (event) => {
    if (event.files.length > 0) {
      modulo.value.videoIntroURL = event.files[0]; // Solo toma el primer archivo
      totalSize.value = event.files[0].size; // Asigna el tamaño del archivo
    }
  };
  
  const onTemplatedUpload = () => {
    isUploading.value = false; // Termina la subida
    toast.add({ severity: 'info', summary: 'Éxito', detail: 'Video subido', life: 3000 });
  };
  
  // Actualiza la función de progreso
  const onProgress = (event) => {
    if (event.lengthComputable) {
      progress.value = Math.round((event.loaded * 100) / event.total);
    }
  };
  
  // Función que se llama al subir el video
  const uploadEvent = async (uploadCallback) => {
    isUploading.value = true; // Comienza la subida
    // Aquí puedes inicializar la barra de progreso si es necesario
    progress.value = 0; // Reinicia el progreso a 0 antes de comenzar
  
    try {
      await uploadCallback(); // Llama a la función de carga
    } catch (error) {
      console.error('Error durante la carga:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el video', life: 3000 });
    }
  };
  
  // Formatear el tamaño del archivo
  const formatSize = (bytes) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };
  
  // Eliminar el archivo de la lista
  const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
    removeFileCallback(index);
    totalSize.value -= file.size; // Resta el tamaño al eliminar
  };
  
  // Función para enviar el formulario
  const submitForm = async () => {
    const formData = new FormData();
    formData.append('idCurso', props.cursoId);
    formData.append('nombre', modulo.value.nombre);
    formData.append('descripcion', modulo.value.descripcion);
  
    if (modulo.value.imagen) {
      formData.append('imagen', selectedFile);
    }
  
    if (modulo.value.videoIntroURL) {
      formData.append('videoIntroURL', modulo.value.videoIntroURL);
    }
  
    formData.append('idUsuario', idUsuario);
  
    try {
      const response = await api.post('/modulos/agregarModulo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      });
      console.log('Módulo agregado:', response.data);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Módulo agregado correctamente', life: 3000 });
    } catch (error) {
      console.error('Error al agregar el módulo:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el módulo', life: 3000 });
    }
  };
  </script>
  