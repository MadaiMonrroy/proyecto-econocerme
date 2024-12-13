<template>
  <div class="p-4">
    <Breadcrumb :home="home" :model="items" class="card h-14">
      <template #item="{ item, props }">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
        >
          <a :href="href" v-bind="props.action" @click="navigate">
            <span :class="[item.icon, 'text-color']" />
            <span class="text-primary font-semibold">{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else :href="item.url" :target="item.target" v-bind="props.action">
          <span class="text-surface-700 dark:text-surface-0">{{
            item.label
          }}</span>
        </a>
      </template>
    </Breadcrumb>
    <card class="mb-4">
      <template #content>
        <!-- Botón de "Volver" -->
        <button @click="volverAModulos" label="Volver">
          <i class="pi pi-arrow-left mr-2 pb-6"></i>
          Volver
        </button>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img :src="modulo.imagen" alt="Logo" class="w-28 h-28" />
            <h1 class="pl-8 w-3/6  text-2xl font-bold"><strong>Modulo:</strong> {{ modulo.nombre }}</h1>
            <Divider layout="vertical" class="h-28" />
            <!-- Descripción del curso -->
            <p v-html="modulo.descripcion" class="m-4"></p>
          </div>
        </div>

        <!-- Sección inferior con especialidad, precio y duración alineados abajo 
        <div class="mt-4 flex items-center justify-between">
          <Message severity="secondary" rounded>{{
            curso.especialidad
          }}</Message>
          <div class="flex space-x-4">
            <Message severity="success" rounded
              >Precio: {{ curso.precio }}</Message
            >
            <Message severity="info" rounded
              >Duración: {{ curso.duracion }}</Message
            >
          </div>
        </div>-->
      </template>
    </card>

    <card>
      <template #content>
        <div class="flex mb-2 gap-2 justify-end">
          <Button
            @click="value = '0'"
            rounded
            label="1"
            class="w-8 h-8 p-0 dark:text-surface-0"
            :outlined="value !== '0'"
          />
          <Button
            @click="value = '1'"
            rounded
            label="2"
            class="w-8 h-8 p-0 dark:text-surface-0"
            :outlined="value !== '1'"
          />
        </div>
        <Tabs v-model:value="value">
          <TabList>
            <Tab value="0">Lista de Lecciones</Tab>
            <Tab value="1">Agregar Leccion</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <listaLecciones ref="listaLeccionesRef" :idModulo="idModulo" />
            </TabPanel>
            <TabPanel value="1">
              <formLeccion :idModulo="idModulo" 
              @leccionGuardado="actualizarLecciones"
                @cambiarTab="redirigirTab" 
                />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <!-- <button
            @click="pruebavista()"
            class="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            prueba
          </button>-->
      </template>
    </card>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";
import listaLecciones from "@/views/adm.cursos/listaLecciones.vue";
import formLeccion from "@/views/adm.cursos/formLeccion.vue";

export default {
  components: {
    listaLecciones,
    formLeccion,
  },
  setup() {
    const authStore = useAuthStore();
    const route = useRoute();
    const router = useRouter();
    const value = ref("0");
    const listaLeccionesRef = ref(null);

    const modulo = ref({});
    const modulos = ref([]);
    const mostrarModal = ref(false);
    const moduloSeleccionado = ref(null);
    const idModulo = route.params.idModulo;
    const cursoId = route.query.cursoId;
    const home = ref({
      icon: "pi pi-home",
      route: "/panelControl/main",
    });
    const items = ref([
      { label: "Cursos", icon: "pi pi-book", route: "/panelControl/cursos" },
      {
        label: "modulos",
        icon: "pi pi-folder-open",
        route: `/panelControl/modulos/${cursoId}`,
      },
      {
        label: "lecciones",
        icon: "pi pi-folder-open",
        route: `/panelControl/lecciones/${idModulo}`,
      },
    ]);
    const moduloForm = ref({
      nombre: "",
      descripcion: "",
      videoURL: "",
      contenidoExtra: "",
    });
    const activeModuloIndex = ref(null);
    const volverAModulos = () => {
      if(authStore.usuario.tipoUsuario === "admin"){
        router.push(`/panelControl/modulos/${cursoId}`);
      }else
    if(authStore.usuario.tipoUsuario === "coach") {
      router.push(`/panelCoaches/modulos/${cursoId}`);
    }
    };
    const redirigirTab = (tabIndex) => {
  value.value = tabIndex.toString(); // Cambiar el valor de la pestaña
};
    const actualizarLecciones = () => {
      if (
        listaLeccionesRef.value &&
        typeof listaLeccionesRef.value.obtenerLecciones === "function"
      ) {
        listaLeccionesRef.value.obtenerLecciones();
      } else {
        console.error("obtenerLecciones no es una función en listaLeccionesRef");
      }
    };
    const cargarModulo = async () => {
      try {
        const response = await api.get(`/modulos/obtenerModulo/${idModulo}`);
        Object.assign(modulo, response.data);
        if (idModulo) {
          modulo.value = {
            id: idModulo,
            idCurso: response.data.idCurso,
            nombre: response.data.nombre,
            descripcion: response.data.descripcion,
            videoIntroURL: response.data.videoIntroURL,
            imagen: response.data.imagen,
            estado: response.data.estado,
            fechaCreacion: response.data.fechaCreacion,
            fechaActualizacion: response.data.fechaActualizacion,
          };
        }
      } catch (error) {
        console.error(error);
      }
    };
    const pruebavista = () => {
      
      router.push(`/panelControl/leccion`);
    };
    const obtenerModulos = async () => {
      if (cursoId) {
        try {
          const response = await api.get(`/modulos/modulo/${cursoId}`);
          modulos.value = response.data;
        } catch (error) {
          console.error("Error al obtener los módulos:", error);
        }
      }
    };

    onMounted(() => {
      cargarModulo();
      obtenerModulos();
    });

    return {
      modulo,
      modulos,
      moduloSeleccionado,
      cursoId,
      idModulo,
      moduloForm,
      pruebavista,
      value,
      home,
      items,
      actualizarLecciones,
      listaLeccionesRef,
      redirigirTab,
      volverAModulos,
    };
  },
};
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
