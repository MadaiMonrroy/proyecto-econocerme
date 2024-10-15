<template>
  <div class="relative min-h-screen">
    <nav
      :class="[
        'bg-gradient-to-t from-custom-pink to-custom-purple dark:bg-gradient-to-t dark:from-dark-pink dark:to-dark-purple text-black font-semibold pb-4 fixed top-20 left-0 bottom-0 overflow-y-auto transition-all duration-300',
        { 'w-[250px]': !isSidebarCollapsed, 'w-[0px]': isSidebarCollapsed },
      ]"
      :style="{ zIndex: 10 }"
    >
      <div class="p-4">
        <p class="pb-2">MODULOS</p>
        <!-- Select para cargar los nombres de los módulos -->
        <Select
          v-model="selectedMenu"
          :options="menuOptions"
          optionLabel="nombre"
          optionValue="idModulo"
          placeholder="Selecciona un módulo"
          checkmark
          :highlightOnSelect="false"
          class="w-full"
          @change="handleSelectChange"
        >
        </Select>
        <p class="pt-4">LECCIONES</p>

        <ul v-if="lecciones.length > 0" class="mt-4 space-y-2">
          <li
            v-for="leccion in lecciones"
            :key="leccion.idLeccion"
            class="w-full"
          >
            <div
              @click="handleLeccionClick(leccion)"
              :class="[
                'flex items-center cursor-pointer rounded transition-colors duration-300 p-3',
                leccion.idLeccion === selectedLeccion
                  ? 'bg-gradient-to-r from-purple-500 to-purple-900'
                  : 'hover:bg-gradient-to-r from-purple-500 to-purple-900',
              ]"
            >
              <i class="pi pi-youtube mr-3 pt-1" style="font-size: 1.4rem"></i>
              <span class="ml-0" style="font-size: 1.1rem">{{
                leccion.tituloSeccion
              }}</span>
            </div>
          </li>
        </ul>
      </div>
    </nav>

    <button
      @click="toggleSidebar"
      class="absolute top-0 right-0 mt-5 mr-5 text-black hover:text-purple-950 z-20"
      style="
        background-color: rgba(99, 63, 191, 0.39);
        border-radius: 50%;
        padding: 10px;
      "
    >
      <i
        class="pi pi-bars text-[32px]"
        v-if="isSidebarCollapsed"
        style="font-size: 21px"
      ></i>
      <i
        class="pi pi-times text-[32px]"
        v-if="!isSidebarCollapsed"
        style="font-size: 21px"
      ></i>
    </button>

    <main
      :class="{
        'flex-1 p-5': true,
        'ml-[0px]': isSidebarCollapsed,
        'ml-[250px]': !isSidebarCollapsed,
      }"
      class="relative"
    >
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import Select from "primevue/select";
import api from "@/axiosConfig.js";

export default {
  name: "SidebarOnlyView",
  components: {
    Select,
  },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const route = useRoute();
    const selectedLeccion = ref(null);
    const idCurso = route.params.id;

    const selectedMenu = ref(null);
    const isSidebarCollapsed = ref(false);
    const lecciones = ref([]);
    const menuOptions = ref([]);

    onMounted(async () => {
      authStore.loadUser();
      if (!authStore.isAuthenticated) {
        router.push("/");
      }

      if (idCurso) {
        await cargarModulos(idCurso);
      }

      window.addEventListener("popstate", handlePopState);
    });

    const cargarModulos = async (idCurso) => {
      const idUsuario = authStore.usuario.id;
      try {
        const response = await api.get(`/modulos/listaModulosHabilitados/${idCurso}`, {
      params: { idUsuario } // Incluye idUsuario como un parámetro de consulta
    });
        
        menuOptions.value = response.data;

        if (menuOptions.value.length > 0) {
          selectedMenu.value = menuOptions.value[0].idModulo;
          await cargarLecciones(selectedMenu.value);
        }
      } catch (error) {
        console.error(
          "Error al cargar los módulos:",
          error.response ? error.response.data : error.message
        );
      }
    };

    const cargarLecciones = async (idModulo) => {
      try {
        const response = await api.get(`/lecciones/leccion/${idModulo}`);
        lecciones.value = [
          { idLeccion: "introduccion", tituloSeccion: "Introducción" },
          ...response.data,
        ];

        // Si la lección de introducción está disponible, selecciónala
        if (
          lecciones.value.some(
            (leccion) => leccion.idLeccion === "introduccion"
          )
        ) {
          selectedLeccion.value = "introduccion";
          router.replace(
            `/panelEstudiante/panelCurso/${idCurso}/modulo/${idModulo}`
          );
        } else {
          selectedLeccion.value = null;
        }
      } catch (error) {
        console.error(
          "Error al cargar las lecciones:",
          error.response ? error.response.data : error.message
        );
      }
    };

    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
    };

    const handleSelectChange = async (event) => {
      const selectedModuloId = event.value;
      
      if (selectedModuloId) {
        await cargarLecciones(selectedModuloId);
        // Verifica si la lección "Introducción" está presente
        if (
          lecciones.value.some(
            (leccion) => leccion.idLeccion === "introduccion"
          )
        ) {
          selectedLeccion.value = "introduccion";
          router.replace(
            `/panelEstudiante/panelCurso/${idCurso}/modulo/${selectedModuloId}`
          );
        }
      }
    };

    const handleLeccionClick = (leccion) => {
      selectedLeccion.value = leccion.idLeccion;
      // Si la lección es 'Introducción', redirige a la ruta correspondiente
  if (leccion.idLeccion === "introduccion") {
    router.replace(`/panelEstudiante/panelCurso/${idCurso}/modulo/${selectedMenu.value}`);
  } else {
    // Redirige normalmente si es otra lección
    router.push(`/panelEstudiante/panelCurso/${idCurso}/leccion/${leccion.idLeccion}`);
  }
    };

    return {
      authStore,
      menuOptions,
      selectedMenu,
      isSidebarCollapsed,
      toggleSidebar,
      handleSelectChange,
      handleLeccionClick,
      cargarModulos,
      lecciones,
      selectedLeccion,
    };
  },
};
</script>

<style scoped>
nav {
  transition: width 0.3s ease;
}
nav ul > li div i.mr-2 {
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
.custom-gradient2 {
  background: linear-gradient(
    to bottom,
    rgba(77, 41, 165, 0.682),
    rgba(210, 88, 255, 0.538)
  );
}
</style>
