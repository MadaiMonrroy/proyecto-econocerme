<template>
  <div
    v-animateonscroll="{
      enterClass: 'animate-scalein',
      leaveClass: 'animate-fadeout',
    }"
    class="card shadow-lg animate-duration-1000 animate-ease-in-out m-4"
  >
    <form @submit.prevent="updateUsuario">
      <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-9 p-5">
        <!-- Columna izquierda -->
        <div
          class="card shadow-2xl flex flex-col space-y-8 dark:shadow-2xl dark:shadow-violet-950"
        >
          <div>
            <h1 for="fotoPerfil"><strong>Foto de Perfil</strong></h1>
            <CustomFileInput
              @change="handleFileUpload"
              type="file"
              id="fotoPerfil"
              :valueimg="selectedUsuario.fotoPerfil"
              class="h-auto w-full rounded-lg"
            />
          </div>
          <!-- Botón para generar nueva contraseña -->
          <div class="flex items-center space-x-2">
            <Button
              @click="updatePasswordUsuario"
              severity="primary"
              class="text-white px-4 w-full py-2 rounded-md"
              >Generar Nueva Contraseña</Button
            >
          </div>
        </div>

        <!-- Columna derecha -->
        <div
          class="card flex flex-col space-y-4 shadow-2xl dark:shadow-2xl dark:shadow-violet-950"
        >
          <div>
            <h1 for="nombres"><strong>Nombres</strong></h1>
            <InputText
              v-model="selectedUsuario.nombres"
              @input="validarInput"
              type="text"
              id="nombres"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
              placeholder="Ingrese nombres"
              required
            />
          </div>
          <div>
            <h1 for="primerApellido"><strong>Primer Apellido</strong></h1>
            <InputText
              v-model="selectedUsuario.primerApellido"
              @input="validarInput"
              type="text"
              id="primerApellido"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
              placeholder="Ingrese primer apellido"
              required
            />
          </div>
          <div>
            <h1 for="segundoApellido"><strong>Segundo Apellido</strong></h1>
            <InputText
              v-model="selectedUsuario.segundoApellido"
              @input="validarInput"
              type="text"
              id="segundoApellido"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
              placeholder="Ingrese segundo apellido"
            />
          </div>
          <div>
            <h1 for="fechaNacimiento">
              <strong>Fecha de Nacimiento</strong>
            </h1>
            <DatePicker
              v-model="selectedUsuario.fechaNacimiento"
              dateFormat="dd-mm-yy"
              :maxDate="new Date(2005, 11, 31)"
              showIcon
              fluid
              inputId="icondisplay"
              id="fechaNacimiento"
              placeholder="Fecha de Nacimiento"
              class="mt-1 w-auto rounded-md py-1"
            />
          </div>
        </div>
      </div>
      <div
        class="card ml-5 mr-5 pb-4 shadow-2xl dark:shadow-2xl dark:shadow-violet-950"
      >
        <h1 for="email"><strong>Email</strong></h1>
        <InputText
          v-model="selectedUsuario.email"
          type="email"
          id="email"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
          placeholder="Ingrese el correo electronico"
          readonly
        />
      </div>
      <div class="p-4 flex justify-end space-x-4">
        <Button
          type="submit"
          severity="help"
          raised
          class="px-4 py-2 !rounded-2xl w-36"
        >
          Guardar
        </Button>
        <Button
          type="button"
          severity="secondary"
          raised
          class="px-4 py-2 !rounded-2xl w-36"
          @click="cerrar"
        >
          Cerrar
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import CustomFileInput from "@/components/CustomFileInput.vue";
import { useToast } from "primevue/usetoast";
import api from "@/axiosConfig.js";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();

const toast = useToast();
const idUsuario = authStore.usuario.id;
const tipoUsuario = authStore.usuario.tipoUsuario;
const router = useRouter();

let selectedFile = null;

/* esto es para seleccionar varios datos de una tabla
const selectedRow = ref();*/
const selectedUsuario = ref({
  nombres: "",
  primerApellido: "",
  segundoApellido: "",
  email: "",
  contrasenia: "", // Se maneja en el frontend
  fotoPerfil: "",
  fechaNacimiento: "",
  tipoUsuario: tipoUsuario,
  estado: 2, // Por defecto inactivo
  idUsuario: idUsuario,
});
const validarInput = (event) => {
  // Expresión regular para permitir solo letras y espacios
  const regex = /^[A-Za-z\s]*$/;

  // Si el valor ingresado no coincide con la expresión regular
  if (!regex.test(event.target.value)) {
    // Eliminar el último carácter ingresado
    event.target.value = event.target.value.slice(0, -1);
    selectedUsuario.value.nombres = event.target.value; // Actualizar el modelo de Vue
    selectedUsuario.value.primerApellido = event.target.value; // Actualizar el modelo de Vue
    selectedUsuario.value.segundoApellido = event.target.value; // Actualizar el modelo de Vue
  }
};

// Función para obtener los datos de un usuario por su ID
const obtenerUsuario = async (idUsuario) => {
  try {
    const response = await api.get(`/usuarios/obtenerUsuario/${idUsuario}`);
    selectedUsuario.value = response.data;
    selectedUsuario.value.fechaNacimiento = new Date(
      selectedUsuario.value.fechaNacimiento
    );
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Hubo un problema al cargar los datos del usuario.",
      life: 3000,
    });
  }
};

function convertirFechaAMysql(fecha) {
    console.log("sdfd",fecha)
    if (!(fecha instanceof Date)) {
    return fecha; // Si ya es una cadena, regresa como está
  }

  // Formatear la fecha a dd-mm-yyyy antes de dividir
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son de 0 a 11
  const anio = fecha.getFullYear();
  
  return `${anio}-${mes}-${dia}`; // Regresar al formato yyyy-mm-dd
}


const cerrar = async () => {
  router.push("/panelControl/main"); // Redirigir a la página de inicio o login
};

const validarCamposAct = () => {
  // Verificar si los campos requeridos están completos
  if (
    !selectedUsuario.value.nombres ||
    !selectedUsuario.value.primerApellido ||
    !selectedUsuario.value.segundoApellido ||
    !selectedUsuario.value.fechaNacimiento
  ) {
    toast.add({
      severity: "warn",
      summary: "Campos incompletos",
      detail:
        "Por favor llene todos los campos, todos los campos son requeridos.",
      life: 3000,
    });
    return false;
  }

  // Verificar que al menos uno de los campos `miniatura` o `selectedFile` esté presente
  if (!selectedUsuario.value.fotoPerfil && !selectedFile) {
    toast.add({
      severity: "warn",
      summary: "Falta la Foto de Perfil",
      detail: "Debe subir una Foto de perfil para guardar cambios",
      life: 3000,
    });
    return false;
  }

  return true;
};

// Función para actualizar el usuario
const updateUsuario = async () => {
  if (!validarCamposAct()) return;
  console.log("sadfasd");
  const formData = new FormData();
  formData.append("nombres", selectedUsuario.value.nombres);
  formData.append("primerApellido", selectedUsuario.value.primerApellido);
  formData.append("segundoApellido", selectedUsuario.value.segundoApellido);
  formData.append("email", selectedUsuario.value.email);
  formData.append("tipoUsuario", selectedUsuario.value.tipoUsuario);
  formData.append("idUsuario", idUsuario);

  formData.append(
    "fechaNacimiento",
    convertirFechaAMysql(selectedUsuario.value.fechaNacimiento)
  );
  if (
    selectedUsuario.value.fotoPerfil ===
      "http://localhost:3000/uploads/usuarios/avatar3.png" ||
    selectedUsuario.value.fotoPerfil === null
  ) {
    selectedUsuario.value.fotoPerfil = null;
  }
  console.log(selectedUsuario.value.fotoPerfil);

  if (selectedFile) {
    formData.append("fotoPerfil", selectedFile);
  } else {
    selectedUsuario.value.fotoPerfil;
  }

  try {
    const response = await api.put(
      `/usuarios/editarUsuario/${selectedUsuario.value.id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    toast.add({
      severity: "success",
      summary: "Usuario actualizado",
      detail: "Los datos del usuario han sido actualizados correctamente.",
      life: 3000,
    });
    // Si la solicitud es exitosa, actualizamos el store con todos los datos del usuario
    const updatedUsuario = response.data.usuario; // Usuario actualizado

    authStore.actualizarUsuario(updatedUsuario); // Actualizar todos los campos del usuario en el store

    router.push("/panelControl/main");
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Hubo un problema al actualizar el usuario.",
      life: 3000,
    });
  }
};
const nombreCompleto = () => {
  const nombress = selectedUsuario.value.nombres;
  const primerApellidos = selectedUsuario.value.primerApellido;
  const nombres = nombress || ""; // Asegurarse de que `nombres` no sea undefined
  const nombreCompleto = nombres.split(" ")[0] + " " + primerApellidos;

  return nombreCompleto; // Dividir por espacios y retornar el primer elemento
};
const handleFileUpload = (event) => {
  selectedFile = event.target.files[0];
};
const updatePasswordUsuario = async () => {
  const formData = new FormData();
  formData.append("idUsuario", idUsuario);
  selectedUsuario.value.contrasenia = generatePassword();
  console.log("nueva contrase;a", selectedUsuario.value.contrasenia);
  formData.append("contrasenia", selectedUsuario.value.contrasenia); // Solo enviar si se cambia
  formData.append("email", selectedUsuario.value.email);

  try {
    // Esperar el valor de `nombreCompleto()` si es una función asíncrona.
    const nombre = nombreCompleto();
    formData.append("nombreCompleto", nombre);

    // Agregar el toast de éxito antes de enviar la solicitud.
    toast.add({
      severity: "success",
      summary: "Contraseña ha sido Actualizada",
      detail: "La nueva contraseña se envió a su correo electronico.",
      life: 3000,
    });

    await api.put(
      `/usuarios/cambiarContrasenia/${selectedUsuario.value.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Hubo un problema al actualizar el usuario. Intente nuevamente.",
      life: 3000,
    });
  }
};
const generatePassword = () => {
  const length = 8;
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  const allChars = lowercase + uppercase + numbers + special;

  let password = [];

  // Garantizamos que al menos un carácter de cada tipo esté presente
  password.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
  password.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
  password.push(numbers[Math.floor(Math.random() * numbers.length)]);
  password.push(special[Math.floor(Math.random() * special.length)]);

  // Rellenamos la contraseña con caracteres aleatorios hasta llegar a 8 caracteres
  while (password.length < length) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Mezclamos la contraseña para evitar patrones predecibles
  password = password.sort(() => Math.random() - 0.5).join("");

  return password;
};
// Cargar datos del usuario al montar el componente
onMounted(() => {
  obtenerUsuario(idUsuario);
});
</script>
