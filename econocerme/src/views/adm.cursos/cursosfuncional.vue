<template>
    <div class="p-4">
      <div class=" ">
        <Breadcrumb :home="home" :model="items" class="card h-14 dark:shadow-violet-800">
        <template #item="{ item, props }">
                  <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                      <a :href="href" v-bind="props.action" @click="navigate">
                          <span :class="[item.icon, 'text-color']" />
                          <span class="text-black dark:text-white font-semibold">{{ item.label }}</span>
                      </a>
                  </router-link>
                  <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                      <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
                  </a>
              </template>
        </Breadcrumb>
      </div>
      <div  class="card shadow-2xl dark:shadow-violet-600">
        <h2 class="text-4xl mb-4 items-end text-shadow-3xl  font-sans  ">CURSOS</h2>
        <Divider />
  
        <!-- Contenedor para alinear el botón y el buscador en la misma línea -->
        <div class="flex justify-between items-center mb-4">
          <!-- Buscador alineado a la izquierda -->
          <div class="flex flex-1 max-w-md">
            <IconField class="flex flex-1">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="globalFilter"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Buscar cursos"
              />
            </IconField>
          </div>
          <!-- Botón agregar alineado a la derecha -->
          <div class="flex-none">
            <Button
              class="bg-green-500 text-white p-button-rounded p-button-success flex items-center"
              @click="openAddView"
            >
              <i class="pi pi-plus-circle mr-2"></i>
              Agregar Curso
            </Button>
          </div>
        </div>
        <Divider />
        <Fieldset>
          <template #legend>
            <span class="text-2xl tracking-wide">Lista de Cursos</span>
          </template>
          <DataTable
            :value="cursosConNumeracion"
            :rows="5"
            :paginator="true"
            :rowsPerPageOptions="[5, 10, 25]"
            :globalFilter="globalFilter"
            :globalFilterFields="[
              'titulo',
              'especialidad',
              'descripcion',
              'duracion',
              'estado',
              'precio',
            ]"
            class="p-datatable-striped"
          >
            <template #paginatorstart>
              <Button
                type="button"
                icon="pi pi-refresh"
                text
                @click="reloadPage"
              />
            </template>
            <template #paginatorend>
              <Button
                type="button"
                icon="pi pi-download"
                text
                @click="exportToExcel"
              />
            </template>
            <Column field="index" header="#" sortable class="px-6 py-4" />
            <Column field="titulo" header="Título" sortable class="px-6 py-4" />
            <Column header="Miniatura" class="px-6 py-4">
              <template #body="slotProps">
                <Image
                  v-if="slotProps.data.miniatura"
                  :src="slotProps.data.miniatura"
                  alt="Miniatura"
                  preview
                  class="h-14 w-16 object-cover rounded-full"
                />
              </template>
            </Column>
            <Column
              field="especialidad"
              header="Especialidad"
              sortable
              class="px-6 py-4"
            />
            <Column header="Descripción" class="px-6 py-4">
            <template #body="slotProps">
              <div>
                <p v-if="!expandedCourses[slotProps.data.idCurso]">
                  {{ slotProps.data.descripcion.slice(0, 120) }}...
                  <button
                    @click="toggleExpand(slotProps.data.idCurso)"
                    class="text-blue-500 hover:underline focus:outline-none"
                  >
                    Ver más
                  </button>
                </p>
                <p v-else>
                  {{ slotProps.data.descripcion }}
                  <button
                    @click="toggleExpand(slotProps.data.idCurso)"
                    class="text-blue-500 hover:underline focus:outline-none"
                  >
                    Ver menos
                  </button>
                </p>
              </div>
            </template>
          </Column>
            <Column field="estado" header="Estado" class="px-6 py-4">
            <template #body="rowData">
              <Tag
                v-if="rowData.data.estado === 1"
                value="Activo"
                severity="success"
                class="px-2 py-1"
              />
              <Tag
                v-else-if="rowData.data.estado === 2"
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
            </template>
          </Column>          <Column field="duracion" header="Duración" sortable class="px-6 py-4" />
            <Column field="precio" header="Precio" sortable class="px-6 py-4" />
            <Column header="Acciones" class="px-6 py-4">
              <template #body="slotProps">
                <div class="flex items-center space-x-2 align-middle">
                  <Button
                    icon="pi pi-pencil"
                    rounded
                     raised
                    severity="info"
                    @click="openEditView(slotProps.data)"
                    v-tooltip.left="{ value: 'Editar', showDelay: 0, hideDelay: 100 }"
                  />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                     raised
                    @click="eliminarCurso(slotProps.data.idCurso)"
                    v-tooltip.top="{ value: 'Eliminar', showDelay: 0, hideDelay: 100 }"
                  />
                  <Button
                    icon="pi pi-file-check"
                    severity="warn"
                    rounded
                     raised
                    @click="openEvaluacionView(slotProps.data)"
                    v-tooltip.top="{ value: 'Evaluación', showDelay: 0, hideDelay: 100 }"
                  />
                  <Button
                    icon="pi pi-plus-circle"
                    severity="help"
                    rounded
                     raised
                    @click="openModulosView(slotProps.data)"
                    v-tooltip.right="{ value: 'Modulos', showDelay: 0, hideDelay: 100 }"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </Fieldset>
      </div>
      
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
              <Button label="Cancelar" raised severity="primary" outlined @click="rejectCallback"></Button>
            </div>
          </div>
        </template>
      </ConfirmDialog>
      
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import { useToast } from "primevue/usetoast";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/authStore";
  import ExcelJS from "exceljs";
  import { useConfirm } from "primevue/useconfirm";
  
  
  import api from "@/axiosConfig.js";
  const toast = useToast();
  const authStore = useAuthStore();
  const confirm = useConfirm();
  
  const cursos = ref([]);
  const router = useRouter();
  const token = authStore.token;
  const idUsuario = authStore.usuario.id;
  
  
  const isConfirmModalOpen = ref(false);
  let cursoToDelete = ref(null); // Usuario a eliminar
  
  // Agregar una variable para el filtro global
  const globalFilter = ref(""); // Variable para almacenar el valor del buscador global
  
  const home = ref({
      icon: 'pi pi-home',
      route: '/panelControl/main'
  });
  const items = ref([
      { label: 'Cursos', 
        icon: "pi pi-book",
        route: '/panelControl/cursos' }
  ]);
  const openAddView = () => {
    router.push("/panelControl/formCurso"); // Ruta para agregar curso
  };
  
  const openEditView = (curso) => {
    router.push(`/panelControl/formCurso/${curso.idCurso}`); // Ruta para editar curso
    console.log(curso);
  };
  const eliminarCurso = (idCurso) => {
    confirm.require({
      group: "headless",
      message: "¿Estás seguro de que deseas eliminar este curso?",
      header: "Confirmación",
      icon: "pi-exclamation-triangle",
      accept: () => deletecurso(idCurso), // Llama a eliminarAnuncio solo si el usuario acepta
  
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
  
  const deletecurso = async (idCurso) => {
    try {
      await api.delete(`/cursos/eliminarCurso/${idCurso}`, {
        params: { idUsuario }
      });
      cursos.value = cursos.value.filter((curso) => curso.idCurso !== idCurso);
      fetchData();
      toast.add({
        severity: "info",
        summary: "Curso Eliminado",
        detail: "El curso ha sido eliminado con éxito.",
        life: 3000,
      });
      
    } catch (error) {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Hubo un problema al eliminar el usuario.",
        life: 3000,
      });
      // Manejar el error de forma adecuada
    }
  };
  
  const openModulosView = (curso) => {
    router.push(`/panelControl/modulos/${curso.idCurso}`);
  };
  const openEvaluacionView = (curso) => {
    router.push(`/panelControl/evaluacion/${curso.idCurso}`);
  };
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Cursos");
  
    // Agrega encabezados
    worksheet.columns = [
      { header: "Título", key: "titulo", width: 30 },
      { header: "Miniatura", key: "miniatura", width: 30 },
      { header: "Especialidad", key: "especialidad", width: 30 },
      { header: "Descripción", key: "descripcion", width: 40 },
      { header: "Estado", key: "estado", width: 10 },
      { header: "Duración", key: "duracion", width: 10 },
      { header: "Precio", key: "precio", width: 10 },
  
    ];
  
    // Agrega filas
    cursos.value.forEach((curso) => {
      worksheet.addRow(curso);
    });
  
    // Generar y descargar el archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "cursos.xlsx");
  };
  // Función para recargar la página
  const reloadPage = () => {
    fetchData();
  };
  const fetchData = async () => {
    try {
      const response = await api.get("/cursos/curso");
      cursos.value = response.data.reverse();
    } catch (error) {
      console.error(error);
      // Manejar el error de forma adecuada
    }
  };
  const expandedCourses = ref({}); // Para manejar la expansión de las descripciones
  const toggleExpand = (idCurso) => {
    expandedCourses.value[idCurso] = !expandedCourses.value[idCurso];
  };
  onMounted(fetchData);
  
  const cursosConNumeracion = computed(() => {
    // Filtrar cursos basado en globalFilter
    const filter = globalFilter.value.toLowerCase();
    return cursos.value
      .filter((curso) => {
        return (
          curso.titulo.toLowerCase().includes(filter) ||
          curso.especialidad.toLowerCase().includes(filter) ||
          curso.descripcion.toLowerCase().includes(filter) ||
          curso.estado.toString().includes(filter) || // Filtrar por duración
          curso.duracion.toString().includes(filter) || // Filtrar por duración
          curso.precio.toString().includes(filter) // Filtrar por precio
          
        );
        
      })
      
      .map((curso, index) => ({
        ...curso,
        index: index + 1,
        expanded: false // Añadir la propiedad `expanded` por defecto
  
      }));
  });
  </script>
  