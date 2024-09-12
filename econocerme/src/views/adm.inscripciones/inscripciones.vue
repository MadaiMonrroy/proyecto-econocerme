<template>
    <div class="p-4">
      <div class="card">
        <h2 class="text-2xl mb-4">Inscripciones</h2>
        <Button class="bg-green-500 text-white mb-4" @click="openAddView" severity="success">Registrar Inscripción</Button>
        <DataTable :value="inscripcionesConNumeracion" :rows="5" :paginator="true" :rowsPerPageOptions="[5, 10, 25]" class="p-datatable-striped">
          <Column field="index" header="#" class="px-6 py-4" />
          <!-- /*<Column field="idInscripcion" header="ID Inscripción" class="px-6 py-4" /> -->
          <Column field="nombreCompleto" header="Nombre Completo" class="px-6 py-4" />
          <Column field="fotoPerfil" header="Foto de Perfil" class="px-6 py-4">
            <template #body="slotProps">
              <img 
                :src="slotProps.data.fotoPerfil || defaultProfileImage" 
                alt="Foto de Perfil" 
                class="w-10 h-10 rounded-full"
                @error="handleImageError($event, 'profile')" />
            </template>
          </Column>
          <Column field="observacion" header="Observación" class="px-6 py-4" />
          <Column field="tituloCurso" header="Título del Curso" class="px-6 py-4" />
          <Column field="miniaturaCurso" header="Miniatura del Curso" class="px-6 py-4">
            <template #body="slotProps">
              <img 
                :src="slotProps.data.miniaturaCurso || defaultCourseImage" 
                alt="Miniatura del Curso" 
                class="w-16 h-10 rounded"
                @error="handleImageError($event, 'course')" />
            </template>
          </Column>
          <Column header="Acciones" class="px-6 py-4">
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-info" @click="openEditView(slotProps.data)" />
                <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="eliminarInscripcion(slotProps.data.idInscripcion)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from "@/stores/authStore";
  import api from "@/axiosConfig.js";

  const authStore = useAuthStore();
  const inscripciones = ref([]);
  const router = useRouter();
  const token = authStore.token;
  
  // Imágenes por defecto para errores
  const defaultProfileImage = '@/assets/avatar.png'; // Ruta de la imagen de perfil por defecto
  const defaultCourseImage = '@/assets/avatar.png';   // Ruta de la miniatura del curso por defecto
  
  const openAddView = () => {
    router.push('/panelControl/formInscripcion'); // Ruta para agregar inscripción
  };
  
  const openEditView = (inscripcion) => {
    router.push(`/panelControl/formInscripcion/${inscripcion.idInscripcion}`); // Ruta para editar inscripción
  };
  
  const eliminarInscripcion = async (idInscripcion) => {
    try {
      await api.delete(`/inscripciones/eliminarInscripcion/${idInscripcion}`);
      inscripciones.value = inscripciones.value.filter(inscripcion => inscripcion.idInscripcion !== idInscripcion);
    } catch (error) {
      console.error(error);
      // Manejar el error de forma adecuada
    }
  };
  
  // Manejo de error para cargar imágenes
  const handleImageError = (event, type) => {
    if (type === 'profile') {
      event.target.src = defaultProfileImage;
    } else if (type === 'course') {
      event.target.src = defaultCourseImage;
    }
  };
  
  const fetchData = async () => {
    try {
      const response = await api.get('/inscripciones/inscripcion');
      inscripciones.value = response.data.data;  
    } catch (error) {
      console.error(error);
      // Manejar el error de forma adecuada
    }
  };
  
  onMounted(() => {
    fetchData();
  });
  
  const inscripcionesConNumeracion = computed(() => {
    return inscripciones.value.map((inscripcion, index) => ({
      ...inscripcion,
      index: index + 1
    }));
  });
  </script>
  