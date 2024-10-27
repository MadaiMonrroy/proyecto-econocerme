<template>
  <div class="flex justify-center items-center p-2">
    <div class="card min-w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-6 text-center">
        {{
          inscripcion.idInscripcion
            ? "Editar Inscripcion"
            : "Agregar Nueva Inscripcion"
        }}
      </h2>
      <form
        @submit.prevent="
          inscripcion.idInscripcion
            ? actualizarInscripcion()
            : agregarInscripcion()
        "
      >
        <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
          <!-- Lado izquierdo -->
          <div class="grid grid-cols-3 md:grid-cols-3 gap-6">
            <!-- Selector de usuario -->
            <div class="col-span-1">
              <label for="usuarioId" class="block text-sm font-medium mb-2"
                >Seleccionar Usuario</label
              >
              <Select
                v-model="inscripcion.usuarioId"
                :options="usuarios"
                filter
                optionLabel="fullName"
                placeholder="Seleccionar Usuario"
                class="w-full"
              >
                <template #value="slotProps">
                  <div v-if="slotProps.value" class="flex items-center">
                    <div>{{ slotProps.value.fullName }}</div>
                  </div>
                  <span v-else>
                    {{ slotProps.placeholder }}
                  </span>
                </template>
                <template #option="slotProps">
                  <div class="flex items-center">
                    <div>{{ slotProps.option.fullName }}</div>
                  </div>
                </template>
              </Select>
            </div>
            <div class="col-span-2">
              <label for="cursoId" class="block text-sm font-medium mb-2"
                >Seleccionar Curso</label
              >
              <MultiSelect
                v-model="inscripcion.cursoId"
                :options="cursos"
                optionLabel="titulo"
                filter
                placeholder="Seleccionar Curso"
                display="chip"
                class="w-full"
                emptyMessage="No hay cursos disponibles (El usuario ya se encuentra registrado en todos los cursos)"
                emptyFilterMessage="No se encontró el curso"
              >
                <template #option="slotProps">
                  <div class="flex items-center">
                    <img
                      :alt="slotProps.option.titulo"
                      :src="slotProps.option.miniatura"
                      class="mr-2"
                      style="width: 40px; height: 40px; object-fit: cover"
                    />
                    <div>{{ slotProps.option.titulo }}</div>
                  </div>
                </template>
                <template #footer>
                  <div class="py-2 px-4">
                    <b>{{
                      inscripcion.cursoId ? inscripcion.cursoId.length : 0
                    }}</b>
                    curso(s){{
                      (inscripcion.cursoId ? inscripcion.cursoId.length : 0) > 1
                        ? "s"
                        : ""
                    }}
                    seleccionado(s).
                  </div>
                </template>
              </MultiSelect>
            </div>

            <!-- Selección de cantidad de cuotas -->
            <div class="col-span-2 ">
              <label for="cantidadCuotas" class="block text-sm font-medium mb-2"
                >Elige la Cantidad de Cuotas</label
              >
              <div
                class="card grid grid-cols-[1fr_4px_1fr] gap-4 items-center p-4 dark:border-2 dark:border-violet-900"
              >
                <div class="flex flex-col space-y-2 items-center">
                  <label for="cursoId" class="block text-sm font-medium mb-2"
                    >Nro. Cuotas</label
                  >
                  <SelectButton
                    v-model="inscripcion.cantidadCuotas"
                    :options="cuotas"
                    allowEmpty
                    :invalid="inscripcion.cantidadCuotas === null"
                  />
                </div>

                <!-- Divider -->
                <Divider
                  layout="vertical"
                  class="h-72 border-x-2 border-green-400"
                />

                <!-- Montos de cuotas -->
                <div class=" ml-4 flex flex-col space-y-2">
                  <div
                    v-for="(cuota, index) in cuotasComponentes"
                    :key="index"
                    class="flex items-center"
                  >
                    <Message
                      :severity="cuota.pagado ? 'success' : 'warn'"
                      icon="pi pi-money-bill"
                    >
                      Cuota {{ index + 1 }} -
                      {{ cuota.pagado ? "Pagado" : "A Pagar" }}
                      <Tag
                        :value="cuota.pagado ? 'Pagado' : 'Pendiente'"
                        :severity="cuota.pagado ? 'success' : 'warning'"
                      ></Tag>
                      <br />
                      <Tag
                        :value="`Fecha de Pago: ${cuota.fecha}`"
                        :severity="cuota.pagado ? 'success' : 'info'"
                      ></Tag>
                      <br />
                      <!-- Mostrar monto de cada cuota -->
                      <strong>Monto a pagar: {{ cuota.monto }} Bs.</strong>
                    </Message>
                  </div>
                </div>
                
              </div>
              <div class="col-span-2">
              <label for="montoTotal" class="block text-sm font-medium "
                >Monto Total a Pagar</label
              >
              <InputNumber
                v-model="montoTotal"
                :readonly="true"
                mode="currency"
                currency="BOB"
                class="w-full -mb-6"
                locale="es-BO"
                :formatter="formatPrice"
                :unformatter="parsePrice"
                placeholder="Monto total"
              />
            </div>
            </div>

            
            <!-- Campo de observación -->
            <div>
              <label for="observacion" class="block text-sm font-medium mb-2"
                >Observación</label
              >
              <Textarea
                v-model="inscripcion.observacion"
                id="observacion"
                class="block w-full h-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="4"
                placeholder="Ingrese observación"
              />
            </div>
          </div>
        </div>

        <div class="col-span-3 pt-6 flex justify-end space-x-4 mt-6">
          <button
            type="button"
            class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @click="abrirModal"
          >
            {{
              inscripcion.idInscripcion ? "Guardar" : "Registrar Inscripción"
            }}
          </button>
          <button
            type="button"
            @click="cancelarEdicion"
            class="inline-block px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal para Confirmar Inscripcion con el Primer Pago Realizado y registrar porque medio se hizo mediante un select -->
  <Dialog
    v-model:visible="isConfirmModalOpen"
    header="Confirmar Primera Cuota Pagada"
    modal
    class="w-full max-w-sm"
  >
    <div class="p-4">
      <p>
        La Inscripcion del Estudiante necesita confirmar que la primera cuota ha
        sido pagada.
      </p>
      <form @submit.prevent="agregarAFormInscripcion">
        <div class="grid grid-cols-1 gap-4 p-4">
          <div>
            <label for="montoCuota" class="block text-sm font-medium mb-2"
              >Monto de la Primera Cuota</label
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
        </div>
        <div class="p-4 flex justify-end space-x-4">
          <Button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded-md"
            severity="success"
            >Confirmar</Button
          >
          <Button
            type="button"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            severity="secondary"
            @click="closeModal"
            >Cancelar</Button
          >
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup>
import { reactive, onMounted, ref, watchEffect, computed, watch } from "vue";
import api from "@/axiosConfig.js";
import { useRouter, useRoute } from "vue-router";
import MultiSelect from "primevue/multiselect";
import InputNumber from "primevue/inputnumber";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";

const isConfirmModalOpen = ref(false);

const abrirModal = () => {
  if (inscripcion.cantidadCuotas) {
    const montos = calcularMontoCuotas(inscripcion.cantidadCuotas);
    selectedCuota.montoCuota = montos[0].monto; // Asigna el monto de la primera cuota
  }
  isConfirmModalOpen.value = true;
};

const closeModal = () => {
  isConfirmModalOpen.value = false;
};

const authStore = useAuthStore();

const route = useRoute();
const router = useRouter();
const toast = useToast();
const token = authStore.token;

const inscripcion = reactive({
  usuarioId: "",
  cursoId: [],
  observacion: "",
  montoTotal: "",
  cantidadCuotas: 1,
});

const cuotas = ref([1, 2, 3, 4]);

const metodosPago = [
  { label: "Tarjeta", value: "tarjeta" },
  { label: "Transferencia", value: "transferencia" },
  { label: "Efectivo", value: "efectivo" },
  { label: "QR", value: "qr" },
];

const cuotasComponentes = ref([]);
const usuarios = reactive([]);
const cursos = reactive([]);
const montoTotal = ref(0);
const selectedCuota = reactive({
  montoCuota: 0,
  metodoPago: "",
});

const calcularMontoTotal = computed(() => {
  return inscripcion.cursoId.reduce((total, curso) => {
    const precio = parseFloat(curso.precio);
    return total + (isNaN(precio) ? 0 : precio);
  }, 0);
});

const usuariosConNombreCompleto = computed(() =>
  usuarios.map((usuario) => ({
    ...usuario,
    fullName: `${usuario.nombres} ${usuario.primerApellido} ${usuario.segundoApellido}`,
  }))
);

const cargarDatos = async () => {
  try {
    const [usuariosResponse, cursosResponse] = await Promise.all([
      api.get("/usuarios/usuarios"),
      api.get("/cursos/curso"),
    ]);

    // Filtrar los usuarios que tengan el rol 'usuario' y estado '1'
    const usuariosFiltrados = usuariosResponse.data.filter(
      (usuario) => usuario.tipoUsuario === "usuario" && usuario.estado === 1
    );

    usuarios.splice(0, usuarios.length, ...usuariosFiltrados);
    usuarios.splice(0, usuarios.length, ...usuariosConNombreCompleto.value);
    cursos.splice(0, cursos.length, ...cursosResponse.data);
  } catch (error) {
    console.error(error);
  }
};

const obtenerCursosDisponibles = async (usuarioId) => {
  try {
    console.log(usuarioId.id);
    const response = await api.get(`/cursos/disponibles/${usuarioId.id}`);
    console.log(response.data);
    cursos.splice(0, cursos.length, ...response.data);
  } catch (error) {
    console.error("Error al obtener cursos disponibles:", error);
  }
};

const calcularFechas = (cantidadCuotas) => {
  const hoy = new Date();
  const fechas = [];

  for (let i = 0; i < cantidadCuotas; i++) {
    const fecha = new Date(hoy);
    fecha.setMonth(hoy.getMonth() + i);
    fechas.push({
      pagado: i === 0,
      fecha: fecha.toLocaleDateString(),
    });
  }

  return fechas;
};

const calcularMontoCuotas = (cantidadCuotas) => {
  let monto = montoTotal.value;

  const montoPorCuota = monto / cantidadCuotas;

  montoTotal.value = 0;

  return Array(cantidadCuotas).fill({
    monto: montoPorCuota.toFixed(2), // Redondear a 2 decimales
  });
};

watch(
  () => inscripcion.cantidadCuotas,
  (nuevaCantidad) => {
    const fechas = calcularFechas(nuevaCantidad);
    const montos = calcularMontoCuotas(nuevaCantidad);
    console.log(montos);
    cuotasComponentes.value = fechas.map((cuota, index) => ({
      ...cuota,
      monto: montos[index].monto,
    }));
  },
  { immediate: true }
);

watchEffect(() => {
  // Verificar si la cantidad de cuotas es mayor o igual a 2
  if (inscripcion.cantidadCuotas >= 2) {
    // Añadir el 5% al monto total
    const montoConRecargo =
      calcularMontoTotal.value + calcularMontoTotal.value * 0.05;
    montoTotal.value = montoConRecargo;
  } else {
    // Si es menos de 2 cuotas, se deja el monto total sin recargo
    montoTotal.value = calcularMontoTotal.value;
  }

  console.log(montoTotal.value);
  inscripcion.montoTotal = montoTotal.value;
});

watch(
  () => inscripcion.usuarioId,
  (nuevoUsuarioId) => {
    if (nuevoUsuarioId) {
      obtenerCursosDisponibles(nuevoUsuarioId);
      inscripcion.cursoId = [];
    } else {
      cursos.splice(0, cursos.length);
      inscripcion.cursoId = [];
    }
  }
);

// Observa los cambios en el montoTotal y actualiza las cuotas
watch(
  () => montoTotal.value,
  (nuevoMontoTotal) => {
    if (inscripcion.cantidadCuotas) {
      const montos = calcularMontoCuotas(
        inscripcion.cantidadCuotas,
        nuevoMontoTotal
      );
      cuotasComponentes.value = cuotasComponentes.value.map((cuota, index) => ({
        ...cuota,
        monto: montos[index].monto,
      }));
    }
  },
  { immediate: true }
);

const agregarAFormInscripcion = async () => {
  if (isNaN(inscripcion.montoTotal) || inscripcion.montoTotal === null) {
    alert("Monto Total no es válido.");
    return;
  }

  if (!selectedCuota.metodoPago) {
    alert("Por favor selecciona un método de pago.");
    return;
  }

  try {
    const payload = {
      idUsuario: inscripcion.usuarioId.id,
      idCurso: inscripcion.cursoId,
      observacion: inscripcion.observacion,
      cantidadCuotas: inscripcion.cantidadCuotas,
      montoTotal: inscripcion.montoTotal,
      montoCuota: selectedCuota.montoCuota,
      metodoPago: selectedCuota.metodoPago,
      idUsuarioModificacion: authStore.usuario.id,
    };
    console.log(JSON.stringify(payload, null, 2));

    const response = await api.post(
      "/inscripciones/agregarInscripcion",
      payload
    );

    if (response.data) {
      const idInscripcion = response.data.idInscripcion; // Recibe el idInscripcion de la respuesta
      const idCuotaPago = response.data.idCuotaPago; // Recibe el idCuotaPago de la respuesta
      console.log(idInscripcion, idCuotaPago, "datos traidos del backend")
      toast.add({
        severity: "success",
        summary: "Inscripción Exitosa",
        detail:
          "La inscripción y el primer pago han sido registrados correctamente.",
        life: 3000,
      });

      closeModal();
      router.push({
        path: `/panelControl/detalleInscripcion/${idInscripcion}`,
        query: { idCuotaPago: idCuotaPago },
      });
    }
  } catch (error) {
    console.error("Error al agregar inscripción:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Ocurrio un error al agregar la inscripcion, Inténtalo de nuevo",
      life: 3000,
    });
  }
};

const cargarInscripcion = async (idInscripcion) => {
  try {
    const response = await api.get(`
      /cursos/obtenerInscripcion/${idInscripcion}
    `);
    Object.assign(inscripcion, response.data);
  } catch (error) {
    console.error(error);
  }
};

const actualizarInscripcion = async () => {
  try {
    router.push("/panelControl/inscripciones");
  } catch (error) {
    console.error(error);
  }
};

const cancelarEdicion = () => {
  router.push("/panelControl/inscripciones");
};

onMounted(() => {
  const { idInscripcion } = route.params;
  if (idInscripcion) {
    cargarInscripcion(idInscripcion);
  }
  cargarDatos();
});
</script>
