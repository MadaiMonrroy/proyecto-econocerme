<template>
    <div class="p-4">
      <Breadcrumb :home="home" :model="items" class="card h-14">
        <template #item="{ item, props }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
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
          <button @click="volverAInscripciones" class="mb-4 px-4 py-2 rounded">
            <i class="pi pi-arrow-left" ></i> Volver a Inscripciones
          </button>
          <div class="flex items-center justify-between">
            <div class="flex justify-center flex-col">

              <div class="flex items-center justify-center">
                <img :src="pago.fotoPerfil" alt="Logo" class="w-28 h-28 rounded-full" />
                <h1 class="ml-4 text-2xl font-bold">{{ pago.nombreCompleto }}</h1>
                <Divider layout="vertical" class="h-28" />
                <p class="m-0">Nro. Cursos: {{ pago.cursos }} <br> Monto Total: {{ pago.montoTotal }}</p>

              </div>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-end">
            <div class="flex space-x-4">
              <Message severity="info" rounded>Estado del Pago:
                <Tag v-if="pago.estado === 2" value="Pendiente" severity="warn" class="px-2 py-1" />
                <Tag v-else-if="pago.estado === 1" value="Completado" severity="success" class="px-2 py-1" />
                <Tag v-else value="Desconocido" severity="warning" class="px-2 py-1" />
              </Message>
            </div>
          </div>
        </template>
      </card>
      <card>
        <template #content>
          <Tabs v-model:value="value">
            <TabList>
              <Tab value="0">Cuotas de la Inscripcion</Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="0">
                <tablaCuotas :pagoId="pagoId" />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </template>
      </card>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useAuthStore } from "@/stores/authStore";
  import api from "@/axiosConfig.js";
  import tablaCuotas from "@/views/adm.inscripciones/tablaCuotas.vue";
  import formCuota from "@/views/adm.inscripciones/formCuota.vue";
  
  export default {
    components: {
      tablaCuotas,
      formCuota,
    },
    setup() {
      const authStore = useAuthStore();
      const route = useRoute();
      const router = useRouter();
      const value = ref("0");
  
      const pago = ref({});
      const cuotas = ref([]);
      const mostrarModal = ref(false);
      const cuotaSeleccionada = ref(null);
      const pagoId = route.params.idInscripcion;
      const home = ref({
        icon: "pi pi-home",
        route: "/panelControl/main",
      });
      const items = ref([
        { label: "Inscripciones", icon: "pi pi-book", route: "/panelControl/inscripciones" },
        {
          label: "cuotas",
          icon: "pi pi-folder-open",
          route: `/panelControl/cuotas/${pagoId}`,
        },
      ]);
      const cuotaForm = ref({
        metodoPago: "",
        fechaVencimiento: "",
        fechaPagoCuota: "",
        idUsuarioModificacion: "",
      });
  
  
      const activeModuloIndex = ref(null);
      const volverAInscripciones = () => {
        router.push(`/panelControl/inscripciones`);
      }
  
      const cargarPago = async () => {
        try {
          const response = await api.get(`/pagos/obtenerPago/${pagoId}`);

          console.log("asi esta llegando", response)
          if (response.data.data && response.data.data.length > 0) {
            const pagoData = response.data.data[0];
            pago.value = {
              id: pagoData.idPago,
              montoTotal: pagoData.montoTotal,
              estado: pagoData.estado,
              fotoPerfil: pagoData.fotoPerfil,
              nombreCompleto: pagoData.nombreCompleto,
              cursos: pagoData.cursos,
              fechaCreacion: pagoData.fechaCreacion,
            };
          } else {
            console.warn("No se encontraron datos de pago.");
          }
        } catch (error) {
          console.error("Error al cargar el pago:", error);
        }
      };
  
  
      const obtenerCuotas = async () => {
        console.log("HOLAAAA CUOTA", pagoId)
        if (pagoId) {
          try {
            const response = await api.get(`/cuotas/cuota/${pagoId}`);
            cuotas.value = response.data;
            console.log(response)
          } catch (error) {
            console.error("Error al obtener los módulos:", error);
          }
        }
      };
  
  
  
      onMounted(() => {
        cargarPago();
        obtenerCuotas();
  
      });
  
      return {
        pago,
        cuotas,
        cuotaSeleccionada,
        pagoId,
        cuotaForm,
        value,
        home,
        items,
        volverAInscripciones
      };
    },
  };
  </script>
  
  <style scoped>
  </style>
  