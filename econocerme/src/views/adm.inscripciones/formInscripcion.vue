<template>
  <div class="flex justify-center items-center p-2">
    <div class="card w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-6 text-center">
        {{
          inscripcion.idInscripcion
            ? "Editar Inscripcion"
            : "Agregar Nueva Inscripcion"
        }}
      </h2>
      <form @submit.prevent="
        inscripcion.idInscripcion
          ? actualizarInscripcion()
          : agregarInscripcion()
        ">
        <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
          <!-- Lado izquierdo -->
          <div class="space-y-4">
            <!-- Selector de usuario -->
            <div>
              <label for="usuarioId" class="block text-sm font-medium mb-2">Seleccionar Usuario</label>
              <Select v-model="inscripcion.usuarioId" :options="usuarios" filter optionLabel="fullName"
                placeholder="Seleccionar Usuario" class="w-full">
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
            <div>
              <label for="cursoId" class="block text-sm font-medium mb-2">Seleccionar Curso</label>
              <MultiSelect
                v-model="inscripcion.cursoId" :options="cursos" optionLabel="titulo" filter
                placeholder="Seleccionar Curso" display="chip" class="w-full"
                emptyMessage="No hay cursos disponibles (El usuario ya se encuentra registrado en todos los cursos)"
                emptyFilterMessage="No se encontró el curso">
                <template #option="slotProps">
                  <div class="flex items-center">
                    <img :alt="slotProps.option.titulo" :src="slotProps.option.miniatura" class="mr-2"
                      style="width: 40px; height: 40px; object-fit: cover;" />
                    <div>{{ slotProps.option.titulo }}</div>
                  </div>
                </template>
                <template #footer>
                  <div class="py-2 px-4">
                    <b>{{ inscripcion.cursoId ? inscripcion.cursoId.length : 0 }}</b> curso(s){{ (inscripcion.cursoId ?
                      inscripcion.cursoId.length : 0) > 1 ? 's' : '' }} seleccionado(s).
                  </div>
                </template>
              </MultiSelect>
            </div>
            <div >
              <label for="cursoId" class="block text-sm font-medium mb-2">Elige La Cantidad de Cuotas a Pagar</label>
              <div class="card flex flex-col justify-center items-center">
                <label for="cursoId" class="block text-sm font-medium mb-2">Nro. Cuotas</label>
                <SelectButton v-model="inscripcion.cantidadCuotas" :options="cuotas" aria-labelledby="basic" allowEmpty :invalid="inscripcion.cantidadCuotas === null"  />
              </div>
            </div>
            <!-- Campo de Monto Total -->
            <div>
              <label for="montoTotal" class="block text-sm font-medium mb-2">Monto Total a Pagar</label>
              <InputNumber v-model="montoTotal" :readonly="true" mode="currency" currency="BOB" class="w-full"
                locale="es-BO" :formatter="formatPrice" :unformatter="parsePrice" placeholder="Monto total" />
            </div>
            <!-- Campo de observación -->
            <div>
              <label for="observacion" class="block text-sm font-medium mb-2">Observación</label>
              <textarea v-model="inscripcion.observacion" id="observacion"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="4" placeholder="Ingrese observación" />
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button type="submit"
            class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {{
              inscripcion.idInscripcion ? "Guardar" : "Registrar Inscripción"
            }}
          </button>
          <button type="button" @click="cancelarEdicion"
            class="inline-block px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, watchEffect, computed, watch } from "vue";
import api from "@/axiosConfig.js";
import { useRouter, useRoute } from "vue-router";
import MultiSelect from "primevue/multiselect"; // Importar MultiSelect de PrimeVue
import InputNumber from "primevue/inputnumber";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";

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
  cantidadCuotas: 1
});

const cuotas = ref([
  1,2,3,4
]);

const selectcurso = ref()
const usuarios = reactive([]);
const cursos = reactive([]);

const montoTotal = ref(0);

// Computed para calcular el monto total
const calcularMontoTotal = computed(() => {
  return inscripcion.cursoId.reduce((total, curso) => {
    // Verificamos que curso.precio sea un número válido
    const precio = parseFloat(curso.precio);
    return total + (isNaN(precio) ? 0 : precio);
  }, 0);
});

const usuariosConNombreCompleto = computed(() => 
  usuarios.map(usuario => ({
    ...usuario,
    fullName: `${usuario.nombres} ${usuario.primerApellido} ${usuario.segundoApellido}`
  }))
);


// Reactive para actualizar el monto total cuando cambian los cursos seleccionados
watchEffect(() => {
  montoTotal.value = calcularMontoTotal.value;
  inscripcion.montoTotal = montoTotal.value;
});

const cargarDatos = async () => {
  try {
    const [usuariosResponse, cursosResponse] = await Promise.all([
      api.get("/usuarios/usuarios"),
      api.get("/cursos/curso"),
    ]);

    usuarios.splice(0, usuarios.length, ...usuariosResponse.data);
    usuarios.splice(0, usuarios.length, ...usuariosConNombreCompleto.value);
    cursos.splice(0, cursos.length, ...cursosResponse.data);
    // console.log(usuarios);
    // console.log(cursos);
  } catch (error) {
    console.error(error);
  }
};

const obtenerCursosDisponibles = async (usuarioId) => {
  try {
    console.log(usuarioId.id)
    const response = await api.get(`/cursos/disponibles/${usuarioId.id}`);
    console.log(response.data)
    cursos.splice(0, cursos.length, ...response.data);
  } catch (error) {
    console.error("Error al obtener cursos disponibles:", error);
  }
};

watch(() => inscripcion.usuarioId, (nuevoUsuarioId) => {
  if (nuevoUsuarioId) {
    obtenerCursosDisponibles(nuevoUsuarioId);
    // Limpiar cursos seleccionados cuando cambia el usuario
    inscripcion.cursoId = [];
  } else {
    cursos.splice(0, cursos.length);
    inscripcion.cursoId = [];
  }
});

const logFormData = (formData) => {
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }
};

const agregarInscripcion = async () => {

  if (isNaN(inscripcion.montoTotal) || inscripcion.montoTotal === null) {
    alert("Monto Total no es válido.");
    return;
  }
  try {
    // console.log(inscripcion)
    // console.log(JSON.stringify(inscripcion, null, 2));
    console.log({
      idUsuario: inscripcion.usuarioId.id,
      idCurso: inscripcion.cursoId,
      observacion: inscripcion.observacion,
      cantidadCuotas: inscripcion.cantidadCuotas,
      montoTotal: inscripcion.montoTotal,
      idUsuarioModificacion: authStore.usuario.id
    })


    const response = await api.post("/inscripciones/agregarInscripcion", {
      idUsuario: inscripcion.usuarioId.id,
      idCurso: inscripcion.cursoId,
      observacion: inscripcion.observacion,
      cantidadCuotas: inscripcion.cantidadCuotas,
      montoTotal: inscripcion.montoTotal,
      idUsuarioModificacion: authStore.usuario.id
    });

    if (response) {
      toast.add({
        severity: "success",
        summary: "Inscripcion Exitosa",
        detail: "La Inscripcion del Usuario se ha realizado correctamente",
        life: 3000,
      });

      setTimeout(() => {
          router.push("/panelControl/inscripciones");
      }, 1000);
    }
    // console.log(response.data.mensaje);
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
    const response = await api.get(
      `/cursos/obtenerInscripcion/${idInscripcion}`
    );
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
