<template>
  <div class="flex justify-center items-center p-2">
    <div
      class="card p-2  mx-auto bg-white bg-opacity-40 shadow-md rounded-lg space-y-4"
    >
      <h2 class="text-2xl font-semibold mb-6">
        {{ anuncio.id ? "Editar Anuncio" : "Agregar Nuevo Anuncio" }}
      </h2>
      <form :style="{ width: '50vw' }"
        @submit.prevent="anuncio.id ? actualizarAnuncio() : agregarAnuncio()"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Parte izquierda: Campos del formulario -->
          <div class="space-y-6">
            <div>
              <label for="titulo">Título</label>
              <InputText
                v-model="anuncio.titulo"
                type="text"
                id="titulo"
                class="p-inputtext block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ingrese título"
                @input="validarTitulo"
              />
            </div>
            <div>
              <label for="tipo">Tipo de Anuncio</label>
              <Select
                v-model="anuncio.tipo"
                :options="tipoOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione un tipo"
                checkmark
                id="tipo"
                :highlightOnSelect="false"
                class="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="fecha_inicio">Fecha de Inicio</label>
                <DatePicker
                  v-model="anuncio.fecha_inicio"
                  id="fecha_inicio"
                  dateFormat="dd-mm-yy"
                  :manualInput="false"
                  :minDate="hoy"
                  showIcon
                  fluid
                  :showOnFocus="false"
                  class="block w-full text-sm border-gray-300 text-slate-950 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label for="fecha_fin">Fecha de Fin</label>
                <DatePicker
                  v-model="anuncio.fecha_fin"
                  id="fecha_fin"
                  dateFormat="dd-mm-yy"
                  :manualInput="false"
                  :minDate="hoy"
                  showIcon
                  fluid
                  :showOnFocus="false"
                  class="block w-full from-neutral-950 text-sm text-slate-950 border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div v-if="fechaFinInvalida" class="text-red-500 text-sm">
              La fecha de fin debe ser mayor que la fecha de inicio.
            </div>
          </div>

          <!-- Parte derecha: Carga de imagen -->
          <div>
            <CustomFileInput
              id="miniatura"
              label="Miniatura"
              :valueimg="anuncio.miniatura"
              @change="onFileChange"
            />
          </div>
        </div>
        <div>
          <label for="descripcion">Descripción</label>
          <Editor
            v-model="anuncio.descripcion"
            editorStyle="height: 120px "
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            placeholder="Ingrese descripción"
          />
        </div>
        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4 mt-6">
          <Button
            type="submit"
            severity="help"
            raised
            class="inline-block px-6 py-3 w-36 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 "
          >
            {{ anuncio.id ? "Guardar" : "Agregar" }}
          </Button>
          <Button
            type="button"
            @click="cancelarEdicion"
            severity="secondary"
            raised
            class="inline-block px-6 py-3 w-36 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import CustomFileInput from "@/components/CustomFileInput.vue";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";

const authStore = useAuthStore();

const toast = useToast();
const route = useRoute();
const router = useRouter();
const token = authStore.token;
const idUsuario = authStore.usuario.id;

const anuncio = reactive({
  id: null,
  titulo: "",
  miniatura: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  tipo: "",
  idUsuario: idUsuario,
});
// Obtener la fecha de hoy
const hoy = new Date();
let selectedFile = null;

const onFileChange = (event) => {
  selectedFile = event.target.files[0];
};
const validarTitulo = (event) => {
  // Expresión regular para permitir solo letras y espacios
  const regex = /^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s¿?!¡#:%]*$/;

  // Si el valor ingresado no coincide con la expresión regular
  if (!regex.test(event.target.value)) {
    // Eliminar el último carácter ingresado
    event.target.value = event.target.value.slice(0, -1);
    anuncio.titulo = event.target.value; // Actualizar el modelo de Vue
  }
};

const tipoOptions = ref([
  { label: "Seleccione un tipo", value: "" },
  { label: "Descuento", value: "descuento" },
  { label: "Oferta", value: "oferta" },
  { label: "Nuevo Curso", value: "nuevo curso" },
  { label: "Curso Retirado", value: "curso retirado" },
  { label: "Evento Especial", value: "evento especial" },
  { label: "Recordatorio", value: "recordatorio" },
  { label: "Reconocimiento", value: "reconocimiento" },
  { label: "Colaboracion", value: "colaboracion" },
  { label: "Actualizacion de Contenido", value: "actualizacion de contenido" },
  { label: "Historias de Exito", value: "historias de exito" },
  { label: "Otro", value: "otro" },
]);
// Validar que la fecha de fin sea mayor a la de inicio
const fechaFinInvalida = ref(false);
watch([() => anuncio.fecha_inicio, () => anuncio.fecha_fin], () => {
  // Si ambas fechas están definidas
  if (anuncio.fecha_inicio && anuncio.fecha_fin) {
    // Convertir las fechas a milisegundos y compararlas
    if (
      new Date(anuncio.fecha_fin).getTime() <
      new Date(anuncio.fecha_inicio).getTime()
    ) {
      fechaFinInvalida.value = true;
    } else {
      fechaFinInvalida.value = false;
    }
  }
});
const cargarAnuncio = async (id) => {
  try {
    const response = await api.get(`/anuncios/obtenerAnuncio/${id}`);
    const { fecha_inicio, fecha_fin, descripcion, tipo, ...rest } =
      response.data;

    // Convertir las fechas desde formato ISO a objeto Date
    anuncio.fecha_inicio = new Date(fecha_inicio);
    anuncio.fecha_fin = new Date(fecha_fin);

    // Opcional: Formatear las fechas en formato dd-mm-yyyy si es necesario
    anuncio.fecha_inicio_formateada = formatDate(anuncio.fecha_inicio);
    anuncio.fecha_fin_formateada = formatDate(anuncio.fecha_fin);

    anuncio.descripcion = descripcion;
    anuncio.tipo = tipo;
    Object.assign(anuncio, rest);
  } catch (error) {
    console.error(error);
  }
};

const actualizarAnuncio = async () => {
  if (fechaFinInvalida.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Por favor revise las fechas.",
      life: 3000,
    });
  }
  if (!validarCamposAct() || fechaFinInvalida.value) return;

  const formData = new FormData();
  formData.append("titulo", anuncio.titulo);
  formData.append("tipo", anuncio.tipo);
  formData.append("fecha_inicio", convertirFechaAMysql(anuncio.fecha_inicio));
  formData.append("fecha_fin", convertirFechaAMysql(anuncio.fecha_fin));
  formData.append("descripcion", anuncio.descripcion);
  formData.append("idUsuario", anuncio.idUsuario);
  if (selectedFile) {
    formData.append("miniatura", selectedFile);
  } else {
    formData.append("miniatura", anuncio.miniatura);
  }
  try {
    await api.put(`/anuncios/editarAnuncio/${anuncio.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Anuncio actualizado correctamente",
      life: 1000,
    });
    if(authStore.usuario.tipoUsuario === "admin"){
      router.push("/panelControl/anuncios");
    }else
    if(authStore.usuario.tipoUsuario === "coach") {
      router.push("/panelCoaches/anuncios");
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error al actualizar el anuncio",
      life: 2000,
    });
    console.error(error);
  }
};

const agregarAnuncio = async () => {
  if (fechaFinInvalida.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Por favor revise las fechas.",
      life: 3000,
    });
  }
  if (!validarCampos() || fechaFinInvalida.value) return;

  const formData = new FormData();
  formData.append("titulo", anuncio.titulo);
  formData.append("tipo", anuncio.tipo);
  formData.append("fecha_inicio", convertirFechaAMysql(anuncio.fecha_inicio));
  formData.append("fecha_fin", convertirFechaAMysql(anuncio.fecha_fin));
  formData.append("descripcion", anuncio.descripcion);
  formData.append("miniatura", selectedFile);
  formData.append("idUsuario", anuncio.idUsuario);
  try {
    await api.post("/anuncios/agregarAnuncio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Anuncio agregado correctamente",
      life: 1000,
    });
    if(authStore.usuario.tipoUsuario === "admin"){
      router.push("/panelControl/anuncios");
    }else
    if(authStore.usuario.tipoUsuario === "coach") {
      router.push("/panelCoaches/anuncios");
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error al agregar el anuncio",
      life: 2000,
    });
    console.error(error);
  }
};
const formatDate = (date) => {
  const fecha = new Date(date);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript van de 0 a 11
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
};
function convertirFechaAMysql(fecha) {
  console.log(fecha)
  if (!(fecha instanceof Date)) {
    return fecha; // Si ya es una cadena, regresa como está
  }

  // Formatear la fecha a dd-mm-yyyy antes de dividir
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son de 0 a 11
  const anio = fecha.getFullYear();
  
  return `${anio}-${mes}-${dia}`; // Regresar al formato yyyy-mm-dd
}
const cancelarEdicion = () => {
  if(authStore.usuario.tipoUsuario === "admin"){
    router.push("/panelControl/anuncios");
  }else
    if(authStore.usuario.tipoUsuario === "coach") {
      router.push("/panelCoaches/anuncios");
    }
};
const validarCampos = () => {
  if (
    !anuncio.titulo ||
    !anuncio.descripcion ||
    !anuncio.fecha_inicio ||
    !anuncio.fecha_fin ||
    !anuncio.tipo ||
    !selectedFile
  ) {
    toast.add({
      severity: "error",
      summary: "Campos incompletos",
      detail: "Por favor completa el formulario, todos los campos son requeridos!.",
      life: 3000,
    });
    return false;
  }
  return true;
};

const validarCamposAct = () => {
  // Verificar si los campos requeridos están completos
  if (
    !anuncio.titulo ||
    !anuncio.descripcion ||
    !anuncio.fecha_inicio ||
    !anuncio.fecha_fin ||
    !anuncio.tipo
  ) {
    toast.add({
      severity: "error",
      summary: "Campos incompletos",
      detail: "Por favor completa el formulario, todos los campos son requeridos.",
      life: 3000,
    });
    return false;
  }

  // Verificar que al menos uno de los campos `miniatura` o `selectedFile` esté presente
  if (!anuncio.miniatura && !selectedFile) {
    toast.add({
      severity: "error",
      summary: "Falta la miniatura",
      detail: "Debes subir una nueva miniatura o conservar la existente.",
      life: 3000,
    });
    return false;
  }

  return true;
};

onMounted(() => {
  const id = route.params.id;
  if (id) {
    cargarAnuncio(id);
  }
});
</script>
