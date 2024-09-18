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
        <button @click="volverACursos">
          <i class="pi pi-arrow-left mr-2 pb-6"></i>
          Volver
        </button>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img :src="curso.miniatura" alt="Logo" class="w-28 h-28" />
            <h1 class="ml-4 text-2xl font-bold">{{ curso.titulo }}</h1>
            <Divider layout="vertical" class="h-28" />
            <!-- Descripción del curso -->
            <p class="m-0">{{ curso.descripcion }}</p>
          </div>
        </div>

        <!-- Sección inferior con especialidad, precio y duración alineados abajo -->
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
            <Message severity="secondary" rounded
              >Estado:

              <Tag
                v-if="curso.estado === 1"
                value="Activo"
                severity="success"
                class="px-2 py-1"
              />
              <Tag
                v-else-if="curso.estado === 2"
                value="Inactivo"
                severity="warn"
                class="px-2 py-1"
              />
              <Tag
                v-else
                value="Desconocido"
                severity="warning"
                class="px-2 py-1"
              />
            </Message>
          </div>
        </div>
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
            <Tab value="0">Evaluación</Tab>
            <Tab value="1">Vista Previa</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <formEvaluacion :cursoId="cursoId" />
            </TabPanel>
            <TabPanel value="1">
              <formModulo :cursoId="cursoId" />
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
import formEvaluacion from "@/views/adm.cursos/formEvaluacion.vue";
export default {
  components: {
    formEvaluacion,
  },

  setup() {
    const authStore = useAuthStore();
    const route = useRoute();
    const router = useRouter();
    const value = ref("0");
    const curso = ref({});
    const mostrarModal = ref(false);
    const cursoId = route.params.idCurso;
    const home = ref({
      icon: "pi pi-home",
      route: "/panelControl/main",
    });
    const items = ref([
      { label: "Cursos", icon: "pi pi-book", route: "/panelControl/cursos" },
      {
        label: "Evaluacion",
        icon: "pi pi-file-check",
        route: `/panelControl/evaluacion/${cursoId}`,
      },
    ]);

    const volverACursos = () => {
      router.push(`/panelControl/cursos`);
    };
    const cargarCurso = async () => {
      try {
        const response = await api.get(`/cursos/obtenerCurso/${cursoId}`);
        Object.assign(curso, response.data);
        if (cursoId) {
          curso.value = {
            id: cursoId,
            titulo: response.data.titulo,
            miniatura: response.data.miniatura,
            especialidad: response.data.especialidad,
            descripcion: response.data.descripcion,
            duracion: response.data.duracion,
            precio: response.data.precio,
            estado: response.data.estado,
            fechaCreacion: response.data.fechaCreacion,
          };
          console.log(curso.precio);
        }
      } catch (error) {
        console.error(error);
      }
    };
    const pruebavista = () => {
      router.push(`/panelControl/leccion`);
    };


    onMounted(() => {
      cargarCurso();
    });

    return {
      curso,

      cursoId,
      pruebavista,
      value,
      home,
      items,
      volverACursos,
    };
  },
};
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
