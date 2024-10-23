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
            formatDateHours(rowData.data.fechaPagoCuota)
          }}</template>
        </Column>
        <Column header="Monto de la Cuota" class="px-6 py-4">
          <template #body="rowData">{{ rowData.data.montoCuota }}</template>
        </Column>
        <Column header="Monto por Mora" class="px-6 py-4">
          <template #body="rowData">{{ rowData.data.montoMora }}</template>
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
              v-else-if="rowData.data.estadoCuota === 3"
              value="Vencido"
              severity="danger"
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
              v-if="rowData.data.estadoCuota != 1"
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
      :header="'Confirmar el Pago de la Cuota'"
      modal
      :style="{ zIndex: 10 }"
    >
      <form @submit.prevent="confirmarPago">
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
          <div class="md:col-span-2 lg:col-span-1">
            <label for="montoMora" class="block text-sm font-medium mb-2"
              >Monto por Mora</label
            >
            <InputText
              v-model="selectedCuota.montoMora"
              type="number"
              id="montoMora"
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
              placeholder="Seleccione un Método de Pago"
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
        <div
          v-if="selectedCuota.estadoCuota === 1"
          class="grid grid-cols-1 p-4"
        >
          <label for="fechaPagoCuota" class="block text-sm font-medium mb-2"
            >Fecha de Pago</label
          >
          <DatePicker
            v-model="selectedCuota.fechaPagoCuota"
            type="text"
            dateFormat="dd-mm-yy"
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

          @click="confirmarPagoDefinitivo()"
          severity="help"
            class="px-4 py-2 rounded-lg w-36"
            rounded
            label="Confirmar Pago"
            raised

          />
        </div>
      </form>
    </Dialog>
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
              label="Si, estoy segur@"
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
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

const authStore = useAuthStore();

const cuotas = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const toast = useToast();
const confirm = useConfirm();

const props = defineProps({
  pagoId: {
    type: String,
    required: true,
  },
});

const idUsuario = authStore.usuario.id;
const hoy = new Date(); // Fecha actual como objeto Date
function convertirFechaAMysql(fecha) {
  console.log(fecha);
  if (!(fecha instanceof Date)) {
    return fecha; // Si ya es una cadena, regresa como está
  }

  // Formatear la fecha a yyyy-mm-dd hh:mm:ss
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son de 0 a 11
  const anio = fecha.getFullYear();

  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const segundos = String(fecha.getSeconds()).padStart(2, '0');

  return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`; // Regresar al formato yyyy-mm-dd hh:mm:ss
}
const confirmarPagoDefinitivo = async () => {
  confirm.require({
    group: "headless",
    message: "¿Estás segur@ de confirmar este pago?",
    header: "Confirmación",
    icon: "pi-exclamation-triangle",
    accept: () => confirmarPago(), // Llama a eliminarAnuncio solo si el usuario acepta

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
const selectedCuota = ref({
  idCuotaPago: "", // Asegúrate de incluir esta propiedad
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

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};


const formatDateHours = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${day}-${month}-${year} - ${hours}:${minutes}`;
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

const fetchData = async () => {
  try {
    const response = await api.get(`/cuotas/cuota/${props.pagoId}`);
    
    cuotas.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchData);

// Al abrir el modal, carga los datos de la cuota seleccionada
const openEditModal = (cuota) => {
  selectedCuota.value = {
    idCuotaPago: cuota.idCuotaPago, // Asigna el idCuotaPago aquí
    montoCuota: cuota.montoCuota,
    estadoCuota: cuota.estadoCuota,
    metodoPago: cuota.metodoPago,
    idUsuarioModificacion: idUsuario,
  };
  // Asigna la cuota seleccionada al modal
  selectedCuota.value = { ...cuota };
  selectedCuota.value.fechaVencimiento = new Date(cuota.fechaVencimiento);

  // Formatear fechaPagoCuota si existe, o asignar fecha de hoy
  if (cuota.fechaPagoCuota) {
    selectedCuota.value.fechaPagoCuota = new Date(cuota.fechaPagoCuota);
  } else {
    selectedCuota.value.fechaPagoCuota = hoy; // o puedes usar `new Date()` directamente aquí
  }

  isModalOpen.value = true; // Abre el modal
};

const closeModal = () => {
  isModalOpen.value = false;

};

const montoTotal = computed(() => {
  return (
    parseFloat(selectedCuota.value.montoCuota) +
    parseFloat(selectedCuota.value.montoMora)
  );
});
const confirmarPago = async () => {
  closeModal();
  try {
    // Asegúrate de que selectedCuota tenga el idCuotaPago
    const cuotaId = selectedCuota.value.idCuotaPago;

    // Convertir fechas al formato adecuado para la base de datos
    const dataToSend = {
      ...selectedCuota.value,
      fechaVencimiento: convertirFechaAMysql(selectedCuota.value.fechaVencimiento),
      fechaPagoCuota: convertirFechaAMysql(selectedCuota.value.fechaPagoCuota),
      idUsuarioModificacion: idUsuario, // ID del usuario que realiza la modificación
    };

    // Realizar la llamada a la API para confirmar el pago (PUT)
    const response = await api.put(`/cuotas/editarCuota/${cuotaId}`, dataToSend);
    
    if (response.status === 200) {
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Pago confirmado correctamente', life: 3000 });
      closeModal(); // Cierra el modal después de confirmar el pago
      await fetchData(); // Actualiza la lista de cuotas
    }
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Hubo un error al confirmar el pago', life: 3000 });
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
