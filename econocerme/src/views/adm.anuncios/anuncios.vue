<template>
  <div class="p-4">
    <div class="card">
      <h2 class="text-3xl mb-4 items-end">ANUNCIOS</h2>

      <Divider />

      <!-- Contenedor para alinear el botón y el buscador en la misma línea -->
      <div class="flex justify-between items-center mb-4">
        <!-- Buscador alineado a la izquierda -->
        <div class="flex flex-1 max-w-md">
          <IconField class="flex flex-1">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              id="filter"
              v-model="filter"
              class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Buscar anuncios"
            />
          </IconField>
        </div>
        <div class="flex-none">
          <Button
            class="bg-green-500 text-white p-button-rounded p-button-success flex items-center"
            @click="openAddView"
          >
            <i class="pi pi-plus-circle mr-2"></i>
            Agregar Anuncio
          </Button>
        </div>
      </div>
      <Divider />
      <Fieldset>
        <template #legend>
          <span class="text-2xl tracking-wide">Lista de Anuncios</span>
        </template>
        <div class="overflow-x-auto">
          <DataTable
            :value="filteredAnunciosConNumeracion"
            :rows="4"
            :paginator="true"
            :rowsPerPageOptions="[4, 8, 12]"
            class="p-datatable-striped min-w-[600px]"
          >
            <template #paginatorstart>
              <Button
                type="button"
                icon="pi pi-refresh"
                text
                @click="reloadPage"
              />
            </template>
            <template #paginatorend>
              <Button
                type="button"
                icon="pi pi-download"
                text
                @click="exportToExcel"
              />
            </template>
            <!-- Columnas de la tabla -->
            <Column header="#" field="index" sortable class="px-3 py-2">
              <template #body="rowData">
                {{ rowData.data.index }}
              </template>
            </Column>
            <Column field="titulo" header="Título" sortable class="px-3 py-2">
              <template #body="rowData">
                <div :title="rowData.data.titulo">
                  {{ rowData.data.titulo }}
                </div>
              </template>
            </Column>
            <Column header="Miniatura" class="px-3 py-2 sm:px-6 sm:py-4">
              <template #body="rowData">
                <div
                  class="truncate max-w-xs sm:max-w-md"
                  :title="rowData.data.miniatura"
                >
                  <img
                    v-if="rowData.data.miniatura"
                    :src="rowData.data.miniatura"
                    alt="Miniatura"
                    class="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded"
                  />
                </div>
              </template>
            </Column>
            <Column header="Descripción" class="px-6 py-4">
              <template #body="slotProps">
                <div>
                  <p v-if="!expandedModulos[slotProps.data.id]">
                    <span
                      v-html="slotProps.data.descripcion.slice(0, 120)"
                    ></span
                    >...
                    <button
                      @click="toggleExpand(slotProps.data.id)"
                      class="text-blue-500 hover:underline focus:outline-none"
                    >
                      Ver más
                    </button>
                  </p>
                  <p v-else>
                    <span v-html="slotProps.data.descripcion"></span>
                    <button
                      @click="toggleExpand(slotProps.data.id)"
                      class="text-blue-500 hover:underline focus:outline-none"
                    >
                      Ver menos
                    </button>
                  </p>
                </div>
              </template>
            </Column>

            <Column
              header="Fecha de Inicio"
              field="fecha_inicio"
              sortable
              class="px-3 py-2 sm:px-6 sm:py-4"
            >
              <template #body="rowData">
                {{ formatDate(rowData.data.fecha_inicio) }}
              </template>
            </Column>
            <Column
              header="Fecha de Fin"
              field="fecha_fin"
              sortable
              class="px-3 py-2 sm:px-6 sm:py-4"
            >
              <template #body="rowData">
                {{ formatDate(rowData.data.fecha_fin) }}
              </template>
            </Column>
            <Column field="estado" header="Estado" class="px-6 py-4">
              <template #body="rowData">
                <Tag
                  v-if="rowData.data.estado === 1"
                  value="Activo"
                  severity="success"
                  class="px-2 py-1"
                />
                <Tag
                  v-else-if="rowData.data.estado === 2"
                  value="Inactivo"
                  severity="warn"
                  class="px-2 py-1"
                />
                <Tag
                  v-else
                  value="Desconocido"
                  severity="warning"
                  class="px-2 py-1"
                />
              </template>
            </Column>
            <Column
              field="tipo"
              header="Tipo"
              sortable
              class="px-3 py-2 sm:px-6 sm:py-4"
            />
            <Column header="Acciones" class="px-3 py-2 sm:px-6 sm:py-4">
              <template #body="rowData">
                <div class="flex items-center space-x-2">
                  <Button
                    icon="pi pi-eye"
                    class="p-button-rounded p-button-secondary"
                    @click="showDetails(rowData.data)"
                    raised
                  />
                  <Button
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-info"
                    @click="openEditView(rowData.data)"
                    raised
                  />

                  <Button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-danger"
                    @click="confirmarEliminacion(rowData.data.id)"
                    severity="danger"
                    raised
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </Fieldset>
    </div>
    <ConfirmDialog group="headless">
      <template #container="{ message, acceptCallback, rejectCallback }">
        <div
          class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded"
        >
          <div
            class="rounded-full bg-primary text-primary-contrast inline-flex justify-center items-center h-24 w-24 -mt-20"
          >
            <i
              class="pi pi-exclamation-triangle"
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
            <Button label="Cancelar" outlined @click="rejectCallback"></Button>
          </div>
        </div>
      </template>
    </ConfirmDialog>
    <!-- Modal para mostrar detalles del anuncio -->
    <Dialog
      header="Detalles del Anuncio"
      v-model:visible="showModal"
      modal
      :style="{ width: '50vw' }"
      @hide="closeModal"
    >
      <div v-if="selectedAnuncio">
        <form class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Parte izquierda: Campos del formulario -->
          <div class="space-y-6">
            <div>
              <label for="titulo">Título</label>
              <InputText
                v-model="selectedAnuncio.titulo"
                type="text"
                id="titulo"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled
              />
            </div>
            <div>
              <label for="tipo">Tipo de Anuncio</label>
              <InputText
                v-model="selectedAnuncio.tipo"
                id="tipo"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="fecha_inicio">Fecha de Inicio</label>
                <InputText
                  v-model="selectedAnuncio.fecha_inicio"
                  type="date"
                  id="fecha_inicio"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled
                />
              </div>
              <div>
                <label for="fecha_fin">Fecha de Fin</label>
                <InputText
                  v-model="selectedAnuncio.fecha_fin"
                  type="date"
                  id="fecha_fin"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled
                />
              </div>
            </div>
          </div>

          <!-- Parte derecha: Carga de imagen y descripción -->
          <div class="flex flex-col items-start space-y-2">
            <div class="w-full">
              <label for="miniatura">Miniatura</label>
              <div class="border rounded-xl flex justify-center">
                <img
                  v-if="selectedAnuncio.miniatura"
                  :src="selectedAnuncio.miniatura"
                  alt="Miniatura"
                  class="my-4 h-24 w-24 object-cover rounded"
                />
              </div>
            </div>
            <div class="w-full">
              <label for="descripcion">Descripción</label>
              <textarea
                v-model="selectedAnuncio.descripcion"
                id="descripcion"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="4"
                disabled
              />
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import api from "@/axiosConfig.js";

const confirm = useConfirm();
const toast = useToast();

const authStore = useAuthStore();
const idUsuario = authStore.usuario.id;

const anuncios = ref([]);
const showModal = ref(false);
const selectedAnuncio = ref(null);
const router = useRouter();
const filter = ref("");
const token = authStore.token;

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const openAddView = () => {
  router.push("/panelControl/formAnuncio");
};

const openEditView = (anuncio) => {
  router.push(`/panelControl/formAnuncio/${anuncio.id}`);
};
// Función para recargar la página
const reloadPage = () => {
  fetchAnuncios();
};
const expandedModulos = ref({}); // Para manejar la expansión de las descripciones
const toggleExpand = (id) => {
  expandedModulos.value[id] = !expandedModulos.value[id];
};
// Cambia esta función
const confirmarEliminacion = async (id) => {
  confirm.require({
    group: "headless",
    message: "¿Estás seguro de que deseas eliminar este anuncio?",
    header: "Confirmación",
    icon: "pi-exclamation-triangle",
    accept: () => eliminarAnuncio(id), // Llama a eliminarAnuncio solo si el usuario acepta

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

const eliminarAnuncio = async (id) => {
  try {
    await api.delete(`/anuncios/eliminarAnuncio/${id}`, {
      params: { idUsuario },
    });
    toast.add({
      severity: "info",
      summary: "Confirmado",
      detail: "Eliminación exitosa",
      life: 3000,
    });
    fetchAnuncios();
  } catch (error) {
    console.error("Error al eliminar el anuncio:", error);
  }
};
const showDetails = (anuncio) => {
  selectedAnuncio.value = anuncio;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedAnuncio.value = null;
};

const filteredAnuncios = computed(() => {
  if (!filter.value) return anuncios.value;
  return anuncios.value.filter((anuncio) =>
    Object.values(anuncio).some((value) =>
      String(value).toLowerCase().includes(filter.value.toLowerCase())
    )
  );
});

const filteredAnunciosConNumeracion = computed(() =>
  filteredAnuncios.value.map((anuncio, index) => ({
    ...anuncio,
    index: index + 1,
  }))
);
const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Anuncios");

  // Agrega encabezados
  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Título", key: "titulo", width: 30 },
    { header: "Miniatura", key: "miniatura", width: 30 },
    { header: "Descripción", key: "descripcion", width: 50 },
    { header: "Fecha Inicio", key: "fecha_inicio", width: 15 },
    { header: "Fecha Fin", key: "fecha_fin", width: 15 },
    { header: "Tipo", key: "tipo", width: 10 },
  ];

  // Agrega filas
  anuncios.value.forEach((anuncio) => {
    worksheet.addRow(anuncio);
  });

  // Generar y descargar el archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "anuncios.xlsx");
};
const fetchAnuncios = async () => {
  try {
    const response = await api.get("/anuncios/anuncio");
    anuncios.value = response.data;
  } catch (error) {
    console.error("Error al obtener anuncios:", error);
  }
};

onMounted(fetchAnuncios);
</script>

<style scoped>
/* Agrega aquí tus estilos personalizados si es necesario */
</style>
