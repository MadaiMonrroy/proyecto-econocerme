<template>
  <div class="p-4">
    <div class="card">
    <h2 class="text-2xl mb-4">Cursos</h2>
    <Button class="bg-green-500 text-white mb-4" @click="openAddView" severity="success">Agregar Curso</Button>
    <DataTable :value="cursosConNumeracion" :rows="5" :paginator="true" :rowsPerPageOptions="[5, 10, 25]" class="p-datatable-striped">
      <template #paginatorstart>
                <Button type="button" icon="pi pi-refresh" text @click="reloadPage" />
            </template>
            <template #paginatorend>
                <Button type="button" icon="pi pi-download" text @click="exportToExcel" />
            </template>
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
            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="eliminarCurso(slotProps.data)" />
            <Button icon="pi pi-plus-circle" class="p-button-rounded p-button-success" @click="openModulosView(slotProps.data)" />
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
import api from '@/axiosConfig.js'

const authStore = useAuthStore();

const cursos = ref([]);
const router = useRouter();
const token = authStore.token;

const openAddView = () => {
  router.push('/panelControl/formCurso');  // Ruta para agregar curso
};

const openEditView = (curso) => {

  router.push(`/panelControl/formCurso/${curso.idCurso}`);  // Ruta para editar curso
  console.log(curso);
};

const eliminarCurso = async (idCurso) => {
  try {
    await api.delete(`/cursos/eliminarCurso/${idCurso}`);
    cursos.value = cursos.value.filter(curso => curso.idCurso !== idCurso);
  } catch (error) {
    console.error(error);
    // Manejar el error de forma adecuada
  }
};

const openModulosView = (curso) => {
  router.push(`/panelControl/modulos/${curso.idCurso}`);
};
const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Anuncios');

  // Agrega encabezados
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Título', key: 'titulo', width: 30 },
    { header: 'Miniatura', key: 'miniatura', width: 30 },
    { header: 'Descripción', key: 'descripcion', width: 50 },
    { header: 'Fecha Inicio', key: 'fecha_inicio', width: 15 },
    { header: 'Fecha Fin', key: 'fecha_fin', width: 15 },
    { header: 'Tipo', key: 'tipo', width: 10 }
  ];

  // Agrega filas
  anuncios.value.forEach((anuncio) => {
    worksheet.addRow(anuncio);
  });

  // Generar y descargar el archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), 'anuncios.xlsx');
};
// Función para recargar la página
const reloadPage = () => {
  fetchData();
};
const fetchData = async () => {
  try {
    const response = await api.get('/cursos/curso' );
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
