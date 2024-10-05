<template>
  <div class="flex justify-end">
    <Button @click="togglePopover" label="dsa" type="button"></Button>
    <Popover ref="op" :autoZIndex="false">
      <div class="flex flex-col gap-4 w-[20rem]">
        <div>
          <h2 class="font-medium block mb-2">Cursos en el Carrito</h2>
          <ul class="list-none p-0 m-0 flex flex-col gap-4">
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
        </div>
      </div>
    </Popover>
  </div>
</template>
<script setup>
import { useAuthStore } from "@/stores/authStore";
import { ref } from "vue";

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

const togglePopover = (event) => {
  cargarCarrito(); // Cargar los cursos antes de abrir el Popover
  if (op.value) {
    op.value.toggle(event);
  } else {
    console.error("Popover ref is not defined"); // Mensaje de error en consola
  }
};
</script>
