<template>
    <div
      :class="[
        'flex flex-col min-h-screen',
        { 'collapsed-sidebar': isSidebarCollapsed },
      ]" style="background-color: rgba(124, 58, 237, 0.5)"
    >
      <header
        class="bg-gradient-to-t from-purple-600 to-pink-500 text-black p-3 flex justify-between items-center fixed top-0 left-0 w-full z-20"
      >
        <div class="flex items-center">
          <img src="@/assets/logoec.png" alt="Logo" class="h-10 mx-5" />
          <button
            @click="toggleSidebar"
            class="mr-4 text-black hover:text-purple-800"
          >
            <i class="pi pi-bars text-[32px]" style="font-size: 21px"></i>
          </button>
        </div>
        <div class="flex items-center space-x-4">
          <button class="text-black hover:text-purple-800">
            <i class="pi pi-envelope text-3x1" style="font-size: 21px"></i>
          </button>
          <button class="text-black hover:text-purple-800">
            <i class="pi pi-bell text-xl" style="font-size: 21px"></i>
          </button>
          <Menu :model="profileItems" :popup="true" ref="menu">
            <template #target="{ toggle }">
              <button @click="toggle" class="p-link flex items-center">
                <Avatar icon="pi pi-user" class="mr-2" />
                <i class="pi pi-angle-down"></i>
              </button>
            </template>
          </Menu>
          <button
            class="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded transition-colors duration-300"
          >
            Salir
          </button>
        </div>
      </header>
  
      <div class="flex flex-1 pt-16">
        <nav
          :class="[
            'bg-gradient-to-b from-purple-600 to-pink-500 text-black font-semibold p-4 fixed top-16 bottom-0 overflow-y-auto z-10 transition-all duration-300',
            { 'w-16': isSidebarCollapsed, 'w-[189px]': !isSidebarCollapsed },
          ]"
          @mouseenter="handleSidebarMouseEnter"
          @mouseleave="handleSidebarMouseLeave"
        >
          <div
            v-if="!isSidebarCollapsed"
            class="flex items-center justify-center mb-6"
          >
            <img
              src="@/assets/avatar3.png"
              alt="Avatar"
              class="rounded-full w-24 h-24 object-cover"
            />
          </div>
          <ul class="space-y-2">
            <li v-for="(item, index) in menuItems" :key="index" class="w-full">
              <div
                @click="handleMenuClick(item)"
                class="flex items-center cursor-pointer rounded transition-colors duration-300 hover:bg-purple-400 p-2"
              >
                <i :class="item.icon" class="mr-2"></i>
                <span v-if="!isSidebarCollapsed" class="ml-2">{{
                  item.label
                }}</span>
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
                    class="block p-2 rounded transition-colors duration-300 hover:bg-purple-300"
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
            'ml-44': !isSidebarCollapsed,
          }"
        >
          <router-view></router-view>
        </main>
      </div>
    </div>
  </template>
  <script>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  
  export default {
    name: "PanelControl",
    setup() {
      const router = useRouter();
      const menu = ref();
      const sublistOpen = ref({});
      const isSidebarCollapsed = ref(true);
      const isSidebarHovered = ref(false);
      const isSidebarFixed = ref(false);
  
      const menuItems = ref([
        {
          key: "usuarios",
          label: "Usuarios",
          icon: "pi pi-users",
          items: [
            { label: "Usuarios", route: "/panelControl/coaches" },
            { label: "Estudiantes", route: "/panelControl/usuarias" },
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
          key: "ventas",
          label: "Ventas",
          icon: "pi pi-shopping-cart",
          route: "/panelControl/ventas",
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
            // Acción al hacer clic en Perfil
          },
        },
        {
          label: "Configuración",
          icon: "pi pi-cog",
          command: () => {
            // Acción al hacer clic en Configuración
          },
        },
        {
          label: "Cerrar sesión",
          icon: "pi pi-power-off",
          command: () => {
            // Acción al hacer clic en Cerrar sesión
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
  
      return {
        menu,
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
    background-color: #4a4a4a; /* Color de fondo cuando está contraído */
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
  </style>