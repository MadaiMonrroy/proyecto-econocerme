<template>
    <!-- Componente Accordion para el listado de módulos -->
    <div class="card" v-if="modulos.length > 0">
      <Accordion>
        <AccordionPanel
          v-for="(modulo, index) in modulos"
          :key="modulo.idModulo"
          :value="index.toString()"
        >
          <AccordionHeader
            @click="toggleModulo(index)"
            class="font-extrabold"
          >
            {{ modulo.nombre }}
          </AccordionHeader>
          <AccordionContent v-if="isActive(index)">
            <div class="relative">
              <div class="absolute top-0 right-0 space-x-2">
                <Button @click="abrirDialog(modulo)" severity="help" icon="pi pi-pencil" raised outlined rounded>
                </Button>
                <Button @click="eliminarModulo(modulo.idModulo)" severity="help" icon="pi pi-trash" raised outlined rounded>
                </Button>
              </div>
              <div class="mt-4">
                <p><strong>Descripción:</strong> {{ modulo.descripcion }}</p>
                <p>
                  <strong>Video URL:</strong>
                  <a :href="modulo.videoURL" target="_blank">Ver Video</a>
                </p>
                <p>
                  <strong>Fecha de Creación:</strong> {{ modulo.fechaCreacion }}
                </p>
                <p>
                  <strong>Última Actualización:</strong> {{ modulo.ultimaActualizacion }}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
  
      <!-- Dialog para editar el módulo -->
      <Dialog v-model:visible="visible" modal header="Editar Módulo" :style="{ width: '30rem' }">
        <div class="flex flex-col">
          <div class="flex items-center gap-4 mb-4">
            <label for="nombre" class="font-semibold w-24">Nombre</label>
            <InputText id="nombre" v-model="moduloSeleccionado.nombre" class="flex-auto" />
          </div>
          <div class="flex items-center gap-4 mb-4">
            <label for="descripcion" class="font-semibold w-24">Descripción</label>
            <InputText id="descripcion" v-model="moduloSeleccionado.descripcion" class="flex-auto" />
          </div>
          
          <!-- Sección para el video -->
          <div class="flex items-center gap-4 mb-4">
            <label for="videoURL" class="font-semibold w-24">Video Actual</label>
            <div class="flex flex-col">
              <video v-if="moduloSeleccionado.videoURL" controls class="w-full">
                <source :src="moduloSeleccionado.videoURL" type="video/mp4" />
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
            <InputText id="estado" v-model="moduloSeleccionado.estado" class="flex-auto" />
          </div>
          <div class="flex items-center gap-4 mb-4">
            <label for="fechaCreacion" class="font-semibold w-24">Fecha Creación</label>
            <InputText id="fechaCreacion" v-model="moduloSeleccionado.fechaCreacion" class="flex-auto" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" label="Cancelar" severity="secondary" @click="cerrarDialog"></Button>
          <Button type="button" label="Guardar" @click="guardarCambios"></Button>
        </div>
      </Dialog>
    </div>
    <!-- Mensaje cuando no hay módulos -->
    <p v-else>No hay módulos disponibles.</p>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import api from "@/axiosConfig.js";
  
  
  export default {
    props: {
      cursoId: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const modulos = ref([]);
      const moduloActivo = ref(null); // Solo un módulo activo a la vez
      const visible = ref(false); // Estado del dialog
      const moduloSeleccionado = ref({}); // Datos del módulo seleccionado
  
      // Función para obtener los módulos del curso
      const obtenerModulos = async () => {
        if (props.cursoId) {
          try {
            const response = await api.get(`/modulos/modulo/${props.cursoId}`);
            modulos.value = response.data;
          } catch (error) {
            console.error("Error al obtener los módulos:", error);
          }
        }
      };
  
      // Función para alternar el estado de un módulo (expandir/colapsar)
      const toggleModulo = (index) => {
        if (moduloActivo.value === index) {
          moduloActivo.value = null; // Colapsar
        } else {
          moduloActivo.value = index; // Expandir el nuevo
        }
      };
  
      // Verifica si el módulo está activo (expandido)
      const isActive = (index) => {
        return moduloActivo.value === index;
      };
  
      // Función para abrir el dialog y cargar los datos del módulo
      const abrirDialog = (modulo) => {
        moduloSeleccionado.value = { ...modulo }; // Cargar datos en el módulo seleccionado
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
          // await api.put(`/modulos/modulo/${moduloSeleccionado.value.idModulo}`, moduloSeleccionado.value);
          console.log("Cambios guardados:", moduloSeleccionado.value);
          cerrarDialog(); // Cerrar el dialog después de guardar
        } catch (error) {
          console.error("Error al guardar los cambios:", error);
        }
      };
  
      // Cargar los módulos cuando se monta el componente
      onMounted(() => {
        obtenerModulos();
      });
  
      return {
        modulos,
        isActive,
        toggleModulo,
        visible,
        abrirDialog,
        cerrarDialog,
        guardarCambios,
        moduloSeleccionado,
      };
    },
  };
  </script>
  
  <style scoped>
  /* Agrega estilos específicos si es necesario */
  </style>
  