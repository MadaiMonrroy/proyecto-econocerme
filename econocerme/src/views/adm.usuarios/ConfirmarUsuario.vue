<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-custom ">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center bg-opacity-45">
      <!-- Mensaje y animación de carga -->
      <div v-if="loading" class="relative mb-4">
        <p class="text-gray-800 mb-7 ">Confirmando correo electrónico...</p>
        <div class="relative flex justify-center items-center">
          <div class="loader"></div>
          <div class="sparkles"></div>
        </div>
      </div>

      <!-- Mensaje de confirmación -->
      <div v-else class="relative mb-4">
        <p class="text-gray-800 mb-7 ">¡Cuenta Confirmada!</p>
        <div class="relative flex justify-center items-center">
          <div class="loader"></div>
          <svg class="w-48 h-48 absolute text-green-500 check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path class="check-path" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div class="sparkles"></div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      token: this.$route.params.token,
      loading: true
    };
  },
  
  async created() {
    try {
      const response = await axios.get(`http://localhost:3000/api/auth/confirmar/${this.token}`);
      console.log(response.data.mensaje); // Para depuración si es necesario

      setTimeout(() => {
        this.loading = false;
        setTimeout(() => {
          this.$router.push('/'); // Redirige automáticamente después de la animación
        }, 4000); // Tiempo para mostrar el mensaje de confirmación
      }, 2000); // Tiempo para la animación de carga (5 segundos)
    } catch (error) {
      console.error('Error al confirmar el usuario:', error.response ? error.response.data : error.message);
      this.$router.push('/error'); // Redirige a una vista de error en caso de fallo
    }
  }
};
</script>

<style scoped>
/* Estilos para el círculo cargador */
.loader {
  border: 12px solid rgba(0, 0, 0, 0.1);
  border-left-color: rgba(33, 3, 85, 0.749);

  border-radius: 50%;
  width: 240px; /* Tamaño del círculo */
  height: 240px; /* Tamaño del círculo */
  animation: spin 1.5s linear infinite;
  position: relative;
}

/* Animación de rotación */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Estilos para el ícono de check */
.check-icon {
  display: none;
  width: 240px; /* Tamaño del check */
  height: 240px; /* Tamaño del check */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
}

/* Animación de dibujo del check */
@keyframes draw {
  0% {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }
}

/* Animación de zoom y rebote del check después del dibujo */
@keyframes bounceAfterDraw {
  0% {
    transform: scale(1) translate(-50%, -50%);
    opacity: 1;
  }
  50% {
    transform: scale(1.5) translate(-50%, -50%);
    opacity: 0.7;
  }
  70% {
    transform: scale(0.9) translate(-50%, -50%);
    opacity: 0.9;
  }
  100% {
    transform: scale(1) translate(-50%, -50%);
    opacity: 1;
  }
}


@keyframes sparkle {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.5);
    opacity: 0;
  }
}

/* Mostrar el ícono de check después de la animación de carga */
.relative:not(.loader) .check-icon {
  display: block;
  animation: draw 3s ease forwards, bounceAfterDraw 1s ease-in-out 2s forwards; /* Añade la animación de dibujo y rebote después del dibujo */
}

/* Estilos para la ruta del check */
.check-path {
  stroke: rgba(111, 10, 136, 0.986);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
