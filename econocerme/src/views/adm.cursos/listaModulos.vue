<template>
  <div class="card" v-if="modulos.length > 0">
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
                      @click="abrirDialog(modulo.idModulo)"
                      severity="info"
                      icon="pi pi-pencil"
                      raised
                      outlined
                      rounded
                      v-tooltip.left="{
                        value: 'Editar',
                        showDelay: 200,
                        hideDelay: 100,
                      }"
                    ></Button>
                    <Button
                      @click="eliminarModulo(modulo.idModulo)"
                      severity="danger"
                      icon="pi pi-trash"
                      raised
                      outlined
                      rounded
                      v-tooltip.top="{
                        value: 'Eliminar',
                        showDelay: 200,
                        hideDelay: 100,
                      }"
                    ></Button>
                    <Button
                      @click="verLecciones(modulo.idModulo)"
                      severity="help"
                      icon="pi pi-plus-circle"
                      raised
                      outlined
                      rounded
                      v-tooltip.right="{
                        value: 'Lecciones',
                        showDelay: 200,
                        hideDelay: 100,
                      }"
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
              <div class="bg-surface-50 flex justify-center rounded p-4 h-48">
                <img
                  class="rounded w-full h-full object-cover"
                  :src="modulo.imagen"
                  alt="Imagen del Módulo"
                  style="max-width: 300px"
                />
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
                      v-tooltip.left="{
                        value: 'Editar',
                        showDelay: 200,
                        hideDelay: 100,
                      }"
                    ></Button>
                    <Button
                      @click="eliminarModulo(modulo.idModulo)"
                      severity="danger"
                      icon="pi pi-trash"
                      raised
                      outlined
                      rounded
                      v-tooltip.top="{
                        value: 'Eliminar',
                        showDelay: 200,
                        hideDelay: 100,
                      }"
                    ></Button>
                    <Button
                      @click="verLecciones(modulo.idModulo)"
                      severity="help"
                      icon="pi pi-plus-circle"
                      raised
                      outlined
                      rounded
                      v-tooltip.right="{
                        value: 'Lecciones',
                        showDelay: 200,
                        hideDelay: 100,
                      }"
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

        <!-- Aquí está el bloque del video -->
        <div>
          <label for="videoIntro" class="block text-sm font-medium">
            Video de Introducción
          </label>

          <!-- Si hay un video ya cargado y no estamos cambiándolo -->
          <div v-if="(modulo.videoIntroURL || videoPreview) && !cambiandoVideo">
            <div class="relative w-full h-0 pb-[56.25%]">
              <video
                controls
                class="absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-lg"
                controlsList="nodownload"
                poster="/src/assets/fondo.jpg"
                playsinline
                loop
                style="max-height: 300px"
              >
                <source
                  :src="modulo.videoIntroURL || videoPreview"
                  type="video/mp4"
                />
                Tu navegador no soporta la visualización de videos.
              </video>
            </div>
            <!-- Botón para cambiar el video -->
            <Button
              label="Cambiar"
              @click="cambiarVideo"
              severity="warning"
              class="mt-2"
              icon="pi pi-pencil"
              rounded
              outlined
            />
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
                  @click="clearCallback()"
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

  <!-- Mensaje cuando no hay módulos -->
  <Message v-else>No hay módulos disponibles.</Message>
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
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/axiosConfig.js";
import { useToast } from "primevue/usetoast";
import CustomFileInput from "@/components/CustomFileInput.vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";


const props = defineProps({
  cursoId: {
    type: String,
    required: true,
  },
  isActive: { // Prop para indicar si es la pestaña activa
      type: Boolean,
      default: false,
    },
});
const modulos = ref([]);
const layout = ref("grid");
const options = ref(["list", "grid"]);
const optionLabel = ref("");
const router = useRouter();
const confirm = useConfirm();
const authStore = useAuthStore();
const newVideo = null;
const idUsuario = authStore.usuario.id;

//esto hay que eliminar
const toast = useToast();
const visible = ref(false);
const modulo = ref({
  nombre: "",
  descripcion: "",
  imagen: null,
  videoIntroURL: null,
});
const videoPreview = ref(null); // Nueva referencia para la vista previa del video
const cambiandoVideo = ref(false); // Nuevo estado para manejar el cambio de video
let selectedFile = null;
let selectedVideoFile = null;
const videoIntroFile = ref(null);
const totalSize = ref(0);
const progress = ref(0);
const isUploading = ref(false);
// Computed property to validate form
const isFormValid = computed(() => {
  return (
    modulo.value.nombre &&
    modulo.value.descripcion &&
    modulo.value.imagen &&
    (modulo.value.videoIntroURL ) && // Asegura que haya un video
    !isUploading.value
  );
});

// Lógica para el botón "Cambiar video"
const cambiarVideo = () => {
  cambiandoVideo.value = true;
};

const formatSize = (bytes) => {
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const verLecciones = (idModulo) => {
  if (authStore.usuario.tipoUsuario === "admin") {
    router.push({
      path: `/panelControl/lecciones/${idModulo}`,
      query: { cursoId: props.cursoId }, // Pasamos idCurso como parámetro de consulta
    });
  } else if (authStore.usuario.tipoUsuario === "coach") {
    router.push({
    path: `/panelCoaches/lecciones/${idModulo}`,
    query: { cursoId: props.cursoId }, // Pasamos idCurso como parámetro de consulta
  });  }

};

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

const onSelectedFiles = (event) => {
  if (event.files.length > 0) {
    videoIntroFile.value = event.files[0]; // Solo toma el primer archivo
    totalSize.value = event.files[0].size;
  }
};

const onProgress = (event) => {
  if (event.lengthComputable) {
    progress.value = Math.round((event.loaded * 100) / event.total);
  }
};
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
const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
  removeFileCallback(index);
  totalSize.value -= file.size; // Resta el tamaño al eliminar
};

const guardarCambios = async () => {
  const formData = new FormData();
  formData.append("idModulo", modulo.value.idModulo);
  formData.append("nombre", modulo.value.nombre);
  formData.append("descripcion", modulo.value.descripcion);

  if (selectedFile) {
    formData.append('imagen', selectedFile);
  }
  else {
    formData.append('imagen', modulo.value.imagen);
  }

  // Video
  if (videoIntroFile.value) {
    console.log(videoIntroFile.value)
    formData.append("videoIntroURL", videoIntroFile.value);  // Usa el nuevo archivo de video
  } else if (modulo.value.videoIntroURL) {
    formData.append("videoIntroURL", modulo.value.videoIntroURL);  // Mantén el video existente si no se cambia
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
    fetchData();
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



const fetchData = async () => {
  try {
    const response = await api.get(`/modulos/modulo/${props.cursoId}`);
    modulos.value = response.data.reverse();
  }
  catch (error) {
    console.error(error);
  }
}
defineExpose({ fetchData });

// Se llama a fetchData cuando el componente se monta
onMounted(fetchData);


const deleteModulo = async (idModulo) => {
  try {
    await api.delete(`/modulos/eliminarModulo/${idModulo}`, {
      params: { idUsuario },
    });
    modulos.value = modulos.value.filter(
      (modulo) => modulo.idModulo !== idModulo
    );
    const response = await api.get(`/modulos/modulo/${props.cursoId}`);
    modulos.value = response.data;
    toast.add({
      severity: "info",
      summary: "Modulo Eliminado",
      detail: "El modulo ha sido eliminado con éxito.",
      life: 3000,
    });
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Hubo un problema al eliminar el modulo.",
      life: 3000,
    });
    // Manejar el error de forma adecuada
  }
};
const eliminarModulo = (idModulo) => {
  confirm.require({
    group: "headless",
    message: "¿Estás seguro de que deseas eliminar este Modulo?",
    header: "Confirmación",
    icon: "pi-exclamation-triangle",
    accept: () => deleteModulo(idModulo), // Llama a eliminarAnuncio solo si el usuario acepta

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
</script>
