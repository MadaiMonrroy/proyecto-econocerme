<template>
  <div class="p-4">
    <h2 class="text-2xl mb-4">Cursos</h2>
    <Button class="bg-green-500 text-white mb-4" @click="openAddView" severity="success">Agregar Curso</Button>
    <DataTable :value="cursosConNumeracion" :rows="5" :paginator="true" :rowsPerPageOptions="[5, 10, 25]" class="p-datatable-striped">
      <Column field="index" header="#" class="px-6 py-4" />
      <Column field="titulo" header="Título" class="px-6 py-4" />
      <Column header="Miniatura" class="px-6 py-4">
        <template #body="slotProps">
          <img v-if="slotProps.data.miniatura" :src="slotProps.data.miniatura" alt="Miniatura" class="h-16 w-16 object-cover rounded">
        </template>
      </Column>
      <Column field="especialidad" header="Especialidad" class="px-6 py-4" />
      <Column field="descripcion" header="Descripción" class="px-6 py-4" />
      <Column field="duracion" header="Duración" class="px-6 py-4" />
      <Column field="precio" header="Precio" class="px-6 py-4" />
      <Column header="Acciones" class="px-6 py-4">
        <template #body="slotProps">
          <div class="flex items-center space-x-2">
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-info" @click="openEditView(slotProps.data)" />
            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="eliminarCurso(slotProps.data.idCurso)" />
            <Button icon="pi pi-plus-circle" class="p-button-rounded p-button-success" @click="openModulosView(slotProps.data.idCurso)" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>





<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const cursos = ref([]);
const router = useRouter();

const openAddView = () => {
  router.push('/panelControl/formCurso');  // Ruta para agregar curso
};

const openEditView = (curso) => {
  router.push(`/panelControl/formCurso/${curso.idCurso}`);  // Ruta para editar curso
};

const eliminarCurso = async (idCurso) => {
  try {
    await axios.delete(`http://localhost:3000/api/cursos/eliminarCurso/${idCurso}`);
    cursos.value = cursos.value.filter(curso => curso.idCurso !== idCurso);
  } catch (error) {
    console.error(error);
    // Manejar el error de forma adecuada
  }
};

const openModulosView = (curso) => {
  router.push(`/panelControl/modulos/${curso.idCurso}`);
};

const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/cursos/curso', {
  headers: {
    Authorization: `Bearer ${token}`
  }
} );
    cursos.value = response.data;  // Aquí se espera que `response.data` sea el array de cursos
  } catch (error) {
    console.error(error);
    // Manejar el error de forma adecuada
  }
};

onMounted(fetchData);

const cursosConNumeracion = computed(() => {
  return cursos.value.map((curso, index) => ({
    ...curso,
    index: index + 1
  }));
});
</script>
