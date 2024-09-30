<template>
  <div class="p-4">
    <div class="card">
      <h2 class="text-2xl mb-4">Cuotas - Pagos</h2>
      <Divider />
      <!-- Contenedor para alinear el botón y el buscador en la misma línea
        <div class="flex justify-between items-center mb-4">
          Buscador alineado a la izquierda
          <div class="flex flex-1 max-w-md">
            <IconField class="flex flex-1">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <inputText v-model="searchTerm" placeholder="Buscar..." class="w-full" />
            </IconField>
          </div>
        </div>
        <Divider /> -->
      <Divider align="center" type="solid">
        <p class="text-3xl font-semibold tracking-widest">Cuotas</p>
      </Divider>
      <Fieldset legend="Tabla de Datos"> </Fieldset>
      <div
        class="card dark:shadow-purple-950 shadow-2xl dark:shadow-2xl dark:border-violet-400"
      >
        <DataTable
          :value="cuotas"
          :tableStyle="{ 'min-width': '50rem' }"
          :rows="4"
          :paginator="true"
          :rowsPerPageOptions="[4, 8, 12]"
          striped-rows
          lazy
        >
          <template #paginatorstart>
            <Button
              type="button"
              icon="pi pi-refresh"
              text
              @click="reloadPage"
            />
          </template>
          <template #body="rowData">
            {{ getRowIndex(rowData) }}
          </template>

          <Column header="#" sortable class="px-6 py-4">
            <template #body="rowData">
              {{ getRowIndex(rowData) }}
            </template>
          </Column>
          <Column header="Monto de la Cuota" class="px-6 py-4">
            <template #body="rowData">
              {{ rowData.data.montoCuota }}
            </template>
          </Column>
          <Column
            field="metodoPago"
            header="Metodo de Pago"
            sortable
            class="px-6 py-4"
          />
          <Column field="estadoCuota" header="Estado" class="px-6 py-4">
            <template #body="rowData">
              <Tag
                v-if="rowData.data.estadoCuota === 0"
                value="Eliminado"
                severity="danger"
                class="px-2 py-1"
              />
              <Tag
                v-else-if="rowData.data.estadoCuota === 1"
                value="Pagado"
                severity="success"
                class="px-2 py-1"
              />
              <Tag
                v-else-if="rowData.data.estadoCuota === 2"
                value="Pendiente"
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
            field="fecha"
            header="Fecha de Vencimiento"
            sortable
            class="px-6 py-4"
          >
            <template #body="rowData">
              {{ formatDate(rowData.data.fechaVencimiento) }}
            </template>
          </Column>

          <Column header="Acciones" class="px-6 py-4">
            <template #body="rowData">
              <div class="flex items-center space-x-2">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-secondary"
                  @click="showCuotaDetails(rowData.data)"
                />
                <Button
                  icon="pi pi-money-bill"
                  class="p-button-rounded p-button-info"
                  @click="openEditModal(rowData.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
    <!-- Modal para Confirmar Eliminación -->
    <Dialog
      v-model:visible="isConfirmModalOpen"
      header="Confirmar Eliminación"
      modal
      class="w-full max-w-sm"
    >
      <div class="p-4">
        <p>¿Estás seguro de que deseas eliminar esta cuota?</p>
        <div class="mt-4 flex justify-end space-x-4">
          <Button
            class="bg-red-500 text-white px-4 py-2 rounded-md"
            @click="deleteUsuario"
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
    <!-- Modal para mostrar detalles de la cuota -->
    <Dialog
      header="Detalles de la Cuota"
      v-model:visible="showUserDetailsModal"
      modal
      :style="{ width: '50vw' }"
      @hide="closeUserDetailsModal"
    >
      <div v-if="selectedCuota2">
        <form class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Parte izquierda: Campos del formulario -->
          <!-- COMPLETAR EL FORMULARIO DE CUOTA PAGO CON VUEJS -->
        </form>
      </div>
    </Dialog>
    <Dialog
      v-model:visible="isModalOpen"
      :header="isEditMode ? 'Editar Cuota' : 'Agregar Cuota'"
      :visible="isModalOpen"
      modal
      class=" "
      :style="{ zIndex: 10 }"
    >
      <form @submit.prevent="isEditMode ? updateCuota() : addCuota()">
        <div class="grid grid-cols-2 gap-4 p-4">
          <div>
            <label for="montoCuota" class="block text-sm font-medium mb-2"
              >Monto de la Cuota</label
            >
            <InputText
              v-model="selectedCuota.montoCuota"
              type="number"
              id="montoCuota"
              class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              step="0.01"
              :readonly="true"
            />
          </div>
          <div>
            <label for="metodoPago" class="block text-sm font-medium mb-2"
              >Método de Pago</label
            >
            <Select
              v-model="selectedCuota.metodoPago"
              :options="metodosPago"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione un Metodo de Pago"
              checkmark
              :highlightOnSelect="false"
              class="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
          </div>
          <div class="field">
            <label for="estadoCuota">Estado de la Cuota</label>
            <Select
              v-model="selectedCuota.estadoCuota"
              :options="estadosCuota"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione el Estado Actual de la Cuota"
              checkmark
              :highlightOnSelect="false"
              class="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
          </div>
          <div class="field">
            <label for="fechaVencimiento">Fecha de Vencimiento</label>
          </div>
        </div>
        <div class="p-4 flex justify-end space-x-4">
          <Button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded-md"
            >Guardar</Button
          >
          <Button
            type="button"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            @click="closeModal"
            >Cancelar</Button
          >
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";
import { useToast } from "primevue/usetoast";

const authStore = useAuthStore();

const cuotas = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const isConfirmModalOpen = ref(false);
const toast = useToast();
const showCuotaDetailsModal = ref(false);
const selectedCuota2 = ref(null);

const props = defineProps({
  pagoId: {
    type: String,
    required: true,
  },
});

const token = authStore.token;
const idUsuario = authStore.usuario.id;

const selectedCuota = ref({
  montoCuota: "",
  estadoCuota: "",
  metodoPago: "",
  fechaVencimiento: "",
  fechaPagoCuota: "",
  idUsuarioModificacion: idUsuario,
});

// Opciones para el Dropdown
const metodosPago = [
  { label: "Tarjeta", value: "tarjeta" },
  { label: "Transferencia", value: "transferencia" },
  { label: "Efectivo", value: "efectivo" },
  { label: "QR", value: "qr" },
];

const estadosCuota = [
  { label: "Pagado", value: 1 },
  { label: "Pendiente", value: 2 },
];

const formatDate = (dateString) => {
  if (!dateString) return "";
  // Suponiendo que la fecha viene en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Meses desde 0
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};
const showCuotaDetails = (cuota) => {
  selectedCuota2.value = cuota;
  showCuotaDetailsModal.value = true;
};

const closeUserDetailsModal = () => {
  showCuotaDetailsModal.value = false;
  selectedCuota2.value = null;
};
const fetchData = async () => {
  try {
    const response = await api.get(`/cuotas/cuota/${props.pagoId}`);
    console.log(response.data);
    cuotas.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchData);

const openAddModal = () => {
  isEditMode.value = false;
  selectedCuota.value = {
    // AGREGAR LA CUOTA
  };
  isModalOpen.value = true;
};

const openEditModal = (cuota) => {
  console.log("HOLAAAAAAAAAAAAA");

  isEditMode.value = true;
  selectedCuota.value = { ...cuota };
  selectedCuota.value.fechaVencimiento = formatToDateInput(
    cuota.fechaVencimiento
  );
  selectedCuota.value.idUsuarioModificacion = idUsuario;
  isModalOpen.value = true;
};

const formatToDateInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Meses desde 0
  const year = date.getUTCFullYear();
  return `${year}-${month}-${day}`;
};

function convertirFechaAMysql(fecha) {
  const fechaObj = new Date(fecha);
  const year = fechaObj.getFullYear();
  const month = String(fechaObj.getMonth() + 1).padStart(2, "0"); // Los meses comienzan en 0
  const day = String(fechaObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const closeModal = () => {
  isModalOpen.value = false;
};
const closeConfirmModal = () => {
  isConfirmModalOpen.value = false;
};
// Función para recargar la página
const reloadPage = () => {
  fetchData();
};

const updateCuota = async () => {
  closeModal();

  try {
    await api.put(
      `/cuotas/editarCuota/${selectedCuota.value.idCuotaPago}`
      // ENVIAR LA CUOTA
    );

    // Actualizar la cuota
    const index = cuotas.value.findIndex(
      (cuota) => cuota.idCuotaPago === selectedCuota.value.idCuotaPago
    );

    if (index !== -1) {
      cuotas.value[index] = { ...selectedCuota.value }; // Actualizar el usuario en la lista
    }
    fetchData();
    toast.add({
      severity: "success",
      summary: "Datos Actuaizados de la Cuota",
      detail: "Los datos de la cuota se han actualizado correctamente.",
      life: 3000,
    });
  } catch (error) {
    console.error("Error al actualizar cuota:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Hubo un problema al actualizar la cuota. Intente nuevamente.",
      life: 3000,
    });
  }
};

const getRowIndex = (rowData) => {
  return (
    cuotas.value.findIndex(
      (cuota) => cuota.idCuotaPago === rowData.data.idCuotaPago
    ) + 1
  );
};
</script>
