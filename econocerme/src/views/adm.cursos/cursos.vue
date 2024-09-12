<template>
  <div class="p-4">
    <div class=" ">
      <Breadcrumb :home="home" :model="items" class="card h-14">
      <template #item="{ item, props }">
                <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                    <a :href="href" v-bind="props.action" @click="navigate">
                        <span :class="[item.icon, 'text-color']" />
                        <span class="text-primary font-semibold">{{ item.label }}</span>
                    </a>
                </router-link>
                <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                    <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
                </a>
            </template>
      </Breadcrumb>
    </div>
    <div class="card">
      <h2 class="text-3xl mb-4 items-end">CURSOS</h2>
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
              v-model="globalFilter"
              class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Buscar cursos"
            />
          </IconField>
        </div>
        <!-- Botón agregar alineado a la derecha -->
        <div class="flex-none">
          <Button
            class="bg-green-500 text-white p-button-rounded p-button-success flex items-center"
            @click="openAddView"
          >
            <i class="pi pi-plus-circle mr-2"></i>
            Agregar Curso
          </Button>
        </div>
      </div>
      <Divider />
      <Fieldset>
        <template #legend>
          <span class="text-2xl tracking-wide">Lista de Cursos</span>
        </template>
        <DataTable
          :value="cursosConNumeracion"
          :rows="5"
          :paginator="true"
          :rowsPerPageOptions="[5, 10, 25]"
          :globalFilter="globalFilter"
          :globalFilterFields="[
            'titulo',
            'especialidad',
            'descripcion',
            'duracion',
            'precio',
          ]"
          class="p-datatable-striped"
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
          <Column field="index" header="#" class="px-6 py-4" />
          <Column field="titulo" header="Título" class="px-6 py-4" />
          <Column header="Miniatura" class="px-6 py-4">
            <template #body="slotProps">
              <Image
                v-if="slotProps.data.miniatura"
                :src="slotProps.data.miniatura"
                alt="Miniatura"
                preview
                class="h-14 w-16 object-cover rounded-full"
              />
            </template>
          </Column>
          <Column
            field="especialidad"
            header="Especialidad"
            class="px-6 py-4"
          />
          <Column field="descripcion" header="Descripción" class="px-6 py-4" />
          <Column field="duracion" header="Duración" class="px-6 py-4" />
          <Column field="precio" header="Precio" class="px-6 py-4" />
          <Column header="Acciones" class="px-6 py-4">
            <template #body="slotProps">
              <div class="flex items-center space-x-2 align-middle">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  severity="info"
                  @click="openEditView(slotProps.data)"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  rounded
                  @click="eliminarCurso(slotProps.data)"
                />
                <Button
                  icon="pi pi-plus-circle"
                  severity="help"
                  rounded
                  @click="openModulosView(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </Fieldset>
    </div>
    <!-- Modal para Confirmar Eliminación -->
    <Dialog
      v-model:visible="isConfirmModalOpen"
      header="Confirmar Eliminación"
      modal
      class="w-full max-w-sm"
    >
      <div class="p-4">
        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
        <div class="mt-4 flex justify-end space-x-4">
          <Button
            class="bg-red-500 text-white px-4 py-2 rounded-md"
            @click="deletecurso"
            >Eliminar</Button
          >
          <Button
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            @click="closeConfirmModal"
            >Cancelar</Button
          >
        </div>
      </div>
    </Dialog>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";
const toast = useToast();
const authStore = useAuthStore();

const cursos = ref([]);
const router = useRouter();
const token = authStore.token;
const idUsuario = authStore.usuario.id;


const isConfirmModalOpen = ref(false);
let cursoToDelete = ref(null); // Usuario a eliminar

// Agregar una variable para el filtro global
const globalFilter = ref(""); // Variable para almacenar el valor del buscador global

const home = ref({
    icon: 'pi pi-home',
    route: '/panelControl/main'
});
const items = ref([
    { label: 'Cursos', 
      icon: "pi pi-book",
      route: '/panelControl/cursos' }
]);
const openAddView = () => {
  router.push("/panelControl/formCurso"); // Ruta para agregar curso
};

const openEditView = (curso) => {
  router.push(`/panelControl/formCurso/${curso.idCurso}`); // Ruta para editar curso
  console.log(curso);
};
const eliminarCurso = (idCurso) => {
  cursoToDelete.value = idCurso.idCurso;
  isConfirmModalOpen.value = true;
};
const closeConfirmModal = () => {
  isConfirmModalOpen.value = false;
};

const deletecurso = async (idCurso) => {
  try {
    await api.delete(`/cursos/eliminarCurso/${cursoToDelete.value}`, {
      params: { idUsuario }
    });
    cursos.value = cursos.value.filter((curso) => curso.idCurso !== idCurso);
    fetchData();
    closeConfirmModal();
    toast.add({
      severity: "info",
      summary: "Curso Eliminado",
      detail: "El curso ha sido eliminado con éxito.",
      life: 3000,
    });
    
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Hubo un problema al eliminar el usuario.",
      life: 3000,
    });
    // Manejar el error de forma adecuada
  }
};

const openModulosView = (curso) => {
  router.push(`/panelControl/modulos/${curso.idCurso}`);
};
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
// Función para recargar la página
const reloadPage = () => {
  fetchData();
};
const fetchData = async () => {
  try {
    const response = await api.get("/cursos/curso");
    cursos.value = response.data; // Aquí se espera que `response.data` sea el array de cursos
  } catch (error) {
    console.error(error);
    // Manejar el error de forma adecuada
  }
};

onMounted(fetchData);

const cursosConNumeracion = computed(() => {
  // Filtrar cursos basado en globalFilter
  const filter = globalFilter.value.toLowerCase();
  return cursos.value
    .filter((curso) => {
      return (
        curso.titulo.toLowerCase().includes(filter) ||
        curso.especialidad.toLowerCase().includes(filter) ||
        curso.descripcion.toLowerCase().includes(filter) ||
        curso.duracion.toString().includes(filter) || // Filtrar por duración
        curso.precio.toString().includes(filter) // Filtrar por precio
      );
    })
    .map((curso, index) => ({
      ...curso,
      index: index + 1,
    }));
});
</script>
