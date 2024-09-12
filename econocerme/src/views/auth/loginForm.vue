<template>
  <div class="flex w-full min-h-screen bg-gradient-custom items-center justify-center">
    <div class="w-full max-w-md bg-white bg-opacity-35 rounded-3xl shadow-2xl overflow-hidden p-8">
      <!-- Formulario de login -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <h1 class="text-1xl mb-6 text-center text-gray-950">
          Ingrese su credencial para acceder a su cuenta.
        </h1>
        <div class="mb-6 text-center">
          <img src="@/assets/logoec.png" alt="Login Logo" class="mx-auto h-16 w-auto" />
        </div>

        <div class="mb-2">
          <label for="email" class="block text-gray-950 text-sm font-medium mb-2">Email:</label>
          <div class="relative">
            <div class="flex items-center border border-gray-200 rounded-lg shadow-sm bg-gray-800 bg-opacity-0">
              <img src="@/assets/icon.correo.png" alt="Email Icon" class="absolute left-3 h-6 w-6 text-gray-500" />
              <input type="email" v-model="email" id="email"
                class="w-full pl-12 py-2 bg-purple-50 bg-opacity-50 border-none rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-950"
                placeholder="example@mail.com" />
            </div>
          </div>
        </div>

        <div class="mb-2">
          <label for="password" class="block text-gray-950 text-sm font-medium mb-2">Contraseña:</label>
          <div class="relative">
            <div class="flex items-center border border-gray-200 rounded-lg shadow-sm bg-gray-100 bg-opacity-0">
              <img src="@/assets/icon.password.png" alt="Password Icon" class="absolute left-3 h-6 w-6 text-gray-600" />
              <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password"
                class="w-full pl-12 py-2 bg-gray-50 placeholder-gray-500 bg-opacity-50 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-950"
                placeholder="" />
              <img src="@/assets/icon.vista.png" alt="Toggle Password Visibility" @click="togglePasswordVisibility"
                class="absolute right-3 cursor-pointer h-6 w-6 text-gray-950" />
            </div>
          </div>
        </div>

        <!-- Checkbox Mejorado -->
        <div class="flex items-center mb-6 ml-1">
          <input type="checkbox" id="remember" v-model="remember"
            class="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-purple-500 focus:ring-2" />
          <label for="remember" class="ml-2 text-gray-950 text-sm">Recordar contraseña</label>
        </div>

        <div class="flex flex-col items-center space-y-4 mb-3">
          <Button
            class="bg-purple-950 hover:bg-purple-950 text-fuchsia-300 font-bold py-3 px-6 rounded-md border-2 border-purple-900 shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-purple-900 focus:ring-offset-2 w-full"
            type="submit" label="INGRESAR" severity="help" raised v-if="!isLoading"></Button>
          <span v-else class="loader mt-4"></span>
          <!-- Aquí muestra el spinner -->
        </div>

        <div class="flex justify-center items-center mt-6">
          <p class="text-center text-gray-950 text-sm">
            ¿No tienes una cuenta?
            <Button label="Regístrate" link class="p-button-text !text-violet-800 hover:text-purple-100 underline"
              @click="goToRegister"></Button>
          </p>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/authStore"; // Importa el store de autenticación

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore(); // Instancia el store de autenticación

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const remember = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    toast.add({
      severity: "warn",
      summary: "Campos vacíos",
      detail: "Por favor, complete todos los campos.",
      life: 3000,
    });
    return;
  }

  isLoading.value = true; // Iniciar estado de carga

  try {
    const response = await authStore.login(email.value, password.value); // Usa el método de login del store

    if (response) {
      toast.add({
        severity: "success",
        summary: "Login exitoso",
        detail: "Inicio de sesión exitoso",
        life: 3000,
      });
      const tipoUsuario = response.usuario.tipoUsuario;
      // Asegúrate de que estás accediendo a la propiedad correcta
      setTimeout(() => {
        if (tipoUsuario === "admin") {
          router.push("/panelControl/main");
        } else {
          router.push("/menuBar");
        }
      }, 1000);
      if (remember.value) {
        localStorage.setItem("email", email.value);
        localStorage.setItem("password", password.value);
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    isLoading.value = false; // Detener estado de carga
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Credenciales incorrectas. Inténtelo nuevamente.",
      life: 3000,
    });
  }
};

// Cargar el email y contraseña si están guardados
onMounted(() => {
  if (authStore.isAuthenticated == true) {
    const userTipo = authStore.usuario.tipoUsuario
    if (userTipo === "admin") {
          router.push("/panelControl/main");
        } else {
          router.push("/menuBar");
        }
  }
});

const goToRegister = () => {
  router.push("/Registro");
};
</script>

<style scoped>
.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  /* Puedes ajustar el grosor del borde si lo deseas */
  border-radius: 50%;
  border-top: 4px solid #7b1fa2;
  /* Color del borde superior */
  width: 48px;
  /* Ajusta el tamaño aquí */
  height: 48px;
  /* Ajusta el tamaño aquí */
  animation: spin 1s linear infinite;
  /* Puedes ajustar la velocidad de la animación aquí */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Efecto de iluminación en movimiento aleatorio */
@keyframes randomLight {
  0% {
    background-position: 0% 0%;
  }

  25% {
    background-position: 100% 0%;
  }

  50% {
    background-position: 100% 100%;
  }

  75% {
    background-position: 0% 100%;
  }

  100% {
    background-position: 0% 0%;
  }
}

.bg-gradient-custom {
  background: radial-gradient(circle at 50% 50%,
      rgba(150, 16, 187, 0.941),
      rgba(33, 3, 85, 0.918));
  background-size: 200% 200%;
  animation:
    gradientShift 8s ease infinite,
    randomLight 5s linear infinite;
}

/* Cambié la animación de gradiente para que tenga un movimiento más visible */
@keyframes gradientShift {
  0% {
    background-position: 0% 0%;
  }

  50% {
    background-position: 100% 100%;
  }

  100% {
    background-position: 0% 0%;
  }
}
</style>