<template>

  <div class="flex justify-center items-center p-2">
    <div class="card w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-6 text-center">{{ curso.idCurso ? 'Editar Curso' : 'Agregar Nuevo Curso' }}</h2>
      <form @submit.prevent="curso.idCurso ? actualizarCurso() : agregarCurso()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Lado izquierdo -->
          <div class="space-y-4">
            <div>
              <label for="titulo" class="block text-sm font-medium  mb-2">Título</label>
              <InputText
                v-model="curso.titulo"
                type="text"
                id="titulo"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ingrese título"
                @input="validarTitulo"
              />
            </div>


            <div>
              <label for="especialidad" class="block text-sm font-medium  mb-2">Especialidad</label>
              <Select
                v-model="curso.especialidad"
                :options="especialidadOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione una especialidad"
                checkmark 
                :highlightOnSelect="false"
                class="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="duracion" class="block text-sm font-medium  mb-2">Duración (horas)</label>
                <InputNumber
                  v-model="curso.duracion"
                  inputId="duracion"
                  mode="decimal"
                  step="0.5"
                  min="0"
                  class="w-full"
                  :formatter="formatHours"
                  :unformatter="parseHours"
                  showButtons
                />
              </div>

              <div>
                <label for="precio" class="block text-sm font-medium  mb-2">Precio</label>
                <InputNumber
                  v-model="curso.precio"
                  inputId="precio"
                  mode="currency"
                  currency="BOB"
                  class="w-full"
                  placeholder="Ingrese precio"
                  :formatter="formatPrice"
                  :unformatter="parsePrice"
                  showButtons
                />
              </div>
            </div>

            <div>
              <label for="descripcion" class="block text-sm font-medium  mb-2">Descripción</label>
              <textarea
                v-model="curso.descripcion"
                id="descripcion"
                class="block w-full h-56 text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="4"
                placeholder="Ingrese descripción"
                required
              />
            </div>
          </div>

          <!-- Lado derecho -->
          <div>
            <CustomFileInput
            
              id="miniatura"
              label="Miniatura"
              :valueimg="curso.miniatura"
              @change="onFileChange"
            />
            <label for="estado" class="block text-sm font-medium mb-2 pt-3">Estado</label>
              <Select
                v-model="curso.estado"
                :options="estadoOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione el estado"
                checkmark :highlightOnSelect="false"
                class="w-full  rounded-md shadow-sm"
              />
          </div>

        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button
            type="submit"
            class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {{ curso.idCurso ? 'Guardar' : 'Agregar' }}
          </button>
          <button
            type="button"
            @click="cancelarEdicion"
            class="inline-block px-4 py-2 bg-gray-300  rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
        </div>
      </form>
      
    </div>
  </div>
  
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from "primevue/usetoast";
import InputNumber from 'primevue/inputnumber'; // Asegúrate de que InputNumber está importado
import CustomFileInput from '@/components/CustomFileInput.vue';
import { useAuthStore } from "@/stores/authStore";
import api from '@/axiosConfig.js'
import { ref } from 'vue';
const authStore = useAuthStore();
const toast = useToast();

const route = useRoute();
const router = useRouter();
const token = authStore.token;
const idUsuario = authStore.usuario.id;
console.log(idUsuario)
const curso = reactive({
  idCurso: null,
  titulo: '',
  miniatura: '',
  especialidad: '',
  descripcion: '',
  duracion: '',
  precio: '',
  estado: null,
  idUsuario: idUsuario,
});
let selectedFile = null;
const especialidadOptions = ref([
{ label: 'Seleccione una especialidad', value: '' },
{ label: 'Empoderamiento Femenino', value: 'Empoderamiento Femenino' },
{ label: 'Salud y Bienestar', value: 'Salud y Bienestar' },
{ label: 'Inteligencia Emocional', value: 'Inteligencia Emocional' },
{ label: 'Liderazgo', value: 'Liderazgo' },
{ label: 'Maternidad Consciente', value: 'Maternidad Consciente' },
{ label: 'Finanzas Personales', value: 'Finanzas Personales' },
{ label: 'Gestión del Estrés y la Ansiedad', value: 'Gestión del Estrés y la Ansiedad' },
{ label: 'Habilidades de Comunicación', value: 'Habilidades de Comunicación' },
{ label: 'Relaciones Saludables', value: 'Relaciones Saludables' },
{ label: 'Mindfulness y Meditación', value: 'Mindfulness y Meditación' },
{ label: 'Creatividad y Autoexpresión', value: 'Creatividad y Autoexpresión' },
{ label: 'Productividad y Gestión del Tiempo', value: 'Productividad y Gestión del Tiempo' },
{ label: 'Otro', value: 'Otro' }
]);
// Opciones para el campo "estado"
const estadoOptions = ref([
  { label: 'Activo', value: 1 },
  { label: 'Inactivo', value: 2 }
]);
const validarTitulo = (event) => {
  // Expresión regular para permitir solo letras y espacios
  const regex = /^[A-Za-z\s]*$/;

  // Si el valor ingresado no coincide con la expresión regular
  if (!regex.test(event.target.value)) {
    // Eliminar el último carácter ingresado
    event.target.value = event.target.value.slice(0, -1);
    curso.titulo = event.target.value; // Actualizar el modelo de Vue
  }
};

const onFileChange = (event) => {
  selectedFile = event.target.files[0];
};

const logFormData = (formData) => {
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }
};

const agregarCurso = async () => {
  if (!validarCampos()) return; // Verifica los campos antes de continuar

  const formData = new FormData();
  formData.append('titulo', curso.titulo);
  formData.append('especialidad', curso.especialidad);
  formData.append('descripcion', curso.descripcion);
  formData.append('duracion', curso.duracion);
  formData.append('precio', curso.precio);
  formData.append('miniatura', selectedFile);
  formData.append('estado', curso.estado); // Aquí mandamos el estado seleccionado
  formData.append("idUsuario", curso.idUsuario);


  try {
    await api.post(`/cursos/agregarCurso`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',

      },
    });
    logFormData(formData);  // Log the form data
    router.push('/panelControl/cursos');

    toast.add({
      severity: "success",
      summary: "Curso Añadido",
      detail: "El curso ha sido agregado con éxito.",
      life: 3000
    });

    } catch (error) {
    console.error(error.response.data.mensaje);
    toast.add({
      severity: "error",
      summary: "Titulo Repetido",
      detail: error.response?.data?.mensaje || "Ocurrió un error.",
      life: 3000
    });
  }
};

const cargarCurso = async (idCurso) => {
  try {
    const response = await api.get(`/cursos/obtenerCurso/${idCurso}`);

    Object.assign(curso, response.data);
  } catch (error) {
    console.error(error);
  }
};

const actualizarCurso = async () => {
  if (!validarCamposAct()) return; // Verifica los campos antes de continuar

  const formData = new FormData();
  formData.append('titulo', curso.titulo);
  formData.append('especialidad', curso.especialidad);
  formData.append('descripcion', curso.descripcion);
  formData.append('duracion', curso.duracion);
  formData.append('precio', curso.precio);
  formData.append("idUsuario", curso.idUsuario);
  formData.append('estado', curso.estado); // También en la actualización

  if (selectedFile) {
    formData.append('miniatura', selectedFile);
  }
  else {
    formData.append('miniatura', curso.miniatura);
  }

  try {
    await api.put(`/cursos/editarCurso/${curso.idCurso}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',

      },
    });
    toast.add({
      severity: "info",
      summary: "Éxito",
      detail: "El curso se ha editado correctamente.",
      life: 3000,
    });

      router.push('/panelControl/cursos');

  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo editar el curso. Por favor, inténtalo de nuevo más tarde.",
      life: 3000,
    });
  }
};
const validarCampos = () => {
  if (!curso.titulo || !curso.especialidad || !curso.descripcion || !curso.duracion || !curso.precio || !curso.estado || !selectedFile) {
    toast.add({
      severity: "error",
      summary: "Campos incompletos",
      detail: "Por favor completa el formulario, todos los campos requeridos!.",
      life: 3000
    });
    return false;
  }
  return true;
};
const validarCamposAct = () => {
  if (!curso.titulo || !curso.especialidad || !curso.descripcion || !curso.duracion || !curso.precio || !curso.estado) {
    toast.add({
      severity: "error",
      summary: "Campos incompletos",
      detail: "Por favor completa el formulario, todos los campos requeridos!.",
      life: 3000
    });
    return false;
  }
  if (!curso.miniatura && !selectedFile) {
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
const cancelarEdicion = () => {
  router.push('/panelControl/cursos');
};

onMounted(() => {
  const { idCurso } = route.params;
  if (idCurso) {
    cargarCurso(idCurso);
  }
  
});
</script>
