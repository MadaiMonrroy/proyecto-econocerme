<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-custom">
    <div v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
      class="w-full max-w-xl p-9 bg-white bg-opacity-80 rounded-3xl shadow-[0_4px_10px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] relative z-10 animate-duration-2000"
    >
      <h1 class="text-1xl font-bold mb-6 text-center text-gray-800">
        Regístrate y únete a nuestra comunidad
      </h1>
      <div class="mb-6 text-center">
        <img
          src="@/assets/logoec.png"
          alt="Login Logo"
          class="mx-auto h-20 w-auto"
        />
      </div>
      <form @submit.prevent="handleSubmit">
        <!-- Nombres -->
        <div class="mb-4">
          <label
            for="nombres"
            class="block text-base font-semibold text-gray-700 mb-1"
          >
            Nombres <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-6">
            <InputText
              v-model="nombres"
              id="nombres"
              placeholder="Nombres"
              class="w-full"
              size="large"
              required
              @input="validarCaracteresAlfabeticos($event, 'nombres')"
            />
          </div>
        </div>
        <!-- Apellidos -->
        <div class="mb-4">
          <label
            for="apellidos"
            class="block text-base font-semibold text-gray-700 mb-1"
          >
            Apellidos <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-6">
            <InputText
              v-model="primerApellido"
              id="primerApellido"
              placeholder="Primer Apellido"
              class="w-full"
              size="large"
              required
              @input="validarCaracteresAlfabeticos($event, 'primerApellido')"
            />
            <InputText
              v-model="segundoApellido"
              id="segundoApellido"
              placeholder="Segundo Apellido"
              class="w-full"
              @input="validarCaracteresAlfabeticos($event, 'segundoApellido')"
            />
          </div>
        </div>
        <!-- Email -->
        <div class="mb-4">
          <label
            for="email"
            class="block text-base font-semibold text-gray-700 mb-1"
          >
            Correo Electrónico: <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="email"
            id="email"
            
            placeholder="nombre@ejemplo.com"
            class="w-full max-w-lg"
            size="large"
            required
          />
        </div>
        <!-- Contraseña -->
        <div class="mb-4 flex gap-8">
          <div class="flex-grow">
            <label
              for="contraseña"
              class="block text-base font-semibold text-gray-700 mb-1"
            >
              Contraseña: <span class="text-red-500">*</span>
            </label>
            <Password
              v-model="contraseña"
              inputId="contraseña"
              placeholder="Ingresa una contraseña"
              class="w-auto h-4/6"
              size="large"
              toggleMask
              required
            >
              <template #header>
                <div class="font-semibold text-lg mb-4">
                  Elige una contraseña
                </div>
              </template>
              <template #footer>
                <Divider />
                <ul class="pl-1 ml-1 my-0 leading-normal">
                  <li>Al menos una minúscula y una mayúscula</li>
                  <li>Al menos un número y un carácter especial</li>
                  <li>Mínimo 8 caracteres</li>
                </ul>
              </template>
            </Password>
          </div>
          <!-- Repetir Contraseña -->
          <div class="flex-grow">
            <label
              for="repetirContraseña"
              class="block text-base font-semibold text-gray-700 mb-1"
            >
              Repetir Contraseña: <span class="text-red-500">*</span>
            </label>
            <Password
              v-model="repetirContraseña"
              inputId="repetirContraseña"
              placeholder="Confirma tu contraseña"
              class="w-auto h-4/6"
              size="large"
              toggleMask
              required
            />
          </div>
        </div>
        <!-- Botones -->
        <div class="flex justify-between items-center">
          <Button
            label="Volver"
            severity="help"
            icon="pi pi-arrow-left"
            class="p-button-text text-purple-700 hover:text-purple-900"
            @click="goBack"
          />
          <Button
            type="submit"
            severity="help"
            raised
            label="Registrarse"
            class="p-button bg-purple-700 text-white hover:bg-purple-800"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import api from "@/axiosConfig.js";

const toast = useToast();
const router = useRouter();

const nombres = ref("");
const primerApellido = ref("");
const segundoApellido = ref("");
const email = ref("");
const contraseña = ref("");
const repetirContraseña = ref("");

const validarNombre = (nombre) => /^[a-zA-Z\s]+$/.test(nombre);
const validarEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);

const handleSubmit = async () => {
  // Validar campos requeridos y formato correcto
  if (!nombres.value || !validarNombre(nombres.value)) {
    toast.add({ severity: "error", summary: "Error", detail: "Por favor, ingresa un nombre válido. El nombre debe contener solo letras y no estar vacío.", life: 3000 });
    return;
  }
  if (!primerApellido.value || !validarNombre(primerApellido.value)) {
    toast.add({ severity: "error", summary: "Error", detail: "Por favor, ingresa un primer apellido válido. El apellido debe contener solo letras y no estar vacío.", life: 3000 });
    return;
  }
  if (segundoApellido.value && !validarNombre(segundoApellido.value)) {
    toast.add({ severity: "error", summary: "Error", detail: "Si decides ingresar un segundo apellido, asegúrate de que sea válido. Debe contener solo letras.", life: 3000 });
    return;
  }
  if (!email.value || !validarEmail(email.value)) {
    toast.add({ severity: "error", summary: "Error", detail: "Por favor, ingresa un correo electrónico válido. Asegúrate de incluir '@' y un dominio.", life: 3000 });
    return;
  }
  if (contraseña.value !== repetirContraseña.value) {
    toast.add({ severity: "error", summary: "Error", detail: "Las contraseñas ingresadas no coinciden. Por favor, verifica que sean iguales.", life: 3000 });
    return;
  }
  if (!contraseña.value || contraseña.value.length < 8) {
    toast.add({ severity: "error", summary: "Error", detail: "La contraseña debe tener al menos 8 caracteres y es recomendable que tenga letras, números y caracteres especiales.", life: 3000 });
    return;
  }
  

  try {
    const usuario = {
      nombres: nombres.value,
      primerApellido: primerApellido.value,
      segundoApellido: segundoApellido.value,
      email: email.value,
      contrasenia: contraseña.value,
      repetirContrasenia: repetirContraseña.value,
    };

    const response = await api.post("/auth/registro", usuario, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 201) {

      localStorage.setItem("token", response.data.token);
// Limpiar los campos del formulario
      nombres.value = "";
      primerApellido.value = "";
      segundoApellido.value = "";
      email.value = "";
      contraseña.value = "";
      repetirContraseña.value = "";
      router.push("/");
      toast.add({
        severity: "success",
        summary: "Éxito",
        detail: "Por favor verifica tu gmail",
        life: 2000,
      });

      // Esperar 3 segundos antes de redirigir

      
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.mensaje) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: error.response.data.mensaje,
        life: 3000,
      });
    } else {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Ocurrió un error al registrar. Inténtelo nuevamente.",
        life: 3000,
      });
    }
  }
};

// Función para navegar de vuelta a la página de inicio de sesión
const goBack = () => {
  router.push("/");
};

const validarCaracteresAlfabeticos = (event, inputName) => {
  const value = event.target.value;
  const regex = /^[a-zA-Z\s]*$/;

  if (!regex.test(value)) {
    // Remover caracteres no válidos
    event.target.value = value.replace(/[^a-zA-Z\s]/g, "");
    if (inputName === "nombres") nombres.value = event.target.value;
    if (inputName === "primerApellido")
      primerApellido.value = event.target.value;
    if (inputName === "segundoApellido")
      segundoApellido.value = event.target.value;
  }
};
</script>

<style scoped>
/* Si es necesario, puedes añadir estilos específicos aquí */
</style>
