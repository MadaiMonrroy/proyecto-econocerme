<template>
  <div class="">
    <div class="card">
      <h2 class="text-4xl mb-4 items-end text-shadow-3xl font-sans">
        INSCRIPCIONES
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
              v-model="globalFilter"
              class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Buscar cursos"
            />
          </IconField>
        </div>
        <div class="flex-none">
          <Button
            class="bg-green-500 text-white p-button-rounded p-button-success flex items-center"
            @click="openAddView"
            severity="success"
          >
            <i class="pi pi-plus-circle mr-2"></i> Registrar Inscripción</Button
          >
        </div>
      </div>
      <Divider />
      <div
        class="card dark:border-violet-500 dark:shadow-2xl dark:shadow-violet-950 shadow-2xl"
      >
        <DataTable
          :value="inscripcionesConNumeracion"
          :rows="5"
          :paginator="true"
          :rowsPerPageOptions="[5, 10, 25]"
          :globalFilter="globalFilter"
          :globalFilterFields="['nombreCompleto', 'observacion']"
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
          <Column field="index" header="#" sortable class="px-6 py-4" />
          <Column
            field="nombreCompleto"
            header="Nombre Completo"
            class="px-6 py-4"
            sortable
          />
          <Column field="fotoPerfil" header="Foto de Perfil" class="px-6 py-4">
            <template #body="slotProps">
              <img
                :src="slotProps.data.fotoPerfil"
                alt="Foto de Perfil"
                class="w-10 h-10 rounded-full"
              />
            </template>
          </Column>
          <Column
            field="idInscripcion"
            header="Cod. Inscripcion"
            class="px-6 py-4"
          />

          <Column
            field="fechaInscripcion"
            header="Fecha de Inscripción"
            class="px-6 py-4"
            sortable
          >
            <template #body="slotProps">
              <span>{{ formatDate(slotProps.data.fechaInscripcion) }}</span>
            </template>
          </Column>
          <Column field="observacion" header="Observación" class="px-6 py-4" />

          <Column
            field="montoTotal"
            sortable
            header="Monto Total"
            class="px-6 py-4"
          >
            <template #body="slotProps">
              <span>{{ slotProps.data.montoTotal }} Bs.</span>
            </template>
          </Column>
          <Column field="estado" header="Estado" class="px-6 py-4">
            <template #body="rowData">
              <Tag
                v-if="rowData.data.estado === 1"
                value="Habilitado"
                severity="success"
                class="px-2 py-1"
              />
              <Tag
                v-else-if="rowData.data.estado === 2"
                value="Inhabilitado"
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
          <!-- Aquí se añade el botón de ojo para ver los cursos -->
          <Column header="Cursos Registrados" class="px-6 py-4">
            <template #body="slotProps">
              <div class="flex">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-info mr-2"
                  @click="showCourses(slotProps.data)"
                />
                <span class="text-center pt-4">
                  {{ slotProps.data.cursos.length }}</span
                >
              </div>
            </template>
          </Column>

          <Column header="Pagos" class="px-6 py-4">
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <!-- <Button icon="pi pi-pencil" class="p-button-rounded p-button-info"
                @click="openEditView(slotProps.data)" /> -->
                <Button
                  icon="pi pi-dollar"
                  class="p-button-rounded p-button-success"
                  @click="obtenerIdPagoPorInscripcion(slotProps.data)"
                  v-tooltip.top="{
                  value: 'Ver Cuotas',
                  showDelay: 0,
                  hideDelay: 100,
                }"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
      <DynamicDialog />
      <!-- Dialogo dinámico -->

      <!-- Modal para Confirmar Eliminación -->
      <Dialog
        v-model:visible="isConfirmModalOpen"
        header="Confirmar Eliminación"
        modal
        class="w-full max-w-sm"
      >
        <div class="p-4">
          <p>¿Estás seguro de que deseas eliminar esta inscripción?</p>
          <div class="mt-4 flex justify-end space-x-4">
            <Button
              class="text-white px-4 py-2 rounded-md"
              severity="danger"
              @click="eliminarInscripcion"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useDialog } from "primevue/usedialog";
import api from "@/axiosConfig.js";
import cursosLista from "./cursosLista.vue"; // Asegúrate de importar el componente correctamente
import ExcelJS from "exceljs";

const authStore = useAuthStore();
const inscripciones = ref([]);
const router = useRouter();
const isConfirmModalOpen = ref(false);
let inscripcionToDelete = ref(null);
const globalFilter = ref(""); // Variable para almacenar el valor del buscador global
const pagoId = ref(null); // Usamos una ref para el idPago

const openAddView = () => {
  router.push("/panelControl/formInscripcion");
};

const openEditView = (inscripcion) => {
  router.push(`/panelControl/formInscripcion/${inscripcion.idInscripcion}`);
};
const obtenerIdPagoPorInscripcion = async (inscripcion) => {
  try {

    const response = await api.get(
      `/cuotas/obtenerIdPagoPorInscripcion/${inscripcion.idInscripcion}`
    );
    if (response.data.idPago) {
      pagoId.value = response.data.idPago; // Asignamos el idPago
      openEditCuota(inscripcion);
    } else {
      console.warn("No se encontró un idPago para esta inscripción.");
    }
  } catch (error) {
    console.error("Error al obtener el idPago:", error);
  }
};
const openEditCuota = (inscripcion) => {
  console.log(pagoId)
  router.push({
        path: `/panelControl/cuotas/${inscripcion.idInscripcion}`,
        query: { pagoId: pagoId.value }  // Enviamos el pagoId como parámetro de consulta
      });};

const closeConfirmModal = () => {
  isConfirmModalOpen.value = false;
};

const eliminarInscripcionId = (id) => {
  inscripcionToDelete.value = id;
  isConfirmModalOpen.value = true;
};

const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Anuncios");

  // Agrega encabezados
  worksheet.columns = [
    { header: "#", key: "id", width: 10 },
    { header: "Foto de Perfil", key: "fotoPerfil", width: 30 },
    { header: "Nombres", key: "nombres", width: 20 },
    { header: "Primer Apellido", key: "primerApellido", width: 15 },
    { header: "Segundo Apellido", key: "segundoApellido", width: 15 },
    { header: "Estado", key: "estado", width: 10 },
    { header: "Email", key: "email", width: 20 },
    { header: "Fecha de Nacimiento", key: "fechaNacimiento", width: 5 },
  ];

  // Agrega filas
  usuarios.value.forEach((usuario) => {
    worksheet.addRow(usuario);
  });

  // Generar y descargar el archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "usuarios.xlsx");
};

const eliminarInscripcion = async (idInscripcion) => {
  try {
    await api.delete(
      `/inscripciones/eliminarInscripcion/${inscripcionToDelete.value}`
    );
    fetchData();

    closeConfirmModal();
    toast.add({
      severity: "success",
      summary: "Inscripción Eliminada",
      detail: "La inscripción ha sido eliminada con éxito.",
      life: 3000,
    });
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Hubo un problema al eliminar la inscripción.",
      life: 3000,
    });
  }
};

const fetchData = async () => {
  try {
    const response = await api.get("/inscripciones/inscripcion");
    inscripciones.value = response.data.data.reverse();
    console.log(response);
    // console.log(response.data.data);
  } catch (error) {
    console.error(error);
  }
};
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
onMounted(() => {
  fetchData();
});

const inscripcionesConNumeracion = computed(() => {
  // Filtrar cursos basado en globalFilter
  const filter = globalFilter.value.toLowerCase();
  return inscripciones.value
    .filter((inscripcion) => {
      const nombreCompleto = inscripcion.nombreCompleto?.toLowerCase() || "";
      const idInscripcion = inscripcion.idInscripcion?.toString() || "";
      const fechaInscripcion = formatDate(inscripcion.fechaInscripcion || "");
      const montoTotal = inscripcion.montoTotal?.toString() || "";

      // Verificamos si alguno de los campos contiene el filtro
      return (
        nombreCompleto.includes(filter) ||
        idInscripcion.includes(filter) ||
        fechaInscripcion.includes(filter) ||
        montoTotal.includes(filter)
      );
    })

    .map((inscripcion, index) => ({
      ...inscripcion,
      index: index + 1,
      expanded: false, // Añadir la propiedad `expanded` por defecto
    }));
});
const dialog = useDialog();
const dialogRef = ref(null);

const showCourses = (inscripcion) => {
  if (!inscripcion.cursos || inscripcion.cursos.length === 0) {
    console.error("No se encontraron cursos para esta inscripción");
    return;
  }

  // Cierra el diálogo actual si está abierto
  if (dialogRef.value) {
    dialogRef.value.close();
  }

  // Abre el nuevo diálogo
  dialogRef.value = dialog.open(cursosLista, {
    header: `Cursos Registrados de ${inscripcion.nombreCompleto}`, // Incluye el nombre completo en el encabezado
    style: {
      width: "50vw", // Ajusta el ancho del diálogo
    },
    breakpoints: {
      "960px": "75vw",
      "640px": "90vw",
    },
    modal: true,
    data: {
      cursos: inscripcion.cursos,
      nombreCompleto: inscripcion.nombreCompleto,
    },
  });
};
</script>
