<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-custom">
    <div class="w-full max-w-xl p-9 bg-white bg-opacity-80 rounded-3xl shadow-[0_4px_10px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] relative z-10">
      <h1 class="text-1xl font-bold mb-6 text-center text-gray-800">
        Regístrate y únete a nuestra comunidad
      </h1>
      <div class="mb-6 text-center">
        <img src="@/assets/logoec.png" alt="Login Logo" class="mx-auto h-20 w-auto" />
      </div>
      <form @submit.prevent="handleSubmit">
        <!-- Nombres -->
        <div class="mb-4">
          <label for="nombres" class="block text-base font-semibold text-gray-700 mb-1">
            Nombres <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-6">
            <InputText
              v-model="primerNombre"
              id="primerNombre"
              placeholder="Primer Nombre"
              class="w-full"
              size="large"
              required
              @input="validarCaracteresAlfabeticos($event, 'primerNombre')"
            />
            <InputText
              v-model="segundoNombre"
              id="segundoNombre"
              placeholder="Segundo Nombre"
              class="w-full"
              size="large"
              @input="validarCaracteresAlfabeticos($event, 'segundoNombre')"
            />
          </div>
        </div>
        <!-- Apellidos -->
        <div class="mb-4">
          <label for="apellidos" class="block text-base font-semibold text-gray-700 mb-1">
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
          <label for="email" class="block text-base font-semibold text-gray-700 mb-1">
            Correo Electrónico: <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="email"
            id="email"
            type="email"
            placeholder="nombre@ejemplo.com"
            class="w-full max-w-lg"
            size="large"
            required
          />
        </div>
        <!-- Contraseña -->
        <div class="mb-4 flex gap-8">
          <div class="flex-grow">
            <label for="contraseña" class="block text-base font-semibold text-gray-700 mb-1">
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
                <div class="font-semibold text-lg mb-4">Elige una contraseña</div>
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
            <label for="repetirContraseña" class="block text-base font-semibold text-gray-700 mb-1">
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
      <Toast />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const router = useRouter();

const primerNombre = ref("");
const segundoNombre = ref("");
const primerApellido = ref("");
const segundoApellido = ref("");
const email = ref("");
const contraseña = ref("");
const repetirContraseña = ref("");

const validarNombre = (nombre) => /^[a-zA-Z]+$/.test(nombre);
const validarEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);

const handleSubmit = async () => {
  // Validar campos
  if (
    !primerNombre.value ||
    !validarNombre(primerNombre.value) ||
    (segundoNombre.value && !validarNombre(segundoNombre.value)) ||
    !primerApellido.value ||
    !validarNombre(primerApellido.value) ||
    (segundoApellido.value && !validarNombre(segundoApellido.value)) ||
    !email.value ||
    !validarEmail(email.value) ||
    !contraseña.value ||
    !repetirContraseña.value ||
    contraseña.value !== repetirContraseña.value
  ) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        "Por favor completa todos los campos obligatorios correctamente.",
      life: 3000,
    });
    return;
  }

  // Validar contraseña
  if (contraseña.value.length < 8) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "La contraseña debe tener al menos 8 caracteres.",
      life: 3000,
    });
    return;
  }

  try {
    const usuario = {
      primerNombre: primerNombre.value,
      segundoNombre: segundoNombre.value,
      primerApellido: primerApellido.value,
      segundoApellido: segundoApellido.value,
      email: email.value,
      contrasenia: contraseña.value,
      repetirContrasenia: repetirContraseña.value
    };

    const response = await axios.post(
      "http://localhost:3000/api/auth/registro",
      usuario,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 201) {
      localStorage.setItem('token', response.data.token);

      toast.add({
        severity: "success",
        summary: "Éxito",
        detail: "Por favor verifica tu gmail",
        life: 2000,
      });

      // Esperar 3 segundos antes de redirigir
      setTimeout(() => {
        // Limpiar los campos del formulario
        primerNombre.value = "";
        segundoNombre.value = "";
        primerApellido.value = "";
        segundoApellido.value = "";
        email.value = "";
        contraseña.value = "";
        repetirContraseña.value = "";
        router.push("/");
      }, 3000);
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
    if (inputName === "primerNombre") primerNombre.value = event.target.value;
    if (inputName === "segundoNombre") segundoNombre.value = event.target.value;
    if (inputName === "primerApellido") primerApellido.value = event.target.value;
    if (inputName === "segundoApellido") segundoApellido.value = event.target.value;
  }
};
</script>

<style scoped>
/* Si es necesario, puedes añadir estilos específicos aquí */
</style>
