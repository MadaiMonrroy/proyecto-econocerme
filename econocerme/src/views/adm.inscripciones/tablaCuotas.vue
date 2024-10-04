<template>
  <div class="p-4">
    <Divider align="center" type="solid">
      <p
        class="text-4xl mb-4 items-end text-shadow-3xl font-sans font-semibold tracking-widest"
      >
        Cuotas - Pagos
      </p>
    </Divider>

    <div
      class="card dark:shadow-purple-950 shadow-2xl dark:shadow-2xl dark:border-violet-400"
    >
      <DataTable
        :value="cuotas"
        :tableStyle="{ 'min-width': '50rem' }"
        selectionMode="multiple"
      >
        <Column header="#" sortable class="px-6 py-4">
          <template #body="rowData">{{ getRowIndex(rowData) }}</template>
        </Column>
        <Column
          field="fecha"
          header="Fecha de Vencimiento"
          sortable
          class="px-6 py-4"
        >
          <template #body="rowData">{{
            formatDate(rowData.data.fechaVencimiento)
          }}</template>
        </Column>
        <Column header="Cod. Recibo Pago" class="px-6 py-4">
          <template #body="rowData"
            >{{ rowData.data.idCuotaPago }}-{{
              rowData.data.idInscripcion
            }}</template
          >
        </Column>
        <Column field="fecha" header="Fecha de Pago" sortable class="px-6 py-4">
          <template #body="rowData">{{
            formatDate(rowData.data.fechaPagoCuota)
          }}</template>
        </Column>
        <Column header="Monto de la Cuota" class="px-6 py-4">
          <template #body="rowData">{{ rowData.data.montoCuota }}</template>
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
        <Column header="Acciones" class="px-6 py-4">
          <template #body="rowData">
            <div class="flex items-center space-x-2">
              <Button
                icon="pi pi-money-bill"
                severity="success"
                rounded
                @click="openEditModal(rowData.data)"
                v-tooltip.top="{
                  value: 'Confirmar Pago',
                  showDelay: 0,
                  hideDelay: 100,
                }"
              />
              <Button
                v-if="rowData.data.estadoCuota === 1"
                icon="pi pi-file-pdf"
                rounded
                severity="danger"
                @click="generatePdf(rowData.data)"
                v-tooltip.top="{
                  value: 'Generar Recibo',
                  showDelay: 0,
                  hideDelay: 100,
                }"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="isModalOpen"
      :header="isEditMode ? 'Editar Cuota' : 'Agregar Cuota'"
      modal
      class=""
      :style="{ zIndex: 10 }"
    >
      <form @submit.prevent="isEditMode ? updateCuota() : addCuota()">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
          <div class="md:col-span-2 lg:col-span-1">
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
          <div class="md:col-span-2 lg:col-span-1">
            <label for="fechaVencimiento" class="block text-sm font-medium mb-2"
              >Fecha de Vencimiento</label
            >
            <DatePicker
              v-model="selectedCuota.fechaVencimiento"
              dateFormat="dd-mm-yy"
              :manualInput="false"
              showIcon
              fluid
              :showOnFocus="false"
              class="block w-full text-sm border-gray-300 text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              readonly
            />
          </div>
        </div>
        <!-- Añadir estos campos en la sección del formulario -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
          <div class="md:col-span-2 lg:col-span-1">
            <label for="interes" class="block text-sm font-medium mb-2"
              >Interés por Retraso</label
            >
            <InputText
              v-model="interes"
              type="number"
              id="interes"
              class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :readonly="true"
            />
          </div>
          <div class="md:col-span-2 lg:col-span-1">
            <label for="montoTotal" class="block text-sm font-medium mb-2"
              >Monto Total</label
            >
            <InputText
              v-model="montoTotal"
              type="number"
              id="montoTotal"
              class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :readonly="true"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
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
          <div>
            <label for="estadoCuota" class="block text-sm font-medium mb-2"
              >Estado de la Cuota</label
            >
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
        </div>
        <!-- Input para fecha de pago -->
        <div
          v-if="selectedCuota.estadoCuota === 1"
          class="grid grid-cols-1 p-4"
        >
          <label for="fechaPagoCuota" class="block text-sm font-medium mb-2"
            >Fecha de Pago</label
          >
          <DatePicker
            v-model=selectedCuota.fechaPagoCuota
            type="text"
            id="fechaPagoCuota"
            class="block w-full text-sm border-gray-300"
            readonly
            showIcon
            :value="fechaHoy"
          />
        </div>
        <div class="p-4 flex justify-end space-x-4">
          <Button
            type="button"
            severity="secondary"
            class="px-4 py-2 rounded-md w-36"
            label="Cancelar"
            rounded
            raised
            @click="closeModal"
          />
          <Button
            type="submit"
            severity="help"
            class="px-4 py-2 rounded-lg w-36"
            rounded
            label="Confirmar Pago"
            raised
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from "vue";
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
const interes = ref(0);
const montoTotal = ref(0);

const props = defineProps({
  pagoId: {
    type: String,
    required: true,
  },
});

const token = authStore.token;
const idUsuario = authStore.usuario.id;
const hoy = new Date(); // Fecha actual como objeto Date

const selectedCuota = ref({
  montoCuota: "",
  estadoCuota: "",
  metodoPago: "",
  fechaVencimiento: "",
  fechaPagoCuota: "",
  idUsuarioModificacion: idUsuario,
});
// Computed para mostrar la fecha en formato dd-mm-yyyy
const fechaHoy = computed(() => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
});
const fechahoycalculate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
const calcularInteres = () => {
  const fechaVencimiento = selectedCuota.value.fechaVencimiento; // Asumiendo que esto es '29-09-2024'
  
  const fechaPagoCuota = formatDate(selectedCuota.value.fechaPagoCuota);
  const montoCuota = parseFloat(selectedCuota.value.montoCuota) || 0;
  console.log(fechaVencimiento > fechaPagoCuota)
  // Comprobar si la fecha de vencimiento ha pasado
  if (fechaVencimiento > hoy) {
    // Cambié el operador para comparar correctamente
    const interesCalculado = montoCuota * 0.1; // 10% de interés
    interes.value = interesCalculado;
    montoTotal.value = montoCuota + interesCalculado; // Monto total
  } else {
    interes.value = 0;
    montoTotal.value = montoCuota; // Sin interés
  }
};

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
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
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

    cuotas.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchData);

const openEditModal = (cuota) => {
  isEditMode.value = true;
  selectedCuota.value = { ...cuota };
  selectedCuota.value.fechaVencimiento = formatDate(cuota.fechaVencimiento);
  selectedCuota.value.idUsuarioModificacion = idUsuario;
  calcularInteres(); // Llama a la función al abrir el modal
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedCuota.value = {
    montoCuota: "",
    estadoCuota: "",
    metodoPago: "",
    fechaVencimiento: "",
    fechaPagoCuota: "",
    idUsuarioModificacion: idUsuario,
  };
};
const closeConfirmModal = () => {
  isConfirmModalOpen.value = false;
};
// Función para recargar la página
const reloadPage = () => {
  fetchData();
};

const updateCuota = async () => {
  // Validar campos (puedes implementar la lógica de validación que necesites)
  if (!validarCamposAct()) return;

  closeModal();
  const formData = new FormData();

  // Agregar los campos de la cuota
  formData.append("montoCuota", montoTotal.value); // Enviar el monto total
  formData.append("metodoPago", selectedCuota.value.metodoPago);
  formData.append("estadoCuota", selectedCuota.value.estadoCuota);
  formData.append(
    "fechaVencimiento",
    formatFecha(selectedCuota.value.fechaVencimiento)
  );

  // Agregar el ID de la cuota para la actualización
  formData.append("idCuota", selectedCuota.value.idCuota);

  try {
    // Realizar la petición PUT a la API para actualizar la cuota
    await api.put(
      `/cuotas/editarCuota/${selectedCuota.value.idCuota}`, // Cambiar por el endpoint correcto
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Actualizar la lista de cuotas localmente
    fetchData(); // Actualiza la lista de cuotas

    // Mostrar un mensaje de éxito
    toast.add({
      severity: "success",
      summary: "Datos Actualizados de la Cuota",
      detail: "Los datos de la cuota se han actualizado correctamente.",
      life: 3000,
    });

    // Actualizar la cuota en la lista local
    const index = cuotas.value.findIndex(
      (cuota) => cuota.idCuota === selectedCuota.value.idCuota
    );
    if (index !== -1) {
      cuotas.value[index] = { ...selectedCuota.value }; // Actualizar la cuota en la lista
    }
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
async function generatePdf(data) {
  try {
    const idInscripcion = data.idInscripcion;
    const idCuotaPago = data.idCuotaPago;

    const response = await api.post("/recibos/generarPdf", {
      idInscripcion,
      idCuotaPago,
    });

    if (response.data.url) {
      window.open(response.data.url);
    } else {
      throw new Error("No se pudo generar el PDF.");
    }
  } catch (error) {
    console.error("Error generando el PDF:", error);
    alert("Hubo un problema al generar el PDF. Intenta nuevamente.");
  }
}
// Watcher para detectar cambios en estadoCuota
watch(
  () => selectedCuota.value.estadoCuota,
  (newValue) => {
    if (newValue === 1) {
      // Asignar la fecha de hoy a fechaPagoCuota si se cambia a "Pagado" 
      // y solo si fechaPagoCuota no tiene un valor ya asignado.
      if (!selectedCuota.value.fechaPagoCuota) {
        selectedCuota.value.fechaPagoCuota = fechaHoy.value;
      }
    } else {
      // Si cambia a otro estado, puedes limpiar o mantener el valor anterior
      // selectedCuota.value.fechaPagoCuota = null; // Descomentar si quieres limpiar
    }
  }
);


const getRowIndex = (rowData) => {
  return (
    cuotas.value.findIndex(
      (cuota) => cuota.idCuotaPago === rowData.data.idCuotaPago
    ) + 1
  );
};
</script>
