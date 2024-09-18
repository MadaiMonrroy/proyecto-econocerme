
<template>
    <div class="card">
      <DataView :value="modulos" :layout="layout">
        <template #header>
          <div class="flex justify-end">
            <SelectButton
              v-model="layout"
              :options="options"
              :optionLabel="optionLabel"
              :allowEmpty="false"
            >
              <template #option="{ option }">
                <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
              </template>
            </SelectButton>
          </div>
        </template>
  
        <template #list="slotProps">
          <div class="flex flex-col">
            <div v-for="(modulo, index) in slotProps.items" :key="index">
              <div
                class="flex flex-col sm:flex-row sm:items-center p-6 gap-4"
                :class="{
                  'border-t border-surface-200 dark:border-surface-700':
                    index !== 0,
                }"
              >
                <div class="md:w-40 relative">
                  <img
                    class="block xl:block mx-auto rounded w-full"
                    :src="modulo.imagen"
                    alt="Imagen del Módulo"
                  />
                </div>
                <div
                  class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6"
                >
                  <div
                    class="flex flex-row md:flex-col justify-between items-start gap-2"
                  >
                    <div>
                      <span
                        class="font-medium text-surface-500 dark:text-surface-400 text-sm"
                        >{{ modulo.categoria }}</span
                      >
                      <div class="text-lg font-medium mt-2 pb-2">
                        {{ modulo.nombre }}
                      </div>
                      <div>
                        <ScrollPanel style="width: 100%; height: 90px">
                          <p v-html="modulo.descripcion" class="text-md"></p>
                          <!-- Renderiza el HTML aquí -->
                        </ScrollPanel>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col md:items-end gap-8">
                    <div class="flex justify-end gap-2">
                      <Button
                        @click="abrirDialog(modulo)"
                        severity="help"
                        icon="pi pi-pencil"
                        raised
                        outlined
                        rounded
                      ></Button>
                      <Button
                        @click="eliminarModulo(modulo.idModulo)"
                        severity="help"
                        icon="pi pi-trash"
                        raised
                        outlined
                        rounded
                      ></Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
  
        <template #grid="slotProps">
          <div class="grid grid-cols-12 gap-4">
            <div
              v-for="(modulo, index) in slotProps.items"
              :key="index"
              class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3 p-2"
            >
              <div
                class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col"
              >
                <div class="bg-surface-50 flex justify-center rounded p-4">
                  <div class="relative mx-auto">
                    <img
                      class="rounded w-full"
                      :src="modulo.imagen"
                      alt="Imagen del Módulo"
                      style="max-width: 300px"
                    />
                  </div>
                </div>
                <div class="pt-6">
                  <div class="flex flex-row justify-between items-start gap-2">
                    <div>
                      <span
                        class="font-medium text-surface-500 dark:text-surface-400 text-sm"
                        >{{ modulo.categoria }}</span
                      >
                      <div class="text-lg font-medium mt-1">
                        {{ modulo.nombre }}
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-6 mt-6">
                    <div>
                      <ScrollPanel style="width: 100%; height: 90px">
                        <p v-html="modulo.descripcion" class="text-md"></p>
                        <!-- Renderiza el HTML aquí -->
                      </ScrollPanel>
                    </div>
                    <div class="flex justify-end gap-2">
                      <Button
                        @click="abrirDialog(modulo.idModulo)"
                        severity="info"
                        icon="pi pi-pencil"
                        raised
                        outlined
                        rounded
                      ></Button>
                      <Button
                        @click="eliminarModulo(modulo.idModulo)"
                        severity="danger"
                        icon="pi pi-trash"
                        raised
                        outlined
                        rounded
                      ></Button>
                      <Button
                        @click="verLecciones(modulo.idModulo)"
                        severity="help"
                        icon="pi pi-plus-circle"
                        raised
                        outlined
                        rounded
                      ></Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataView>
      <!-- Diálogo para editar módulo -->
      <Dialog
        v-model:visible="visible"
        header="Editar Módulo"
        :modal="true"
        :style="{ width: '50vw' }"
      >
        <form @submit.prevent="guardarCambios" class="space-y-4">
          <div>
            <label for="nombre" class="block text-sm font-medium"
              >Nombre del Módulo</label
            >
            <InputText
              id="nombre"
              v-model="modulo.nombre"
              required
              placeholder="Ingrese el nombre del módulo"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
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
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
  
          <div>
            <label for="imagen" class="block text-sm font-medium">Imagen</label>
            <CustomFileInput
              id="imagen"
              label=""
              :valueimg="modulo.imagen"
              @change="onFileChange"
              class="border-2 border-gray-300 rounded-md"
            />
          </div>
  
          <div>
            <label for="videoIntro" class="block text-sm font-medium"
              >Video de Introducción</label
            >
            <!-- Visualizar el video cargado -->
            <div v-if="modulo.videoIntroURL" class="relative w-full h-0 pb-[56.25%]">
              <video
                controls
                class="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-lg"
                controlsList="nodownload"
                poster="/src/assets/fondo.jpg"
                playsinline
                loop
  
                style="max-height: 300px"
              >
              
  
                <source :src="modulo.videoIntroURL" type="video/mp4" />
                Tu navegador no soporta la visualización de videos.
              </video>
            </div>
  
            <!-- Componente FileUpload de PrimeVue -->
            <FileUpload
              name="videoUploader"
              @upload="onUpload"
              accept="video/*"
              :maxFileSize="50000000"
              :auto="false"
              :customUpload="true"
              @select="onFileSelect"
              class="border-2 border-gray-300 rounded-md"
            >
              <template
                #header="{ chooseCallback, uploadCallback, clearCallback, files }"
              >
                <div class="flex justify-between items-center gap-4">
                  <div class="flex gap-2">
                    <Button
                      @click="chooseCallback()"
                      icon="pi pi-video"
                      rounded
                      outlined
                      severity="secondary"
                      label="Elegir Video"
                    ></Button>
                    <Button
                      @click="uploadCallback()"
                      icon="pi pi-cloud-upload"
                      rounded
                      outlined
                      severity="success"
                      :disabled="!files || files.length === 0"
                      label="Subir Video"
                    ></Button>
                    <Button
                      @click="clearCallback()"
                      icon="pi pi-times"
                      rounded
                      outlined
                      severity="danger"
                      :disabled="!files || files.length === 0"
                      label="Limpiar"
                    ></Button>
                  </div>
                  <ProgressBar
                    :value="progress"
                    :showValue="false"
                    class="w-full md:w-2/3 h-1"
                  >
                    <span class="whitespace-nowrap">{{ totalSize }}B / 50MB</span>
                  </ProgressBar>
                </div>
              </template>
            </FileUpload>
          </div>
  
          <Button
            label="Guardar Cambios"
            type="submit"
            severity="help"
            :disabled="!isFormValid"
          />
        </form>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from "vue";
  import api from "@/axiosConfig.js";
  import { useToast } from "primevue/usetoast";
  import CustomFileInput from "@/components/CustomFileInput.vue";
  import { useAuthStore } from "@/stores/authStore";
  
  const modulos = ref([]);
  const layout = ref("grid");
  const options = ref(["list", "grid"]);
  const optionLabel = ref("");
  
  //esto hay que eliminar
  const toast = useToast();
  const visible = ref(false);
  const modulo = ref({
    nombre: "",
    descripcion: "",
    imagen: null,
    videoIntroURL: null,
  });
  let selectedFile = null;
  const totalSize = ref(0);
  const progress = ref(0);
  const isUploading = ref(false);
  // Computed property to validate form
  const isFormValid = computed(() => {
    return (
      modulo.value.nombre &&
      modulo.value.descripcion &&
      modulo.value.imagen &&
      modulo.value.videoIntroURL &&
      isUploading.value
    );
  });
  
  // Función para abrir el diálogo y cargar los datos del módulo
  const abrirDialog = async (moduloId) => {
    try {
      // Realizar una consulta al backend para obtener los datos del módulo
      const response = await api.get(`/modulos/obtenerModulo/${moduloId}`);
      modulo.value = response.data;
  
      visible.value = true;
    } catch (error) {
      console.error("Error al cargar los datos del módulo:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar los datos del módulo",
        life: 3000,
      });
    }
  };
  
  const cerrarDialog = () => {
    visible.value = false;
  };
  
  // Manejo de archivos
  const onFileChange = (event) => {
    selectedFile = event.target.files[0];
    modulo.value.imagen = selectedFile;
  };
  
  const onSelectedFiles = (event) => {
    if (event.files.length > 0) {
      modulo.value.videoIntroURL = event.files[0];
      totalSize.value = event.files[0].size;
    }
  };
  
  const onTemplatedUpload = () => {
    isUploading.value = false;
    toast.add({
      severity: "info",
      summary: "Éxito",
      detail: "Video subido",
      life: 3000,
    });
  };
  
  const onProgress = (event) => {
    if (event.lengthComputable) {
      progress.value = Math.round((event.loaded * 100) / event.total);
    }
  };
  
  const submitForm = async () => {
    const formData = new FormData();
    formData.append("idModulo", modulo.value.idModulo);
    formData.append("nombre", modulo.value.nombre);
    formData.append("descripcion", modulo.value.descripcion);
  
    if (modulo.value.imagen) {
      formData.append("imagen", selectedFile);
    }
  
    if (modulo.value.videoIntroURL) {
      formData.append("videoIntroURL", modulo.value.videoIntroURL);
    }
  
    try {
      await api.put(`/modulos/editarModulo/${modulo.value.idModulo}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: onProgress,
      });
      toast.add({
        severity: "success",
        summary: "Éxito",
        detail: "Módulo actualizado correctamente",
        life: 3000,
      });
      cerrarDialog();
    } catch (error) {
      console.error("Error al actualizar el módulo:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el módulo",
        life: 3000,
      });
    }
  };
  
  const props = defineProps({
    cursoId: {
      type: String,
      required: true,
    },
  });
  
  onMounted(async () => {
    const response = await api.get(`/modulos/modulo/${props.cursoId}`);
    modulos.value = response.data;
  
  });
  
  const guardarCambios = async () => {
    try {
      console.log("Cambios guardados:", moduloSeleccionado.value);
      cerrarDialog();
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };
  
  const eliminarModulo = (idModulo) => {
    // Eliminar el módulo
  };
  </script>