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
                severity="help"
                icon="pi pi-pencil"
                raised
                outlined
                rounded
              >
              </Button>
              <Button
                @click="eliminarLeccion(leccion.idLeccion)"
                severity="help"
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
  <p v-else>No hay lecciones disponibles.</p>
</template>

<script>
import { ref, onMounted } from "vue";
import api from "@/axiosConfig.js";

export default {
  props: {
    idModulo: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const lecciones = ref([]);
    const leccionActivo = ref(null); // Solo un módulo activo a la vez
    const visible = ref(false); // Estado del dialog
    const leccionSeleccionado = ref({}); // Datos del módulo seleccionado

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
      leccionSeleccionado,
    };
  },
};
</script>

<style scoped>
/* Agrega estilos específicos si es necesario */
</style>
