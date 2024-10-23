<template>
  <div
    style="background-color: rgba(77, 41, 165, 0.5)"
    class="w-auto bg-gradient-to-tl from-custom-purple to-custom-pink dark:bg-gradient-to-tl dark:from-dark-purple dark:to-dark-pink"
  >
    <header
      class="bg-gradient-to-t from-custom-purple to-custom-pink dark:bg-gradient-to-t dark:from-dark-purple dark:to-dark-pink text-black h-auto flex justify-between items-center p-5 fixed top-0 left-0 w-full z-10 shadow-lg shadow-purple-800/50"
    >
      <div class="flex items-center">
        <img
          src="@/assets/logoec.png"
          alt="Logo"
          class="h-10 mx-6 dark:brightness-0 dark:invert"
        />
      </div>
      <div class="flex items-center space-x-4">
        <div class="-mr-2">
          <Button
            class="flex items-center justify-center !text-lg dark:text-white !bg-transparent !hover:bg-transparent !border-none"
            text
            severity="contrast"
            label="Dashboard"
            @click="goToDashboard"
            icon="pi pi pi-home "
            iconClass="!text-lg "
            outlined=""
          >
          </Button>
        </div>

        <div class="-mr-4">
          <Button
            class="flex items-center justify-center !text-lg dark:text-white !bg-transparent !font-extralight !border-none"
            text
            severity="contrast"
            label="Mi Aprendizaje"
            @click="goToCursos"
            icon="pi pi pi-book "
            iconClass="!text-lg "
            outlined=""
          >
          </Button>
        </div>

        <div class="-mr-2">
          <Button
            class="flex items-center justify-center text-black !text-lg dark:text-white !bg-transparent !hover:bg-transparent !border-none"
            text
            severity="contrast"
            label="Certificaciones"
            @click="goToCertificaciones"
            icon="pi pi-id-card"
            iconClass="!text-lg "
            outlined=""
          >
          </Button>
        </div>
        <div class="flex justify-end">
          <carrito />
        </div>
        <div>
          <theme-switcher class="w-14 h-14" />
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
            class="text-base font-medium group-hover:shadow-xl dark:text-white transition duration-300"
          >
            {{ primerNombre }}
          </span>
          <i
            class="pi pi-chevron-down group-hover:shadow-lg dark:text-white transition duration-300"
          ></i>
          <Menu
            :autoZIndex="false"
            ref="menu"
            id="overlay_menu"
            :model="profileItems"
            :popup="true"
            class="pt-4"
          />
        </div>
      </div>
    </header>

    <div class="flex flex-1 pt-24">
      <main class="flex-1 p-5 min-h-screen">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Menu from "primevue/menu";
import ThemeSwitcher from "./ThemeSwitcher.vue";
import { useAuthStore } from "@/stores/authStore";
import carrito from "./carrito.vue";
import api from "@/axiosConfig.js";

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
        command: async () => {
          // Cambia a async
          guardarCarrito();
          authStore.logout();
          router.push("/");
        },
      },
    ]);
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
      guardarCarrito,
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
