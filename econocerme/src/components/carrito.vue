<template>
  <div class="flex justify-end">
    <button @click="togglePopover"  class=" inline-flex w-9 h-9 -m-1 items-center justify-center surface-0 dark:surface-800  rounded-full shadow-xl"  style="font-size: 1.5rem"
     type="button"> <i class="pi pi-shopping-cart dark:text-white !text-xl"></i></button>
    <Popover ref="op" :autoZIndex="false">
      <div class="flex flex-col pt-4 gap-4 w-[20rem]">
        <div>
          <h2 class="font-medium block mb-2">Cursos en el Carrito</h2>
          
          <ul v-if="cursosCarrito.length > 0" class="list-none p-0 m-0 flex flex-col gap-4">
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
  </div>
</template>
<script setup>
import { useAuthStore } from "@/stores/authStore";
import { ref } from "vue";
import api from "@/axiosConfig.js";

const cursosCarrito = ref([]); // Referencia para almacenar los cursos del carrito
const authStore = useAuthStore();

const cargarCarrito = () => {
  // Obtener el carrito del localStorage
  const carrito =
    JSON.parse(localStorage.getItem(`carrito_${authStore.usuario.id}`)) || [];

  // Asignar los cursos del carrito a la referencia
  cursosCarrito.value = carrito;

  // O si deseas hacer algo con los cursos cargados
  console.log("Cursos en el carrito:", cursosCarrito.value);
};
const op = ref();
// Eliminar curso del carrito
const eliminarCurso = (idCurso) => {
  // Filtrar el curso que queremos eliminar
  cursosCarrito.value = cursosCarrito.value.filter(curso => curso.idCurso !== idCurso);
  
  // Actualizar el localStorage
  localStorage.setItem(`carrito_${authStore.usuario.id}`, JSON.stringify(cursosCarrito.value));

  console.log(`Curso con id ${idCurso} eliminado del carrito.`);
};
const togglePopover = (event) => {
  cargarCarrito(); // Cargar los cursos antes de abrir el Popover
  if (op.value) {
    op.value.toggle(event);
  } else {
    console.error("Popover ref is not defined"); // Mensaje de error en consola
  }
};
// Función para confirmar la preinscripción
const confirmarPreinscripcion = async () => {
  try {
    const idCurso = cursosCarrito.value.map(curso => curso.idCurso); // Obtener IDs de los cursos
    const idUsuario = authStore.usuario.id;
    // Enviar datos al backend
    const response = await api.post('/inscripciones/agregarPreInscripcion', {
      idUsuario,
      idCurso,
      idUsuarioModificacion: idUsuario
    });

    if (response.status === 200) {
      alert('Preinscripción realizada correctamente.');
      
      // Limpiar el carrito después de la preinscripción
      cursosCarrito.value = [];
      localStorage.removeItem(`carrito_${authStore.usuario.id}`);

    }
  } catch (error) {
    console.error('Error en la preinscripción:', error);
    alert('Ocurrió un error durante la preinscripción.');
  }
};
</script>
