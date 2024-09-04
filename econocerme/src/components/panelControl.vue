<template>
  <div
    style="background-color: rgba(99, 63, 191, 0.39)"
    :class="[
      'flex flex-col min-h-screen  bg-opacity-0',
      { 'collapsed-sidebar': isSidebarCollapsed },
    ]"
  >
    <header
      class="custom-gradient text-black p-5 flex justify-between items-center fixed top-0 left-0 w-full z-20 shadow-lg shadow-purple-800/50"
    >
      <div class="flex items-center">
        <img src="@/assets/logoec.png" alt="Logo" class="h-10 mx-6" />
        <button
          @click="toggleSidebar"
          class="mr-4 text-black hover:text-purple-950"
        >
          <i class="pi pi-bars text-[32px]" style="font-size: 21px"></i>
        </button>
      </div>
      <div class="flex items-center space-x-4">
        <button class="text-black hover:text-purple-950">
          <i class="pi pi-envelope text-3x1" style="font-size: 21px"></i>
        </button>
        <button class="text-black hover:text-purple-950">
          <i class="pi pi-bell text-xl" style="font-size: 21px"></i>
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
          <span class="text-base font-medium group-hover:shadow-xl  transition duration-300">{{ primerNombre }}</span>
          <i class="pi pi-chevron-down group-hover:shadow-lg transition duration-300"></i>
          <Menu
            ref="menu"
            id="overlay_menu"
            :model="profileItems"
            :popup="true"
          />
        </div>
      </div>
    </header>

    <div class="flex flex-1 pt-16 shadow-lg shadow-purple-800/50">
      <nav
        :class="[
          'custom-gradient2 text-black font-semibold p-4 fixed top-[69px] bottom-0 overflow-y-auto z-30 transition-all duration-300 shadow-lg shadow-purple-600/100',
          { 'w-[360px]': isSidebarCollapsed, 'w-[230px]': !isSidebarCollapsed },
        ]"
        @mouseenter="handleSidebarMouseEnter"
        @mouseleave="handleSidebarMouseLeave"
      >
        <br />
        <div
          v-if="!isSidebarCollapsed"
          class="flex  flex-col items-center  mb-6"
        >
          <img
            :src="authStore.usuario.fotoPerfil"
            alt="Avatar"
            class="!rounded-full w-[130px] h-[130px] object-cover shadow-2xl shadow-indigo-900"
          />
          <h2 class="mt-2 text-lg font-semibold">{{ primerNombre }} {{ authStore.usuario.primerApellido }}</h2>
          

        </div>
        <ul class="space-y-2">
          <li v-for="(item, index) in menuItems" :key="index" class="w-full">
            <div
              @click="handleMenuClick(item)"
              class="flex items-center cursor-pointer rounded transition-colors duration-300 hover:bg-gradient-to-r from-purple-500 to-purple-900 p-3"
            >
              <i :class="item.icon" class="mr-3" style="font-size: 1.4rem"></i>
              <span
                v-if="!isSidebarCollapsed"
                class="ml-0"
                style="font-size: 1.1rem"
                >{{ item.label }}</span
              >
              <i
                v-if="item.items"
                :class="[
                  'pi',
                  sublistOpen[item.key]
                    ? 'pi-chevron-down'
                    : 'pi-chevron-right',
                  'ml-auto',
                ]"
              ></i>
            </div>
            <ul
              v-if="item.items && sublistOpen[item.key]"
              class="ml-4 mt-2 space-y-1"
            >
              <li v-for="(subItem, subIndex) in item.items" :key="subIndex">
                <router-link
                  :to="subItem.route"
                  class="block p-2 rounded transition-colors duration-300 hover:bg-gradient-to-r from-purple-500 to-purple-900"
                >
                  {{ subItem.label }}
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <main
        :class="{
          'flex-1 p-5': true,
          'ml-16': isSidebarCollapsed,
          'ml-[240px]': !isSidebarCollapsed,
        }"
        class=""
      >
        <p>Usuario: {{ authStore.usuario.email }} </p>
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
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
      if (!authStore.isAuthenticated) {
        router.push("/"); // Redirigir a la página de inicio o login
      }
    });

    const menu = ref();
    const sublistOpen = ref({});
    const isSidebarCollapsed = ref(true);
    const isSidebarHovered = ref(false);
    const isSidebarFixed = ref(false);

    // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA asi se llama a la variable global store
    const usuario = authStore.usuario;
    console.log("yo soy script", usuario);
    console.log("yo soy convertido a json", JSON.stringify(usuario));

    const primerNombre = computed(() => {
      const nombres = usuario.nombres || ""; // Asegurarse de que `nombres` no sea undefined
      return nombres.split(" ")[0]; // Dividir por espacios y retornar el primer elemento
    });

    const menuItems = ref([
      {
        key: "main",
        label: "Main",
        icon: "pi pi-home",
        route: "/panelControl/prueba",
      },
      {
        key: "usuarios",
        label: "Usuarios",
        icon: "pi pi-users",
        items: [
          { label: "Administradores", route: "/panelControl/usuarios" },
          { label: "Coaches", route: "/panelControl/coaches" },
          { label: "Estudiantes", route: "/panelControl/estudiantes" },
        ],
      },
      {
        key: "cursos",
        label: "Cursos",
        icon: "pi pi-book",
        items: [
          { label: "Cursos", route: "/panelControl/cursos" },
          { label: "Módulos", route: "/panelControl/modulos" },
        ],
      },
      {
        key: "inscripciones",
        label: "Inscripciones",
        icon: "pi pi-address-book",
        route: "/panelControl/inscripciones",
      },
      {
        key: "anuncios",
        label: "Anuncios",
        icon: "pi pi-megaphone",
        route: "/panelControl/anuncios",
      },
    ]);

    const profileItems = ref([
      {
        label: "Perfil",
        icon: "pi pi-user",
        command: () => {
          // Add navigation to profile page or other logic here
        },
      },
      {
        label: "Cerrar sesión",
        icon: "pi pi-power-off",
        command: () => {
          authStore.logout(); // Método para cerrar sesión en tu store
          router.push("/"); // Redirigir a la página de inicio o login
        },
      },
    ]);

    const toggleSidebar = () => {
      isSidebarFixed.value = !isSidebarFixed.value;
      isSidebarCollapsed.value = !isSidebarFixed.value;

      // Siempre cerrar todas las sublistas cuando la barra lateral se contrae
      if (isSidebarCollapsed.value) {
        Object.keys(sublistOpen.value).forEach((key) => {
          sublistOpen.value[key] = false;
        });
      }
    };

    const toggleSublist = (key) => {
      if (!isSidebarCollapsed.value) {
        sublistOpen.value[key] = !sublistOpen.value[key];
      }
    };

    const navigateOrToggle = (item) => {
      if (item.route) {
        router.push(item.route).then(() => {
          if (!isSidebarCollapsed.value) {
            isSidebarCollapsed.value = true;
          }
        });
      } else if (item.items) {
        toggleSublist(item.key);
      }
    };

    const handleMenuClick = (item) => {
      if (isSidebarCollapsed.value) {
        isSidebarCollapsed.value = false;
      }
      navigateOrToggle(item);
    };

    const handleSidebarMouseEnter = () => {
      isSidebarHovered.value = true;
      if (!isSidebarFixed.value) {
        isSidebarCollapsed.value = false;
      }
    };

    const handleSidebarMouseLeave = () => {
      isSidebarHovered.value = false;
      if (!isSidebarFixed.value) {
        isSidebarCollapsed.value = true;
      }
    };
    const toggle = (event) => {
      menu.value.toggle(event);
    };

    return {
      authStore,
      menu,
      toggle,
      sublistOpen,
      menuItems,
      profileItems,
      isSidebarCollapsed,
      isSidebarHovered,
      isSidebarFixed,
      toggleSidebar,
      toggleSublist,
      navigateOrToggle,
      handleMenuClick,
      handleSidebarMouseEnter,
      handleSidebarMouseLeave,
      primerNombre,
    };
  },
};
</script>
<style scoped>
/* Estilo para la barra lateral desplegada al pasar el cursor */
nav {
  transition: width 0.3s ease;
}

/* Estilo cuando la barra lateral está contraída */
.collapsed-sidebar nav {
  width: 4rem; /* Ajusta el ancho contraído */
  background-color: #4a4a4a00; /* Color de fondo cuando está contraído */
}

.collapsed-sidebar nav ul > li div i.mr-2 {
  margin-right: 0 !important;
}

nav ul li div {
  display: flex;
  align-items: center;
}

nav ul li span {
  display: block;
  transition: opacity 0.3s ease;
}

nav:hover ul li span {
  opacity: 1;
}

.collapsed-sidebar nav:hover ul li span {
  opacity: 0; /* Oculta los textos cuando la barra está contraída */
}

/* Ocultar las sublistas cuando la barra lateral está contraída */
.collapsed-sidebar nav ul ul {
  display: none;
}
.custom-gradient {
  background: linear-gradient(
    to top,
    /*
    rgba(99, 64, 204, 0.682),
    rgba(214, 138, 255, 0.538)*/
      rgba(77, 41, 165, 0.682),
    rgba(210, 88, 255, 0.538)
  );
}
.custom-gradient2 {
  background: linear-gradient(
    to bottom,
    rgba(77, 41, 165, 0.682),
    rgba(210, 88, 255, 0.538)
  );
}
</style>
