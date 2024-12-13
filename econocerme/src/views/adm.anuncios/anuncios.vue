<template>
  <div class="p-4">
    <div class=" ">
      <Breadcrumb :home="home" :model="items" class="card h-14">
        <template #item="{ item, props }">
          <router-link
            v-if="item.route"
            v-slot="{ href, navigate }"
            :to="item.route"
            custom
          >
            <a :href="href" v-bind="props.action" @click="navigate">
              <span :class="[item.icon, 'text-color']" />
              <span class="text-black dark:text-white font-semibold">{{
                item.label
              }}</span>
            </a>
          </router-link>
          <a
            v-else
            :href="item.url"
            :target="item.target"
            v-bind="props.action"
          >
            <span class="text-surface-700 dark:text-surface-0">{{
              item.label
            }}</span>
          </a>
        </template>
      </Breadcrumb>
    </div>
    <div class="card">
      <h2 class="text-4xl mb-4 items-end text-shadow-3xl font-sans">
        ANUNCIOS
      </h2>

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
      <Divider align="center" type="solid">
        <p class="text-2xl font-semibold tracking-wider leading-relaxed">
          Lista de Anuncios
        </p>
      </Divider>
      <div
        class="card dark:shadow-purple-950 shadow-2xl dark:shadow-2xl dark:border-violet-400"
      >
        <DataTable
          :value="filteredAnunciosConNumeracion"
          :rows="4"
          :paginator="true"
          :rowsPerPageOptions="[4, 8, 12]"
          stripedRows
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
                  <span v-html="slotProps.data.descripcion.slice(0, 120)"></span
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
                  v-tooltip.left="{
                    value: 'Ver',
                    showDelay: 0,
                    hideDelay: 100,
                  }"
                  raised
                />
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-info"
                  @click="openEditView(rowData.data)"
                  v-tooltip.top="{
                    value: 'Editar',
                    showDelay: 0,
                    hideDelay: 100,
                  }"
                  raised
                />

                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger"
                  @click="confirmarEliminacion(rowData.data.id)"
                  v-tooltip.right="{
                    value: 'Eliminar',
                    showDelay: 0,
                    hideDelay: 100,
                  }"
                  severity="danger"
                  raised
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
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
    <!-- Modal para mostrar detalles del anuncio -->
    <Dialog
      header="Detalles del Anuncio"
      v-model:visible="showModal"
      maximizable
      modal
      :style="{ width: '60vw' }"
      @hide="closeModal"
    >
      <Divider />

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
                readonly
              />
            </div>
            <div>
              <label for="tipo">Tipo de Anuncio</label>
              <InputText
                v-model="selectedAnuncio.tipo"
                id="tipo"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                readonly
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="fecha_inicio">Fecha de Inicio</label>
                <DatePicker
                  v-model="selectedAnuncio.fecha_inicio"
                  id="fecha_inicio"
                  class="block text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  readonly
                />
              </div>
              <div>
                <label for="fecha_fin">Fecha de Fin</label>
                <DatePicker
                  v-model="selectedAnuncio.fecha_fin"
                  id="fecha_fin"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  readonly
                />
              </div>
            </div>
          </div>

          <!-- Parte derecha: Carga de imagen y descripción -->
          <div class="flex flex-col items-start space-y-2">
            <div class="w-full">
              <label for="miniatura">Miniatura</label>
              <div class="border rounded-xl flex justify-center">
                <Image
                  v-if="selectedAnuncio.miniatura"
                  :src="selectedAnuncio.miniatura"
                  alt="Miniatura"
                  preview
                  class="my-4 h-44 w-44 rounded"
                />
              </div>
            </div>
          </div>
        </form>
        <div class="w-full">
          <label for="descripcion">Descripción</label>
          <div class="card">
            <p class="" v-html="selectedAnuncio.descripcion"></p>
          </div>
        </div>
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
const home = computed(() => {
  const tipoUsuario = authStore.usuario.tipoUsuario;
  return {
    icon: "pi pi-home",
    route:
      tipoUsuario === "admin"
        ? "/panelControl/main"
        : "/panelCoaches/mainCoach",
  };
});
// Computed para asignar dinámicamente la ruta según el tipo de usuario
const items = computed(() => {
  const tipoUsuario = authStore.usuario.tipoUsuario;

  return [
    {
      label: "Anuncios",
      icon: "pi pi-megaphone",
      route:
        tipoUsuario === "admin"
          ? "/panelControl/anuncios"
          : "/panelCoaches/anuncios",
    },
    // Aquí puedes añadir más opciones de menú según sea necesario
  ];
});

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
  if (authStore.usuario.tipoUsuario === "admin") {
    router.push("/panelControl/formAnuncio");
  } else if (authStore.usuario.tipoUsuario === "coach") {
    router.push("/panelCoaches/formAnuncio");
  }
};

const openEditView = (anuncio) => {
  if (authStore.usuario.tipoUsuario === "admin") {
    router.push(`/panelControl/formAnuncio/${anuncio.id}`);
  } else if (authStore.usuario.tipoUsuario === "coach") {
    router.push(`/panelCoaches/formAnuncio/${anuncio.id}`);
  }
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
  selectedAnuncio.value = {
    ...anuncio,
    fecha_inicio: formatDate(anuncio.fecha_inicio),
    fecha_fin: formatDate(anuncio.fecha_fin),
  };

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
    const response =
      authStore.usuario.tipoUsuario === "admin"
        ? await api.get("/anuncios/anuncio")
        : await api.get(`/anuncios/anuncioCoach/${authStore.usuario.id}`);
    anuncios.value = response.data.reverse();
  } catch (error) {
    console.error("Error al obtener anuncios:", error);
  }
};

onMounted(fetchAnuncios);
</script>

<style scoped></style>
