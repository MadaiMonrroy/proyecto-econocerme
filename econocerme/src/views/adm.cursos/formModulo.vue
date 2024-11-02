<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Agregar Módulo</h2>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label for="nombre" class="block text-sm font-medium"
          >Nombre del Módulo</label
        >
        <InputText
          id="nombre"
          v-model="modulo.nombre"
          required
          placeholder="Ingrese el nombre del módulo"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label for="descripcion" class="block text-sm font-medium"
          >Descripción</label
        >
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
          ref="fileInputRef"
          :valueimg="modulo.imagen"
          @change="onFileChange"
        />
      </div>

      <div>
        <label for="videoIntro" class="block text-sm font-medium"
          >Video de Introducción</label
        >
        <FileUpload
          ref="fileUploadRef"
          name="videoIntro"
          @upload="onTemplatedUpload"
          accept="video/*"
          :maxFileSize="50000000"
          :multiple="false"
          :fileLimit="1"
          @select="onSelectedFiles"
          @progress="onProgress"
        >
          <template
            #header="{ chooseCallback, uploadCallback, clearCallback, files }"
          >
            <div
              class="flex flex-wrap justify-between items-center flex-1 gap-4"
            >
              <div class="flex gap-2">
                <Button
                  @click="chooseCallback()"
                  icon="pi pi-video"
                  rounded
                  outlined
                  severity="secondary"
                ></Button>
                <Button
                  @click="uploadEvent(uploadCallback)"
                  icon="pi pi-cloud-upload"
                  rounded
                  outlined
                  severity="success"
                  :disabled="!files || files.length === 0 "
                ></Button>
                <Button
                  @click="handleClear(clearCallback)"
                  icon="pi pi-times"
                  rounded
                  outlined
                  severity="danger"
                  :disabled="!files || files.length === 0"
                ></Button>
              </div>
              <ProgressBar
                :value="progress"
                :showValue="false"
                class="md:w-20rem h-1 w-full md:ml-auto"
              >
                <span class="whitespace-nowrap">{{ totalSize }}B / 50Mb</span>
              </ProgressBar>
            </div>
          </template>

          <template #content="{ files, removeFileCallback }">
            <div class="flex flex-col gap-8 pt-4" v-if="files.length > 0">
              <h5 v-if="!isUploading">Completado</h5>
              <h5 v-if="isUploading">pendiente</h5>
              <div class="flex flex-wrap gap-4">
                <div
                  v-for="(file, index) of files"
                  :key="file.name + file.type + file.size"
                  class="p-8 rounded-border flex flex-col border border-surface items-center gap-4"
                >
                  <span
                    class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                    >{{ file.name }}</span
                  >
                  <div>{{ formatSize(file.size) }}</div>
                  <Badge
                    :value="isUploading ? 'Pendiente' : 'Completado'"
                    :severity="isUploading ? 'warn' : 'success'"
                  />
                  <Button
                    icon="pi pi-times"
                    @click="
                      onRemoveTemplatingFile(file, removeFileCallback, index)
                    "
                    outlined
                    rounded
                    severity="danger"
                  />
                </div>
              </div>
            </div>
          </template>

          <template #empty>
            <div class="flex items-center justify-center flex-col">
              <i
                class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color"
              />
              <p class="mt-6 mb-0">
                Arrastre el archivo de video aquí para subir.
              </p>
            </div>
          </template>
        </FileUpload>
      </div>

      <Button
        label="Agregar Módulo"
        type="submit"
        severity="help"
        :disabled="!isFormValid"
      />
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import CustomFileInput from "@/components/CustomFileInput.vue";
import { useRouter } from "vue-router";

import api from "@/axiosConfig.js";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const toast = useToast();
const idUsuario = authStore.usuario.id;
const router = useRouter();
const fileInputRef = ref(null);
const fileUploadRef = ref(null);

const props = defineProps({
  cursoId: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['moduloGuardado']);

const modulo = ref({
  nombre: "",
  descripcion: "",
  imagen: null,
  videoIntroURL: null,
});

let selectedFile = null;
const totalSize = ref(0);
const progress = ref(0);
const isUploading = ref(true);

// Computed property to validate form
const isFormValid = computed(() => {
  return (
    modulo.value.nombre &&
    modulo.value.descripcion &&
    modulo.value.imagen &&
    modulo.value.videoIntroURL &&
    !isUploading.value
  );
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
  toast.add({
    severity: "info",
    summary: "Éxito",
    detail: "Video subido",
    life: 3000,
  });
};

// Actualiza la función de progreso
const onProgress = (event) => {
  if (event.lengthComputable) {
    progress.value = Math.round((event.loaded * 100) / event.total);
  }
};

// Función que simula la carga del video
const uploadEvent = async (uploadCallback) => {
  isUploading.value = true; // Comienza la subida
  progress.value = 0; // Reinicia el progreso a 0 antes de comenzar

  try {
    // Simula un proceso de carga
    const interval = setInterval(() => {
      if (progress.value < 100) {
        progress.value += 10; // Incrementa el progreso
        isUploading.value = true; // Termina la subida
      } else {
        clearInterval(interval);
        isUploading.value = false; // Termina la subida
        toast.add({
          severity: "info",
          summary: "Éxito",
          detail: "Video cargado exitosamente",
          life: 3000,
        });
      }
    }, 500); // Incrementa cada medio segundo
    progress.value = 0;
    isUploading.value = true; // Termina la subida

    // Simula la espera de la carga
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera 5 segundos
    // Aquí puedes llamar a la función de carga si necesitas
    // await uploadCallback();
  } catch (error) {
    console.error("Error durante la carga:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar el video",
      life: 3000,
    });
  }
};
// Función para restablecer el formulario
const resetForm = () => {
  
  modulo.value = {
    nombre: "",
    descripcion: "",
    imagen: null,
    videoIntroURL: null,
  };
  selectedFile = null; // Restablecer el archivo seleccionado
  totalSize.value = 0; // Reiniciar el tamaño total
  progress.value = 0; // Reiniciar el progreso
  isUploading.value = false; // Resetea el estado de carga
  fileInputRef.value.clearImage(); // Llama al método para limpiar la imagen

    fileUploadRef.value.clear(); // Llama al método clear() para vaciar el FileUpload


  fileInputRef.value.clearImage(); // Limpiar la imagen también si es necesario
};
// Formatear el tamaño del archivo
const formatSize = (bytes) => {
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// Eliminar el archivo de la lista
const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
  removeFileCallback(index);
  totalSize.value = 0; // Reiniciar el tamaño total
  progress.value = 0; // Reiniciar el progreso
  isUploading.value = false; // Resetea el estado de carga  totalSize.value -= file.size; // Resta el tamaño al eliminar
};
const handleClear = (clearCallback) => {
  clearCallback(); // Ejecuta el clearCallback original
  progress.value = 0; // Reiniciar el progreso
  totalSize.value = 0; // Resetea el tamaño total
  isUploading.value = false; // Resetea el estado de carga
};
// Función para enviar el formulario
const submitForm = async () => {
  const formData = new FormData();
  formData.append("idCurso", props.cursoId);
  formData.append("nombre", modulo.value.nombre);
  formData.append("descripcion", modulo.value.descripcion);

  if (modulo.value.imagen) {
    formData.append("imagen", selectedFile);
  }

  if (modulo.value.videoIntroURL) {
    formData.append("videoIntroURL", modulo.value.videoIntroURL);
  }

  formData.append("idUsuario", idUsuario);

  try {
    const response = await api.post("/modulos/agregarModulo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onProgress,
    });
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Módulo agregado correctamente",
      life: 3000,
    });
    // Emitir el evento al componente padre
    emit("moduloGuardado"); // Cambiado aquí
    // Emitir el segundo evento para redirigir a la pestaña 0
    emit("cambiarTab", 0); // Cambia a la pestaña 0
    setTimeout(() => {
      console.log("Módulo agregado:", response.data);
    }, 3000);
    // Restablecer los campos del formulario
    resetForm();
  } catch (error) {
    console.error("Error al agregar el módulo:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo agregar el módulo",
      life: 3000,
    });
  }
};
</script>
