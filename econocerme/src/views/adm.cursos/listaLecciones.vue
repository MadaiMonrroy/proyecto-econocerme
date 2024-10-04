<template>
  <!-- Componente Accordion para el listado de módulos -->
  <div class="card" v-if="lecciones.length > 0">
    <Accordion>
      <AccordionPanel
        v-for="(leccion, index) in lecciones"
        :key="leccion.idLeccion"
        :value="index.toString()"
      >
        <AccordionHeader @click="toggleLeccion(index)" class="font-extrabold">
          <strong class="uppercase">{{ leccion.tituloSeccion }}</strong>
        </AccordionHeader>
        <AccordionContent v-if="isActive(index)">
          <div class="relative">
            <div class="absolute top-0 right-0 space-x-2">
              <Button
                @click="abrirDialog(leccion)"
                severity="info"
                icon="pi pi-pencil"
                raised
                outlined
                rounded
              >
              </Button>
              <Button
                @click="eliminarLeccion(leccion.idLeccion)"
                severity="danger"
                icon="pi pi-trash"
                raised
                outlined
                rounded
              >
              </Button>
            </div>
            <div class="mt-0 pt-10">
              <p><strong>Descripción:</strong></p>
              <p v-html="leccion.descripcion" class="text-md"></p>
              <p>
                <strong>Video URL:</strong>
                <Button
                  label="Ver Video"
                  @click="visible = true"
                  severity="help"
                  text
                  link
                />

                <Dialog
                  v-model:visible="visible"
                  modal
                  :header="leccion.tituloSeccion"
                  :style="{ width: '50rem' }"
                  :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
                  class="uppercase"
                >
                  <div class="flex justify-center">
                    <video
                      controls
                      class="w-[770px] h-[375px] object-contain rounded-md shadow-lg"
                      controlsList="nodownload"
                      poster="/src/assets/fondo.jpg"
                      playsinline
                      loop
                    >
                      <source :src="leccion.videoURL" type="video/mp4" />
                      Tu navegador no soporta la visualización de videos.
                    </video>
                  </div>
                </Dialog>
              </p>
              <p>
                <strong>Fecha de Creación:</strong>
                {{ new Date(leccion.fechaCreacion).toLocaleDateString() }}
              </p>
              <p>
                <strong>Última Actualización:</strong>
                {{ new Date(leccion.ultimaActualizacion).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <!-- Dialog para editar el módulo -->
    <Dialog modal header="Editar Módulo" :style="{ width: '30rem' }">
      <div class="flex flex-col">
        <div class="flex items-center gap-4 mb-4">
          <label for="nombre" class="font-semibold w-24">Nombre</label>
          <InputText
            id="nombre"
            v-model="leccionSeleccionado.nombre"
            class="flex-auto"
          />
        </div>
        <div class="flex items-center gap-4 mb-4">
          <label for="descripcion" class="font-semibold w-24"
            >Descripción</label
          >
          <InputText
            id="descripcion"
            v-model="leccionSeleccionado.descripcion"
            class="flex-auto"
          />
        </div>

        <!-- Sección para el video -->
        <div class="flex items-center gap-4 mb-4">
          <label for="videoURL" class="font-semibold w-24">Video Actual</label>
          <div class="flex flex-col">
            <video v-if="leccionSeleccionado.videoURL" controls class="w-full">
              <source :src="leccionSeleccionado.videoURL" type="video/mp4" />
              Tu navegador no soporta la etiqueta de video.
            </video>
            <InputFile
              id="videoInput"
              @change="onFileChange"
              accept="video/*"
              label="Cargar Nuevo Video"
              class="mt-2"
            />
          </div>
        </div>

        <div class="flex items-center gap-4 mb-4">
          <label for="estado" class="font-semibold w-24">Estado</label>
          <InputText
            id="estado"
            v-model="leccionSeleccionado.estado"
            class="flex-auto"
          />
        </div>
        <div class="flex items-center gap-4 mb-4">
          <label for="fechaCreacion" class="font-semibold w-24"
            >Fecha Creación</label
          >
          <InputText
            id="fechaCreacion"
            v-model="leccionSeleccionado.fechaCreacion"
            class="flex-auto"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          @click="cerrarDialog"
        ></Button>
        <Button type="button" label="Guardar" @click="guardarCambios"></Button>
      </div>
    </Dialog>
  </div>
  <!-- Mensaje cuando no hay módulos -->
  <Message v-else>No hay lecciones disponibles.</Message>
  <!-- Modal para Confirmar Eliminación -->
  <ConfirmDialog group="headless">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div
        class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded-3xl"
      >
        <div
          class="rounded-full bg-primary text-primary-contrast inline-flex justify-center items-center h-24 w-24 -mt-20"
        >
          <i
            class="pi pi-exclamation-triangle !text-violet-950"
            style="color: dimgray; font-size: 3rem"
          ></i>
        </div>
        <span class="font-bold text-2xl block mb-2 mt-6">{{
          message.header
        }}</span>
        <p class="mb-0">{{ message.message }}</p>
        <div class="flex items-center gap-2 mt-6">
          <Button
            label="Eliminar"
            severity="help"
            raised
            @click="acceptCallback"
          ></Button>
          <Button
            label="Cancelar"
            raised
            severity="primary"
            outlined
            @click="rejectCallback"
          ></Button>
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script>
import { ref, onMounted } from "vue";
import api from "@/axiosConfig.js";
import { useConfirm } from "primevue/useconfirm";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from 'primevue/usetoast';

export default {
  props: {
    idModulo: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const toast = useToast(); // Usar el servicio de Toast

    const lecciones = ref([]);
    const leccionActivo = ref(null); // Solo un módulo activo a la vez
    const visible = ref(false); // Estado del dialog
    const leccionSeleccionado = ref({}); // Datos del módulo seleccionado
    const confirm = useConfirm();
    const authStore = useAuthStore();
    const idUsuario = authStore.usuario.id;

    // Función para obtener los módulos del curso
    const obtenerLecciones = async () => {
      if (props.idModulo) {
        try {
          const response = await api.get(
            `/lecciones/leccion/${props.idModulo}`
          );
          lecciones.value = response.data;
          console.log(lecciones.value);
        } catch (error) {
          console.error("Error al obtener los módulos:", error);
        }
      }
    };

    const deleteLeccion = async (idLeccion) => {
      try {
        await api.delete(`/lecciones/eliminarLeccion/${idLeccion}`, {
          params: { idUsuario },
        });
        lecciones.value = lecciones.value.filter(
          (leccion) => leccion.idLeccion !== idLeccion
        );
        obtenerLecciones();
        toast.add({
          severity: "info",
          summary: "Lección Eliminado",
          detail: "La lección ha sido eliminada con éxito.",
          life: 3000,
        });
      } catch (error) {
        console.error(error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Hubo un problema al eliminar la lección.",
          life: 3000,
        });
        // Manejar el error de forma adecuada
      }
    };
    const eliminarLeccion = (idLeccion) => {
      confirm.require({
        group: "headless",
        message: "¿Estás seguro de que deseas eliminar este curso?",
        header: "Confirmación",
        icon: "pi-exclamation-triangle",
        accept: () => deleteLeccion(idLeccion), // Llama a eliminarAnuncio solo si el usuario acepta

        reject: () => {
          // toast.add({
          //   severity: "warn",
          //   summary: "Cancelled",
          //   detail: "Eliminación cancelada",
          //   life: 3000,
          // });
        },
      });
    };
    // Función para alternar el estado de un módulo (expandir/colapsar)
    const toggleLeccion = (index) => {
      if (leccionActivo.value === index) {
        leccionActivo.value = null; // Colapsar
      } else {
        leccionActivo.value = index; // Expandir el nuevo
      }
    };

    // Verifica si el módulo está activo (expandido)
    const isActive = (index) => {
      return leccionActivo.value === index;
    };

    // Función para abrir el dialog y cargar los datos del módulo
    const abrirDialog = (leccion) => {
      leccionSeleccionado.value = { ...leccion }; // Cargar datos en el módulo seleccionado
      visible.value = true; // Mostrar el dialog
    };

    // Función para cerrar el dialog
    const cerrarDialog = () => {
      visible.value = false; // Ocultar el dialog
    };

    // Función para guardar los cambios (puedes agregar la lógica para actualizar el módulo aquí)
    const guardarCambios = async () => {
      try {
        // Aquí puedes hacer la llamada a la API para actualizar el módulo
        // await api.put(`/lecciones/leccion/${leccionSeleccionado.value.idLeccion}`, leccionSeleccionado.value);
        console.log("Cambios guardados:", leccionSeleccionado.value);
        cerrarDialog(); // Cerrar el dialog después de guardar
      } catch (error) {
        console.error("Error al guardar los cambios:", error);
      }
    };

    // Cargar los módulos cuando se monta el componente
    onMounted(() => {
      obtenerLecciones();
    });

    return {
      lecciones,
      isActive,
      toggleLeccion,
      visible,
      abrirDialog,
      cerrarDialog,
      guardarCambios,
      eliminarLeccion,
      leccionSeleccionado,
    };
  },
};
</script>

<style scoped>
/* Agrega estilos específicos si es necesario */
</style>
