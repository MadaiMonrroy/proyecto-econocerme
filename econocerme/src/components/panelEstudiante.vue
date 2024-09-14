<template>
  <div
    style="background-color: rgba(99, 63, 191, 0.39)"
    class="flex flex-col min-h-screen bg-opacity-0"
  >
    <header
      class="custom-gradient text-black p-5 flex justify-between items-center fixed top-0 left-0 w-full z-20 shadow-lg shadow-purple-800/50"
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
        <theme-switcher class="w-14 h-14"></theme-switcher>
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
    const authStore = useAuthStore();
    const router = useRouter();

    onMounted(() => {
      authStore.loadUser();
      if (!authStore.isAuthenticated) {
        router.push("/");
        console.log(authStore.usuario);
      }
    });

    const menu = ref();
    const primerNombre = computed(() => {
      const nombres = authStore.usuario.nombres || "";
      return nombres.split(" ")[0];
    });

    const profileItems = ref([
      {
        label: "Perfil",
        icon: "pi pi-user",
        command: () => {},
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
      authStore,
      menu,
      toggle,
      primerNombre,
      profileItems,

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
