<template>
  <div class="">
    <!-- Cards Section -->
    <div class="p-4">
      <!-- Cards Section -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl">
          <Card class="h-full">
            <template #title>
              <i class="pi pi-users  mr-2"></i>Estudiantes Activos
            </template>
            <template #content>
              <h2 class="text-2xl font-bold">150</h2>
              <p>Número total de estudiantes.</p>
            </template>
          </Card>
        </div>
        <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl">
          <Card class="h-full">
            <template #title>
              <i class="pi pi-money-bill mr-2"></i>Ingresos del Mes
            </template>
            <template #content>
              <h2 class="text-2xl font-bold">$3,500</h2>
              <p>Ingresos de este mes.</p>
            </template>
          </Card>
        </div>
        <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl">
          <Card class="h-full">
            <template #title> <i class="pi pi-user-plus mr-2"></i>Nuevas Inscripciones</template>
            <template #content>
              <h2 class="text-2xl font-bold">25</h2>
              <p>Inscripciones recientes.</p>
            </template>
          </Card>
        </div>
        <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl">
          <Card class="h-full">
            <template #title> <i class="pi pi-book mr-2"></i>Cursos Activos</template>
            <template #content>
              <h2 class="text-2xl font-bold">25</h2>
              <p>Número de cursos activos.</p>
            </template>
          </Card>
        </div>
        <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl">
          <Card class="h-full">
            <template #title> <i class="pi pi-megaphone mr-2"></i>Anuncios Activos</template>
            <template #content>
              <h2 class="text-2xl font-bold">25</h2>
              <p>Número de anuncios activos.</p>
            </template>
          </Card>
        </div> 
      </div>
    </div>
    <div class="p-4">
      <!-- Grid Container -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        <!-- Card 1: Large Chart Card -->
        <div class="col-span-1 md:col-span-2 dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl ">
          <Card class="h-full">
            <template #title> <i class="pi pi-users mr-2"></i>Card 4 </template>
            <template #content>
              <!-- Contenido del gráfico grande -->
              <h3 class="text-lg font-bold">Chart Overview</h3>
              <div
                class="h-48rounded mt-4 flex items-center justify-center"
              >
                Gráfico Principal
              </div>
            </template>
          </Card>
        </div>

        <!-- Card 2: Small Line Chart Card -->
         <div class="dark:shadow-violet-950 rounded-2xl shadow-2xl">
        <Card class="h-full">
          <template #title> <i class="pi pi-users mr-2"></i>Card 4 </template>
          <template #content>
            <div class="">
              <!-- Contenido del gráfico de línea -->
              <h3 class="text-lg font-bold">Chart polar Area</h3>
              <div
                class="h-auto bg-gray-100 rounded mt-4 flex items-center justify-center"
              ></div>
              <div
                class="h-auto = rounded mt-4 flex items-center justify-center"
              >
                <Chart
                  type="polarArea"
                  :data="chartData"
                  :options="chartOptions"
                  class="w-full md:w-[30rem]"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
      <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl mt-3">

        <Card class="h-full">
          <template #title> <i class="pi pi-users mr-2"></i>Card 4 </template>
          <template #content>
            <!-- Card 3: Statistics Card -->
            <div class="">
              <!-- Contenido de estadísticas -->
              <h3 class="text-lg font-bold">Statistics</h3>
              <p class="mt-4">
                Metric 1: <span class="text-green-500 font-bold">45 ↑</span>
              </p>
              <p>
                Metric 2: <span class="text-red-500 font-bold">19.7k ↓</span>
              </p>
              <p>Metric 3: <span class="text-gray-500 font-bold">1.2%</span></p>
            </div>
          </template>
        </Card>
      </div>
      <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl mt-3">

        <Card class="h-full">
          <template #title> <i class="pi pi-users mr-2"></i>Card 4 </template>
          <template #content>
            <!-- Card 4: Bar Chart Card -->
            <div class="">
              <!-- Contenido del gráfico de barras -->
              <h3 class="text-lg font-bold">Bar Chart</h3>
              <div
                class="h-24  rounded mt-4 flex items-center justify-center"
              >
                Gráfico de Barras
              </div>
            </div>
          </template>
        </Card>
      </div>
      <div class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl mt-3">

        <Card class="h-full">
          <template #title> <i class="pi pi-users mr-2"></i>Card 4 </template>
          <template #content>
            <!-- Card 5: Summary Card -->
            <div class="col-span-1 md:col-span-2 lg:col-span-1">
              <!-- Contenido del resumen -->
              <h3 class="text-lg font-bold">Summary</h3>
              <div class="flex justify-between items-center mt-4">
                <div>
                  <p class="text-2xl font-bold">570</p>
                  <p class="text-green-500">↑ 13%</p>
                </div>
                <div>
                  <p class="text-2xl font-bold">234</p>
                  <p class="text-blue-500">↑ 8%</p>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/axiosConfig.js"; // Asegúrate de que esta importación sea correcta

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "Datos",
      data: [], // Inicialmente vacío, actualizar después
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    },
  ],
});

const chartOptions = ref({});

// Función para generar un color aleatorio
const randomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Función para establecer datos del gráfico
const setChartData = (data) => {
  const colorSet = data.map(() => {
    const color = randomColor();
    return {
      backgroundColor: `${color}33`, // Color con opacidad (20%)
      borderColor: color, // Mismo color sin opacidad
    };
  });

  return {
    labels: data.map((item) => item.label), // Asegúrate de que los datos tengan etiquetas
    datasets: [
      {
        label: "Inscripciones",
        data: data.map((item) => item.value), // Asegúrate de que los datos tengan valores
        backgroundColor: colorSet.map((color) => color.backgroundColor),
        borderColor: colorSet.map((color) => color.borderColor),
        borderWidth: 1,
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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {},
      },
    },
    scales: {
      r: {
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
const fetchCourses = async () => {
  try {
    const response = await api.get("/reportes/resumenGeneralAdmin"); // Asegúrate de que esta URL sea correcta
    console.log(response)

  } catch (error) {
    console.error("Error al cargar los cursos:", error);
  }
};
// Montar el componente y establecer los datos del gráfico
onMounted(async () => {
  fetchCourses();
});
</script>

<style scoped>
/* Estilos personalizados */
</style>
