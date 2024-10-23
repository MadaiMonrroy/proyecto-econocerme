<template>
    <div class="bg-white p-4 rounded-lg ">

      <div class="relative flex items-center mb-6 ml-4">
      <!-- Logo a la izquierda -->
      <div class="w-72 h-48">
        <img src="@/assets/logoec.png" alt="Logo" class="w-full h-auto" />
        <p class="text-center">Av.Avaroa y C. Max Bascope #1618</p>
        <p class="text-center">Celular: 71757910</p>
      </div>
      <!-- Rótulo centrado -->
      <div class="absolute left-1/2 transform -translate-x-1/2  translate-y-16 text-center">
        <!-- Título del recibo -->
        <h1 class="text-2xl  text-center text-gray-700 -mb-5">REPORTE INSCRIPCION POR CURSO</h1>

        
      </div>
    </div>
   
    <div class="p-4 m-1 w-full h-full grid grid-cols-1 md:grid-cols-3 gap-2 -mt-8">
        
      <!-- Selectores -->
      <div class="dark:shadow-2xl md:col-span-1 dark:shadow-violet-950 rounded-2xl shadow-2xl">
        <Card class="md:col-span-3 w-full h-full p-2 !bg-white">
          <template #title> <i class="pi pi-filter mr-2"></i>Filtros </template>
          <template #content>
            <h3 class="text-lg font-semibold mb-1">Filtro por rango de Fechas</h3>
            <DatePicker
              v-model="dateRange"
              selectionMode="range"
              class="mb-2 w-full !bg-white"
              :manualInput="false"
              placeholder="Seleccione un rango de fechas"
            />
            <h3 class="text-lg font-semibold mb-1">Filtro por curso</h3>
            <MultiSelect
              v-model="selectedCourses"
              display="chip"
              :options="courses"
              optionLabel="titulo"
              filter
              placeholder="Seleccione cursos"
              :maxSelectedLabels="50"
              emptyFilterMessage="No se encontraron cursos."
              class="w-full !bg-transparent"
            >
              <template #option="slotProps">
                <div class="flex items-center">
                  <img
                    :alt="slotProps.option.titulo"
                    :src="slotProps.option.miniatura"
                    class="mr-1"
                    style="width: 30px; height: 30px; object-fit: cover"
                  />
                  <div class="text-sm">{{ slotProps.option.titulo }}</div>
                </div>
              </template>
              <template #footer>
                <div class="py-1 px-2">
                  <b>{{ selectedCourses.length }}</b> curso(s) seleccionado(s).
                </div>
              </template>
            </MultiSelect>
          </template>
        </Card>
      </div>
  
      <!-- Gráfico -->
      <div class="md:col-span-2 dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl">
        <Card class="md:col-span-3 p-2 !bg-white">
          <template #title>
            <i class="pi pi-chart-bar mr-2"></i>Inscripciones por Curso
          </template>
          <template #content>
            <h3 class="text-lg font-semibold mb-1">Distribución visual</h3>
            <Chart
              ref="chartRef"
              type="bar"
              :data="chartData"
              :options="chartOptions"
              class="w-full h-48"
            />
          </template>
        </Card>
      </div>
  
      <!-- Indicadores -->
      <div class="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl">
          <Card class="p-2 !bg-white">
            <template #title>
              <i class="pi pi-users mr-2"></i>Total Inscripciones
            </template>
            <template #content>
              <h4 class="text-md font-semibold">Número acumulado</h4>
              <p class="text-2xl">{{ totalInscriptions }}</p>
            </template>
          </Card>
        </div>
        <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl">
          <Card class="p-2 !bg-white">
            <template #title>
              <i class="pi pi-calendar mr-2"></i>Último Mes
            </template>
            <template #content>
              <h4 class="text-md font-semibold">Nuevas inscripciones</h4>
              <p class="text-2xl">{{ lastMonthInscriptions }}</p>
            </template>
          </Card>
        </div>
        <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl">
          <Card class="p-2 !bg-white">
            <template #title>
              <i class="pi pi-chart-line mr-2"></i>Crecimiento (%)
            </template>
            <template #content>
              <h4 class="text-md font-semibold">Cambio mensual</h4>
              <p class="text-2xl">{{ growthPercentage }}%</p>
            </template>
          </Card>
        </div>
      </div>
  
      <!-- Tabla Detallada -->
      <div class="md:col-span-3 rounded-2xl shadow-2xl">
        <Card class="p-2 !bg-white">
          <template #title>
            <i class="pi pi-info-circle mr-2 mb-4"></i>Detalles Inscripciones por Curso
          </template>
          <template #content>
            <DataTable :value="detailedInscriptions" stripedRows  class="w-full text-sm">
              <Column field="index" header="#" class="px-2 py-2" :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }"
              />
              <Column field="titulo" header="Curso" :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }" />
              <Column field="totalInscripciones" header="Inscripciones" :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }"/>
              <Column field="ingresoTotal" header="Ingreso Total" :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }"/>
              <Column field="nombreCompleto" header="Coach" :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }" />
              <Column field="promedioNotaFinal" header="Promedio de Evaluaciones" :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }"/>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>
</div>
  </template>
  

<script setup>
import { ref, onMounted, watch } from "vue";
import api from "@/axiosConfig.js";
import { useRoute } from "vue-router";
const route = useRoute();

// Variables reactivas
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "Inscripciones",
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    },
  ],
});
const chartOptions = ref(null);
const selectedCourses = ref([]);
const totalInscriptions = ref(0);
const lastMonthInscriptions = ref(0);
const growthPercentage = ref(0);
const detailedInscriptions = ref([]);
const chartRef = ref(null);

// Definición de variables reactivas

const dateRange = ref([]);

const courses = ref([]); // Inicialmente vacío para cargar desde el backend

// Función para obtener cursos del backend
const fetchCourses = async () => {
  try {
    const coursesParam = route.query.courses;

    if (coursesParam) {
      selectedCourses.value = coursesParam.split(","); // Supone que courses es una lista separada por comas
    }
    const idsList = selectedCourses.value.map((id) => parseInt(id)); // Convierte a enteros si es necesario
    const response = await api.get(
      "/recibosSinPermiso/listaCursosSeleccionados",
      {
        params: {
          ids: idsList,
        },
      }
    );
    courses.value = response.data; // Asegúrate de que la respuesta tenga la estructura esperada
    console.log(response.data);
    // Autoseleccionar todos los cursos al cargar la vista
    selectedCourses.value = [...courses.value];
    // Autoseleccionar todos los cursos al cargar la vista
    // Autoseleccionar los cursos si hay parámetros en la URL
  } catch (error) {
    console.error("Error al cargar los cursos:", error);
  }
};
// Función para limpiar los campos automáticamente
const resetFields = () => {
  totalInscriptions.value = 0;
  lastMonthInscriptions.value = 0;
  growthPercentage.value = 0;
  detailedInscriptions.value = [];
  chartData.value.labels = [];
  chartData.value.datasets[0].data = [];
  chartData.value.datasets[0].backgroundColor = [];
  chartData.value.datasets[0].borderColor = [];
};

// Función para actualizar los datos al backend
const fetchUpdatedData = async () => {
  try {
    // Verificar si dateRange y selectedCourses tienen datos válidos antes de realizar la consulta
    if (
      !dateRange.value ||
      !dateRange.value[0] ||
      !dateRange.value[1] ||
      selectedCourses.value.length === 0
    ) {
      console.log("Faltan datos en los filtros, esperando que se completen...");
      resetFields(); // Limpiar los campos automáticamente

      return; // Salir de la función si no hay datos completos
    }
    // Ajustar la fecha de inicio y fin para incluir todo el día seleccionado
    const startDate = dateRange.value[0];
    const endDate = dateRange.value[1];
    endDate.setHours(23, 59, 59, 999);

    // Formatear las fechas a cadenas ISO
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();
    const params = new URLSearchParams({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      courses: selectedCourses.value, // Enviar los IDs como una cadena
    });
    console.log("sdfsdf", courses);
    // Realiza la llamada a tu backend
    const response = await api.get(
      `/recibosSinPermiso/detalleInscripcionCurso?${params}`
    );
    console.log(response.data);
    // Asigna los nuevos datos a las variables reactivas
    totalInscriptions.value = response.data.totalInscriptions;
    lastMonthInscriptions.value = response.data.lastMonthInscriptions;
    growthPercentage.value = response.data.growthPercentage;
    // Redondear el promedio de las evaluaciones a dos decimales
    detailedInscriptions.value = response.data.detailedInscriptions.map(
      (item, index) => ({
        index: index + 1, // Empieza el índice desde 1
        ...item,
        promedioNotaFinal: item.promedioNotaFinal
          ? parseFloat(item.promedioNotaFinal).toFixed(2)
          : "N/A",
      })
    );

    // Asignar los datos y etiquetas obtenidos del backend a chartData
    chartData.value.labels = response.data.chartOptions.map(label => label.length > 10 ? label.substring(0, 10) + '...' : label);
    chartData.value.datasets[0].data = response.data.chartData;

    // Colores para las barras del gráfico
    const colors = response.data.chartData.map(() => {
      const color = randomColor();
      return {
        backgroundColor: `${color}33`,
        borderColor: color,
      };
    });

    chartData.value.datasets[0].backgroundColor = colors.map(
      (color) => color.backgroundColor
    );
    chartData.value.datasets[0].borderColor = colors.map(
      (color) => color.borderColor
    );
    // Actualizar la instancia del gráfico si existe
    if (chartRef.value?.chart) {
      chartRef.value.chart.update();
    }
  } catch (error) {
    console.error("Error al actualizar los datos:", error);
  }
};

// Watchers para observar cambios en el Calendar y el MultiSelect
watch([dateRange, selectedCourses], (newValues, oldValues) => {
  fetchUpdatedData();
});
const randomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
// Función para establecer datos del gráfico
const setChartData = () => {
  const randomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = randomColor();
      colors.push({
        backgroundColor: `${color}33`, // Color con opacidad (20%)
        borderColor: color, // Mismo color sin opacidad
      });
    }
    return colors;
  };

  const colorSet = generateColors(courses.length); // Generar colores una sola vez
  return {
    labels: chartOptions.value,
    datasets: [
      {
        label: "Inscripciones",
        data: chartData.value, // Reemplaza con tus datos reales
        backgroundColor: colorSet.map((color) => color.backgroundColor),
        borderColor: colorSet.map((color) => color.borderColor),
        borderWidth: 1, // Ancho del borde
      },
    ],
  };
};

// Función para establecer opciones del gráfico
const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--p-text-color");
  const textColorSecondary = documentStyle.getPropertyValue(
    "--p-text-muted-color"
  );
  const surfaceBorder = documentStyle.getPropertyValue(
    "--p-content-border-color"
  );

  return {
    responsive: true,
    maintainAspectRatio: false, // Asegúrate de que el gráfico llene el contenedor

    plugins: {
      legend: {
        display: true,
        labels: {},
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColorSecondary,
          stepSize: 1, // Establece el tamaño del paso a 1 para que solo muestre enteros
        },
        grid: {
          color: surfaceBorder,
        },
      },
    },
  };
};

// Montar el componente y establecer los datos del gráfico
onMounted(() => {
  fetchCourses();

  // Acceder a los parámetros de la URL
  const startDate = route.query.startDate;
  const endDate = route.query.endDate;
  // Convertir los parámetros a formatos útiles
  if (startDate) {
    dateRange.value[0] = new Date(`${startDate}T00:00:00`);
  }
  if (endDate) {
    dateRange.value[1] = new Date(`${endDate}T00:00:00`);
  }

  // Actualizar los datos al cargar
  fetchUpdatedData();
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});
</script>

<style scoped>
/* Estilos personalizados */
</style>
