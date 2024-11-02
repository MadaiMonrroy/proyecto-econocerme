<template>
  <!-- Componente Accordion para el listado de módulos -->
  <div class="card" v-if="lecciones.length > 0">
    <Accordion>
      <AccordionPanel
        v-for="(leccion, index) in lecciones"
        :key="leccion.idLeccion"
        :value="index.toString()"
      >
        <AccordionHeader @click="toggleLeccion(index)" class="font-extrabold">
          <strong class="uppercase">{{ leccion.tituloSeccion }}</strong>
        </AccordionHeader>
        <AccordionContent v-if="isActive(index)">
          <div class="relative">
            <div class="absolute top-0 right-0 space-x-2">
              <Button
                @click="abrirDialog(leccion.idLeccion)"
                severity="info"
                icon="pi pi-pencil"
                raised
                outlined
                rounded
              >
              </Button>
              <Button
                @click="eliminarLeccion(leccion.idLeccion)"
                severity="danger"
                icon="pi pi-trash"
                raised
                outlined
                rounded
              >
              </Button>
            </div>

            <div class="mt-0 pt-10">
              <p>
                <strong>Video:</strong>
                <Button
                  label="Ver video"
                  @click="abrirDialogVideo(leccion)"
                  severity="help"
                  icon="pi pi-eye"
                  text
                  link
                />

                <Dialog
                  v-model:visible="visibleVideo"
                  modal
                  :header="leccion.tituloSeccion"
                  :style="{ width: '50rem' }"
                  :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
                  class="uppercase"
                >
                  <div class="flex justify-center">
                    <video
                      controls
                      class="w-[770px] h-[375px] object-contain rounded-md shadow-lg"
                      controlsList="nodownload"
                      playsinline
                      loop
                    >
                      <source :src="leccion.videoURL" type="video/mp4" />
                      Tu navegador no soporta la visualización de videos.
                    </video>
                  </div>
                </Dialog>
              </p>
              <div class="pt-1">
                <Editor
                  v-model="leccion.descripcion"
                  editorStyle="auto"
                  :headerTemplate="null"
                  readonly
                  :toolbar="false"
                >
                  <template v-slot:toolbar>
                    <span class="ql-formats">
                      <span class="justify-items-center font-semibold font-sans "
                        ><strong>Descripción:</strong></span
                      >
                    </span>
                  </template>
                </Editor>
              </div>
              <div class="flex justify-between">
              <p>
                <strong>Fecha de Creación:</strong>
                {{ new Date(leccion.fechaCreacion).toLocaleDateString() }}
              </p>
              <p>
                <strong>Última Actualización:</strong>
                {{ leccion.ultimaActualizacion ? new Date(leccion.ultimaActualizacion).toLocaleDateString() : new Date(leccion.fechaCreacion).toLocaleDateString() }}
              </p>
            </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
  <!-- Mensaje cuando no hay módulos -->
  <Message v-else>No hay lecciones disponibles.</Message>
  <!-- Modal para Confirmar Eliminación -->
  <ConfirmDialog group="headless">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div
        class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded-3xl"
      >
        <div
          class="rounded-full bg-primary text-primary-contrast inline-flex justify-center items-center h-24 w-24 -mt-20"
        >
          <i
            class="pi pi-exclamation-triangle !text-violet-950"
            style="color: dimgray; font-size: 3rem"
          ></i>
        </div>
        <span class="font-bold text-2xl block mb-2 mt-6">{{
          message.header
        }}</span>
        <p class="mb-0">{{ message.message }}</p>
        <div class="flex items-center gap-2 mt-6">
          <Button
            label="Eliminar"
            severity="help"
            raised
            @click="acceptCallback"
          ></Button>
          <Button
            label="Cancelar"
            raised
            severity="primary"
            outlined
            @click="rejectCallback"
          ></Button>
        </div>
      </div>
    </template>
  </ConfirmDialog>

  <!-- Dialog para editar el módulo -->

  <Dialog
    v-model:visible="visible"
    header="Editar Leccion"
    :modal="true"
    :closable="true"
    :style="{ width: '50vw' }"
    @hide="onHide"
  >
    <form @submit.prevent="guardarCambios" class="space-y-4">
      <div>
        <Divider align="left" type="solid">
          <h1 class="font-semibold">Titulo de la Lección</h1>
        </Divider>
        <InputText
          id="nombre"
          v-model="dataLeccion.tituloSeccion"
          required
          placeholder="Ingrese el nombre del módulo"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div>
        <Divider align="left" type="solid">
          <h1 class="font-semibold">Descripción</h1>
        </Divider>
        <Editor
          v-model="dataLeccion.descripcion"
          editorStyle="height: 320px"
          placeholder="Ingrese una descripción del módulo"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <!-- Aquí está el bloque del video -->
      <div>
        <Divider align="left" type="solid">
          <h1 class="font-semibold">Video de la lección</h1>
        </Divider>

        <!-- Si hay un video ya cargado y no estamos cambiándolo -->
        <div v-if="videoInit && !cambiandoVideo">
          <div class="relative w-full h-0 pb-[44.25%]">
            <video
              controls
              class="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-lg"
              controlsList="nodownload"
              playsinline
              loop
              style="max-height: 300px"
            >
              <source :src="videoInit" type="video/mp4" />
              Tu navegador no soporta la visualización de videos.
            </video>
          </div>
          <!-- Botón para cambiar el video -->
          <div class="flex justify-start">
            <!-- Botón para cambiar el video -->
            <Button
              label="Elegir otro video"
              @click="cambiarVideo"
              severity="warning"
              class="mt-2"
              icon="pi pi-pencil"
              rounded
              outlined
              raised
            />
          </div>
        </div>

        <!-- Si el usuario ha presionado "Cambiar", mostrar FileUpload -->
        <div v-if="cambiandoVideo">
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
                    :disabled="!files || files.length === 0"
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
                <h5 v-if="fileUploaded">Completado</h5>
                <h5 v-if="!fileUploaded">Pendiente</h5>
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
                      :value="fileUploaded ? 'Completado' : 'Pendiente'"
                      :severity="fileUploaded ? 'success' : 'warn'"
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
      </div>
      <div class="flex justify-end gap-3">

      <Button
        label="Guardar Cambios"
        type="submit"
        severity="help"
        rounded
        raised
        :disabled="!isFormValid"
      />
      <Button
        label="Cancelar"
        rounded
        raised
        class="w-32"
        severity="secondary"
        @click="cerrarModal"
      />
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import api from "@/axiosConfig.js";
import { useConfirm } from "primevue/useconfirm";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";
import { defineProps } from "vue";

const props = defineProps({
  idModulo: {
    type: String,
    required: true,
  },
});

const toast = useToast();
const lecciones = ref([]);
const leccionActivo = ref(null); // Solo un módulo activo a la vez
const visible = ref(false); // Estado del dialog
const visibleVideo = ref(false);
const leccionSeleccionado = ref({}); // Datos del módulo seleccionado
const confirm = useConfirm();
const authStore = useAuthStore();
const idUsuario = authStore.usuario.id;
const cambiandoVideo = ref(false);
const videoInit = ref();

let selectedFile = null;
let selectedVideoFile = null;
const videoIntroFile = ref(null);
const totalSize = ref(0);
const progress = ref(0);
const isUploading = ref(false);

// Función para obtener los módulos del curso
const obtenerLecciones = async () => {
  if (props.idModulo) {
    try {
      const response = await api.get(`/lecciones/leccion/${props.idModulo}`);
      lecciones.value = response.data.reverse();
      console.log(lecciones.value);
    } catch (error) {
      console.error("Error al obtener los módulos:", error);
    }
  }
};
const dataLeccion = ref();
const obtenerLeccion = async (idLeccion) => {
  try {
    const response = await api.get(`/lecciones/obtenerLeccion/${idLeccion}`);
    dataLeccion.value = response.data;
    videoInit.value = dataLeccion.value.videoURL;
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Hubo un problema al eliminar la lección.",
      life: 3000,
    });
  }
};
const cerrarModal = () => {
  visible.value = false;

};
const deleteLeccion = async (idLeccion) => {
  try {
    await api.delete(`/lecciones/eliminarLeccion/${idLeccion}`, {
      params: { idUsuario },
    });
    lecciones.value = lecciones.value.filter(
      (leccion) => leccion.idLeccion !== idLeccion
    );
    obtenerLecciones();
    toast.add({
      severity: "info",
      summary: "Lección Eliminado",
      detail: "La lección ha sido eliminada con éxito.",
      life: 3000,
    });
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Hubo un problema al eliminar la lección.",
      life: 3000,
    });
  }
};

const eliminarLeccion = (idLeccion) => {
  confirm.require({
    group: "headless",
    message: "¿Estás seguro de que deseas eliminar esta lección?",
    header: "Confirmación",
    icon: "pi-exclamation-triangle",
    accept: () => deleteLeccion(idLeccion),
    reject: () => {
      // toast.add({
      //   severity: "warn",
      //   summary: "Cancelled",
      //   detail: "Eliminación cancelada",
      //   life: 3000,
      // });
    },
  });
};

// Función para alternar el estado de un módulo (expandir/colapsar)
const toggleLeccion = (index) => {
  if (leccionActivo.value === index) {
    leccionActivo.value = null; // Colapsar
  } else {
    leccionActivo.value = index; // Expandir el nuevo
  }
};

// Verifica si el módulo está activo (expandido)
const isActive = (index) => {
  return leccionActivo.value === index;
};

// Función para abrir el dialog y cargar los datos del módulo
const abrirDialog = async (idLeccion) => {
  try {
    await obtenerLeccion(idLeccion);
    visible.value = true;
  } catch (error) {
    console.error("Error al abrir el diálogo:", error);
  }
};

const abrirDialogVideo = (leccion) => {
  console.log(leccion);
  leccionSeleccionado.value = { ...leccion }; // Cargar datos en el módulo seleccionado
  visibleVideo.value = true; // Mostrar el dialog
};

// Función para cerrar el dialog
const cerrarDialog = () => {
  visible.value = false; // Ocultar el dialog
};

// Función para guardar los cambios (puedes agregar la lógica para actualizar el módulo aquí)
const guardarCambios = async () => {
  const formData = new FormData();
  formData.append("idLeccion", dataLeccion.value.idLeccion);
  formData.append("tituloSeccion", dataLeccion.value.tituloSeccion);
  formData.append("descripcion", dataLeccion.value.descripcion);
  formData.append("idUsuario", idUsuario);

  // Video
  if (videoIntroFile.value) {
    console.log(videoIntroFile.value);
    formData.append("videoURL", videoIntroFile.value); // Usa el nuevo archivo de video
  } else if (dataLeccion.value.videoIntroURL) {
    formData.append("videoURL", dataLeccion.value.videoURL); // Mantén el video existente si no se cambia
  }

  try {
    await api.put(
      `lecciones/editarLeccion/${dataLeccion.value.idLeccion}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: onProgress,
      }
    );
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Lección actualizado correctamente",
      life: 3000,
    });

    //falta hacer el fetchData como modulos con eso funciona
    obtenerLecciones();

    visible.value = false;
    cambiandoVideo.value = true;
  } catch (error) {
    console.error("Error al actualizar el lección:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo actualizar el Lección",
      life: 3000,
    });
  }
};
// Computed properties
const isFormValid = computed(() => {
  return (
    dataLeccion.value &&
    dataLeccion.value.tituloSeccion &&
    dataLeccion.value.descripcion &&
    videoInit.value && // Asegura que haya un video
    !isUploading.value
  );
});
const cambiarVideo = () => {
  cambiandoVideo.value = true;
  videoInit.value = "";
};

const formatSize = (bytes) => {
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const fileUploaded = ref(false);
const onSelectedFiles = (event) => {
  if (event.files.length > 0) {
    videoIntroFile.value = event.files[0];
    totalSize.value = event.files[0].size;
    fileUploaded.value = false; // Resetear el estado cuando se selecciona un nuevo archivo
    isUploading.value = false;
  }
};

const onProgress = (event) => {
  if (event.lengthComputable) {
    progress.value = Math.round((event.loaded * 100) / event.total);
  }
};

const uploadEvent = async (uploadCallback) => {
  isUploading.value = true;
  progress.value = 0;
  fileUploaded.value = false;

  try {
    const interval = setInterval(() => {
      if (progress.value < 100) {
        progress.value += 10;
      } else {
        clearInterval(interval);
        isUploading.value = false;
        fileUploaded.value = true; // Marcar como cargado solo cuando se complete
        toast.add({
          severity: "info",
          summary: "Éxito",
          detail: "Video cargado exitosamente",
          life: 3000,
        });
      }
    }, 500);

    await new Promise((resolve) => setTimeout(resolve, 5000));
  } catch (error) {
    console.error("Error durante la carga:", error);
    isUploading.value = false;
    fileUploaded.value = false;
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar el video",
      life: 3000,
    });
  }
  videoInit.value = "a";
};

const onHide = () => {
  cambiandoVideo.value = false;
};

const handleClear = (clearCallback) => {
  clearCallback(); // Ejecuta el clearCallback original
  videoInit.value = ""; // Limpia el videoInit
  fileUploaded.value = false; // Resetea el estado de carga
  progress.value = 0; // Resetea la barra de progreso
  totalSize.value = 0; // Resetea el tamaño total
  isUploading.value = false; // Resetea el estado de carga
  videoIntroFile.value = null; // Limpia el archivo de video seleccionado
};

const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
  removeFileCallback(index);
  videoInit.value = ""; // Limpia el videoInit
  fileUploaded.value = false; // Resetea el estado de carga
  progress.value = 0; // Resetea la barra de progreso
  totalSize.value = 0; // Resetea el tamaño total
  isUploading.value = false; // Resetea el estado de carga
  videoIntroFile.value = null; // Limpia el archivo de video seleccionado
};
const onTemplatedUpload = () => {
  isUploading.value = false; // Termina la sub`ida
  toast.add({
    severity: "info",
    summary: "Éxito",
    detail: "Video subido",
    life: 3000,
  });
};

// Cargar los módulos cuando se monta el componente
onMounted(() => {
  obtenerLecciones();
});
</script>

<style scoped>
/* Agrega estilos específicos si es necesario */
</style>
