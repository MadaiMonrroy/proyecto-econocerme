<template>
  <div class="flex justify-end">
    <button
      @click="togglePopover"
      class="inline-flex w-9 h-9 -m-1 items-center justify-center surface-0 dark:surface-800 rounded-full shadow-xl"
      style="font-size: 1.5rem"
      type="button"
    >
      <i class="pi pi-shopping-cart dark:text-white !text-xl"></i>
    </button>
    <Popover ref="op" :autoZIndex="false">
      <div class="flex flex-col pt-4 gap-4 w-[20rem]">
        <div>
          <h2 class="font-medium block mb-2">Cursos en el Carrito</h2>

          <ul
            v-if="cursosCarrito.length > 0"
            class="list-none p-0 m-0 flex flex-col gap-4"
          >
            <li
              v-for="curso in cursosCarrito"
              :key="curso.idCurso"
              class="flex items-center gap-4 p-4 border-b border-surface-200 dark:border-surface-700"
            >
              <img
                :src="curso.miniatura"
                alt="curso miniatura"
                class="w-20 h-20 object-cover rounded"
              />
              <div class="flex flex-col flex-1">
                <span class="font-medium">{{ curso.titulo }}</span>
                <span class="text-sm font-semibold"
                  >Precio: {{ curso.precio }}</span
                >
              </div>
              <Button
                @click="eliminarCurso(curso.idCurso)"
                icon="pi pi-cart-minus"
                severity="danger"
                text
                raised
                rounded
                v-tooltip.top="{
                  value: 'Eliminar de la cesta',
                  showDelay: 0,
                  hideDelay: 100,
                }"
              >
              </Button>
            </li>
          </ul>
          <!-- Si no hay cursos en el carrito, muestra un mensaje -->
          <div v-else class="text-center p-4 text-gray-500">
            No hay cursos en el carrito.
          </div>
          <!-- Botón para confirmar la preinscripción -->
          <Button
            v-if="cursosCarrito.length > 0"
            @click="confirmarPreinscripcion"
            label="Confirmar Preinscripción"
            class="w-full mt-4"
            severity="success"
          />
        </div>
      </div>
    </Popover>
    <!-- Dialog de PrimeVue para mostrar el mensaje -->
    <Dialog
      v-model:visible="dialogVisible"
      header="Confirmación"
      :closable="false"
      :modal="true"
      class="w-[25rem]"
    >
      <div class="relative mb-4 flex flex-col items-center justify-center">
        <!-- Spinner y mensaje de éxito -->
        <p class="text-gray-800 mb-7">{{ mensajeDialogo }}</p>
        <div class="relative flex justify-center items-center mb-4">
          <div class="loader"></div>
          <svg
            class="w-24 h-24 absolute text-green-500 check-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              class="check-path"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
      </div>
    </Dialog>

    <!-- Dialog para mostrar mensaje de error -->
    <Dialog
      v-model:visible="dialogErrorVisible"
      header="Error"
      :closable="false"
      :modal="true"
      class="w-[20rem]"
    >
      <div class="relative mb-4 flex flex-col items-center justify-center">
        <!-- Mensaje de error -->
        <p class="text-gray-800 mb-7">{{ mensajeErrorDialogo }}</p>
        <div class="relative flex justify-center items-center mb-4">
          <div class="loader"></div>
          <svg
            class="w-24 h-24 absolute text-red-500 error-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              class="error-path"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>
      </div>
    </Dialog>
  </div>
</template>
<script setup>
import { useAuthStore } from "@/stores/authStore";
import { ref } from "vue";
import api from "@/axiosConfig.js";

const cursosCarrito = ref([]); // Referencia para almacenar los cursos del carrito
const authStore = useAuthStore();
const dialogVisible = ref(false); // Controla la visibilidad del Dialog
const mensajeDialogo = ref(""); // Mensaje que se mostrará en el Dialog
const dialogErrorVisible = ref(false); // Controla la visibilidad del Dialog de error
const mensajeErrorDialogo = ref(""); // Mensaje que se mostrará en el Dialog de error

const cargarCarrito = () => {
  // Obtener el carrito del localStorage
  const carrito =
    JSON.parse(localStorage.getItem(`carrito_${authStore.usuario.id}`)) || [];

  // Asignar los cursos del carrito a la referencia
  cursosCarrito.value = carrito;
};
const op = ref();
// Eliminar curso del carrito
const eliminarCurso = (idCurso) => {
  // Filtrar el curso que queremos eliminar
  cursosCarrito.value = cursosCarrito.value.filter(
    (curso) => curso.idCurso !== idCurso
  );

  // Actualizar el localStorage
  localStorage.setItem(
    `carrito_${authStore.usuario.id}`,
    JSON.stringify(cursosCarrito.value)
  );
};
const togglePopover = (event) => {
  cargarCarrito(); // Cargar los cursos antes de abrir el Popover
  if (op.value) {
    op.value.toggle(event);
  } else {
    console.error("Popover ref is not defined"); // Mensaje de error en consola
  }
};
const guardarCarrito = async () => {
  const userId = authStore.usuario?.id;
  const carritoLocal = localStorage.getItem(`carrito_${userId}`);
  let carritoData = [];

  if (carritoLocal) {
    // Extraer solo los ids de los cursos
    carritoData = JSON.parse(carritoLocal).map((item) => item.idCurso);
  }
  // Verificar si el carrito está vacío en el localStorage y en general
  if (!carritoLocal || carritoData.length === 0) {
    carritoData = []; // Mandar array vacío si el carrito está vacío
  }

  if (userId) {
    const dataToSend = {
      idUsuario: userId,
      idCurso: carritoData, // Aquí ya tienes solo los IDs, sin los nombres de las claves
    };

    try {
      const response = await api.post(
        "/carritos/agregarProductoCarrito",
        dataToSend
      );
      console.log("Carrito guardado exitosamente:", response.data);
    } catch (error) {
      console.error("Error al guardar el carrito:", error);
    }
  }
};

// Función para confirmar la preinscripción
const confirmarPreinscripcion = async () => {
  try {
    const idCurso = cursosCarrito.value.map((curso) => curso.idCurso); // Obtener IDs de los cursos
    const idUsuario = authStore.usuario.id;
    // Enviar datos al backend
    const response = await api.post("/inscripciones/agregarPreInscripcion", {
      idUsuario,
      idCurso,
      idUsuarioModificacion: idUsuario,
    });

    if (response.status === 200) {
      // Mostrar el dialog con el mensaje
      mensajeDialogo.value = "Preinscripción exitosa.";
      dialogVisible.value = true;

      // Cerrar el dialog automáticamente después de 3 segundos
      setTimeout(() => {
        dialogVisible.value = false;
      }, 3000);
      guardarCarrito();
      // Limpiar el carrito después de la preinscripción
      cursosCarrito.value = [];
      localStorage.removeItem(`carrito_${authStore.usuario.id}`);
      // Cerrar el Popover después de vaciar el carrito
      op.value.hide(); // Cerrar el Popover

    }
  } catch (error) {
    console.error("Error en la preinscripción:", error);
    // Mostrar el mensaje de error en el diálogo de error
    mensajeErrorDialogo.value = "Ocurrió un error durante la preinscripción.";
    dialogErrorVisible.value = true;

    setTimeout(() => {
      dialogErrorVisible.value = false;
    }, 3000);
  }
};
</script>
<style scoped>
.loader {
  border: 12px solid rgba(0, 0, 0, 0.1);
  border-left-color: rgba(33, 3, 85, 0.749);
  border-radius: 50%;
  width: 150px; /* Cambia esto para agrandar */
  height: 150px; /* Cambia esto para agrandar */
  animation: spin 1.5s linear infinite;
  position: relative;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.check-icon {
  display: none;
  width: 150px; /* Cambia esto para agrandar */
  height: 150px; /* Cambia esto para agrandar */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
}

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

.relative:not(.loader) .check-icon {
  display: block;
  animation:
    draw 2s ease forwards,
    bounceAfterDraw 1s ease-in-out 2s forwards;
}

.check-path {
  stroke: rgba(111, 10, 136, 0.986);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.error-icon {
  display: none;
  width: 150px; /* Cambia esto para agrandar */
  height: 150px; /* Cambia esto para agrandar */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
}

.relative:not(.loader) .error-icon {
  display: block;
  animation:
    draw 2s ease forwards,
    bounceAfterDraw 1s ease-in-out 2s forwards;
}

.error-path {
  stroke: rgba(255, 0, 0, 0.9);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
