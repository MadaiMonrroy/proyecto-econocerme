<template>
  <div
    style="background-color: rgba(77, 41, 165, 0.5)"
    class="w-auto bg-gradient-to-tl from-custom-purple to-custom-pink dark:bg-gradient-to-tl dark:from-dark-purple dark:to-dark-pink"
  >
    <header
      class="bg-gradient-to-t from-custom-purple to-custom-pink dark:bg-gradient-to-t dark:from-dark-purple dark:to-dark-pink text-black p-5 flex justify-between items-center fixed top-0 left-0 w-full z-20 shadow-lg shadow-purple-800/50"
    >
      <div class="flex items-center">
        <img src="@/assets/logoec.png" alt="Logo" class="h-10 mx-6" />
      </div>
      <div class="flex items-center space-x-4">
        
        <button class="text-black hover:text-purple-950" @click="goToDashboard">
          <i class="pi pi pi-home text-2x1" style="font-size: 21px">
            Dashboard</i
          >
        </button>
        <button class="text-black hover:text-purple-950" @click="goToCursos">
          <i class="pi pi-book text-xl" style="font-size: 21px"> Mis Cursos</i>
        </button>
        <button
          class="text-black hover:text-purple-950"
          @click="goToCertificaciones"
        >
          <i class="pi pi-id-card text-xl" style="font-size: 21px">
            Certificaciones</i
          >
        </button>
        <i
          class="pi pi-shopping-cart"
          @click="togglePopover"
          style="font-size: 1.5rem"
        ></i>
        <theme-switcher class="w-14 h-14"></theme-switcher>
        <div>
        

        
        </div>
        <div
          class="flex justify-center items-center space-x-2 cursor-pointer group"
          @click="toggle"
          aria-haspopup="true"
          aria-controls="overlay_menu"
        >
          <img
            :src="authStore.usuario.fotoPerfil"
            alt="Perfil"
            class="w-12 h-11 rounded-full group-hover:shadow-2xl transition duration-300"
          />
          <span
            class="text-base font-medium group-hover:shadow-xl transition duration-300"
          >
            {{ primerNombre }}
          </span>
          <i
            class="pi pi-chevron-down group-hover:shadow-lg transition duration-300"
          ></i>
          <Menu
            ref="menu"
            id="overlay_menu"
            :model="profileItems"
            :popup="true"
          />
        </div>
      </div>
    </header>

    <div class="flex flex-1 pt-16">
      <main class="flex-1 p-5">
        <router-view></router-view>
      </main>
    </div>
    <Popover ref="op" >
          <div class="flex flex-col gap-4 w-[25rem]">
            <h2 class="font-medium block mb-2">Cursos en el Carrito</h2>
            <ul class="list-none p-0 m-0 flex flex-col gap-4">
              <li
                v-for="curso in cursosCarrito"
                :key="curso.idCurso"
                class="flex flex-row items-center gap-4 p-4 border-b border-surface-200 dark:border-surface-700"
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
                  text raised
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
        </Popover>
  </div>
  
</template>
<script>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Menu from "primevue/menu";
import ThemeSwitcher from "./ThemeSwitcher.vue";
import { useAuthStore } from "@/stores/authStore";

export default {
  components: { ThemeSwitcher, Menu },
  name: "PanelControl",
  setup() {
    const cursosCarrito = ref([]); // Referencia para almacenar los cursos del carrito
    const authStore = useAuthStore();
    const router = useRouter();

    onMounted(() => {
      authStore.loadUser();
      if (!authStore.isAuthenticated) {
        router.push("/");
        //console.log(authStore.usuario);
      }
    });
    const cargarCarrito = () => {
      // Obtener el carrito del localStorage
      const carrito =
        JSON.parse(localStorage.getItem(`carrito_${authStore.usuario.id}`)) ||
        [];

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
    const menu = ref();
    const primerNombre = computed(() => {
      const nombres = authStore.usuario.nombres || "";
      return nombres.split(" ")[0];
    });

    const profileItems = ref([
      {
        label: "Perfil",
        icon: "pi pi-user",
        command: () => {
          router.push("/panelEstudiante/formEdit");
        },
      },
      {
        label: "Cerrar sesión",
        icon: "pi pi-power-off",
        command: () => {
          authStore.logout();
          router.push("/");
        },
      },
    ]);

    const toggle = (event) => {
      menu.value.toggle(event);
    };
    // Funciones de navegación
    const goToDashboard = () => {
      router.push("/panelEstudiante/dashboard");
    };

    const goToCursos = () => {
      router.push("/panelEstudiante/misCursos");
    };

    const goToCertificaciones = () => {
      router.push("/panelEstudiante/certificaciones");
    };
    return {
      op,
      authStore,
      menu,
      toggle,
      primerNombre,
      profileItems,
      togglePopover,
      cargarCarrito,
      cursosCarrito,

      goToDashboard,
      goToCursos,
      goToCertificaciones,
    };
  },
};
</script>
<style scoped>
.custom-gradient {
  background: linear-gradient(
    to top,
    rgba(77, 41, 165, 0.682),
    rgba(210, 88, 255, 0.538)
  );
}
</style>
