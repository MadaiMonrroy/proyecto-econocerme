<template>
  <div class="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
    <!-- Selectores -->
    <div
      class="dark:shadow-2xl md:col-span-2 dark:shadow-violet-950 rounded-2xl shadow-2xl"
    >
      <Card class="md:col-span-2 w-full h-full p-4">
        <template #title> <i class="pi pi-filter mr-2"></i>Filtros </template>
        <template #content>
          <h3 class="text-lg font-semibold mb-2">Filtro por rango de Fechas</h3>
          <DatePicker
            v-model="dateRange"
            selectionMode="range"
            class="mb-4 w-full"
            :manualInput="false"
            :maxDate="new Date()"
            placeholder="Seleccione un rango de fechas"
          />
          <h3 class="text-lg font-semibold mb-2">Filtro por curso</h3>

          <!-- Cambia Select por MultiSelect aquí -->
          <MultiSelect
            v-model="selectedCourses"
            display="chip"
            :options="courses"
            optionLabel="titulo"
            filter
            placeholder="Seleccione cursos"
            :maxSelectedLabels="3"
            emptyFilterMessage="No se encontraron cursos."
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex items-center">
                <img
                  :alt="slotProps.option.titulo"
                  :src="slotProps.option.miniatura"
                  class="mr-2"
                  style="width: 40px; height: 40px; object-fit: cover"
                />
                <div>{{ slotProps.option.titulo }}</div>
              </div>
            </template>
            <template #footer>
              <div class="py-2 px-4">
                <b>{{ selectedCourses.length }}</b> curso(s) seleccionado(s).
              </div>
            </template>
          </MultiSelect>
          <!-- Filtro por Estado de Cuota -->
          <h3 class="text-lg font-semibold mb-2 mt-4">
            Filtro por Estado de Cuota
          </h3>
          <MultiSelect
            v-model="selectedStatus"
            display="chip"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione estado(s)"
            class="w-full"
          />

          <!-- Filtro por Método de Pago -->
          <h3
            v-if="selectedStatus.includes(1)"
            class="text-lg font-semibold mb-2 mt-4"
          >
            Filtro por Método de Pago
          </h3>
          <MultiSelect
            v-if="selectedStatus.includes(1)"
            v-model="selectedPaymentMethod"
            display="chip"
            :options="paymentMethods"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione método(s)"
            class="w-full"
          />
        </template>
      </Card>
    </div>

    <!-- Gráfico -->
    <div
      class="md:col-span-2 dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl h-full w-full"
    >
      <Card class="md:col-span-2 p-4 h-full w-full">
        <template #title>
          <i class="pi pi-wallet mr-2"></i>Cuotas por método de pago
        </template>
        <template #content>
          <h3 class="text-lg font-semibold mb-2">
            Preferencia de métodos de pago
          </h3>
          <div class="flex justify-center items-center">
            <Chart
              type="polarArea"
              :data="polarChartData"
              :options="polarChartOptions"
              class="w-96 h-96 flex justify-center items-center"
            />
          </div>
        </template>
      </Card>
    </div>

    <div
      class="md:col-span-4 dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl"
    >
      <Card class="md:col-span-4 p-4">
        <template #title>
          <i class="pi pi-dollar mr-2"></i>Ingresos por Curso
        </template>
        <template #content>
          <h3 class="text-lg font-semibold mb-2">Ingresos acumulados por curso</h3>
          <Chart
            ref="chartRef"
            type="bar"
            :data="chartData"
            :options="chartOptions"
            class="w-full h-64"
          />
        </template>
      </Card>
    </div>

    <div
      class="md:col-span-4 dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl"
    >
      <Card class="md:col-span-4 p-4">
        <template #title>
          <i class="pi pi-exclamation-triangle mr-2"></i>Montos adeudados por Curso
        </template>
        <template #content>
          <h3 class="text-lg font-semibold mb-2">Comparativa de deuda acumulada por curso</h3>
          <Chart
            ref="chartRef"
            type="bar"
            :data="chartData"
            :options="chartOptions"
            class="w-full h-64"
          />
        </template>
      </Card>
    </div>
    <!-- Indicadores -->

    <div class="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl"
      >
        <Card class="p-4">
          <template #title>
            <i class="pi pi-users mr-2"></i>Ingresos Totales del Período
          </template>
          <template #content>
            <h4 class="text-md font-semibold">Número acumulado</h4>
            <p class="text-2xl">{{ totalInscriptions }}</p>
          </template>
        </Card>
      </div>
      <div
        class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl"
      >
        <Card class="p-4">
          <template #title>
            <i class="pi pi-calendar mr-2"></i>Cuotas Pendientes
          </template>
          <template #content>
            <h4 class="text-md font-semibold">Total en el período</h4>
            <p class="text-2xl">{{ totalInscriptionsThisMonth }}</p>
          </template>
        </Card>
      </div>
      <div
        class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl"
      >
        <Card class="p-4">
          <template #title>
            <i class="pi pi-calendar mr-2"></i>Usuarios: Pagos vs. Pendientes
          </template>
          <template #content>
            <h4 class="text-md font-semibold">Distribución de usuarios</h4>
            <p class="text-2xl">{{ lastMonthInscriptions }}</p>
          </template>
        </Card>
      </div>
      <div
        class="dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl"
      >
      <Card class="p-4">
          <template #title>
            <i class="pi pi-calendar mr-2"></i>Cuotas: Pagadas vs. Pendientes
          </template>
          <template #content>
            <h4 class="text-md font-semibold">Comparativo del período</h4>
            <p class="text-2xl">{{ lastMonthInscriptions }}</p>
          </template>
        </Card>
      </div>
    </div>

    <!-- Tabla Detallada -->
    <div
      class="md:col-span-4 dark:shadow-2xl dark:shadow-violet-950 rounded-2xl shadow-2xl"
    >
      <Card class="p-4">
        <template #title>
          <i class="pi pi-info-circle mr-2 mb-5"></i>Detalles Inscripciones por
          Curso
        </template>
        <template #content>
          <DataTable :value="detailedInscriptions" stripedRows class="w-full">
            <Column
              field="index"
              header="#"
              class="px-6 py-4"
              :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }"
            />

            <Column
              field="titulo"
              header="Curso"
              :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }"
            />
            <Column
              field="totalInscripciones"
              header="Inscripciones"
              :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }"
            />
            <Column
              field="ingresoTotal"
              header="Ingreso Total"
              :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }"
            />
            <Column
              field="nombreCompleto"
              header="Coach"
              :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }"
            />
            <Column
              field="promedioNotaFinal"
              header="Promedio de Evaluaciones"
              :headerStyle="{ backgroundColor: '#2e1065', color: 'white' }"
            />
          </DataTable>
        </template>
      </Card>
    </div>

    <Button label="Generar Reporte" class="items-end" @click="generarReporte" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, watchEffect } from "vue";
import api from "@/axiosConfig.js";

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
// Variables reactivas para los estilos CSS
const textColor = ref("");
const textColorSecondary = ref("");
const surfaceBorder = ref("");

const chartOptions = ref(null);
const selectedCourses = ref([]);
const totalInscriptions = ref(0);
const lastMonthInscriptions = ref(0);
const totalInscriptionsThisMonth = ref(0);

const growthPercentage = ref(0);
const detailedInscriptions = ref([]);
const chartRef = ref(null);

// Definición de variables reactivas

const dateRange = ref(null);
const courses = ref([]); // Inicialmente vacío para cargar desde el backend
const selectedStatus = ref([]);
const selectedPaymentMethod = ref([]);

const statusOptions = [
  { label: "Pagado", value: 1 },
  { label: "Pendiente", value: 2 },
  { label: "Vencido", value: 3 },
];
const paymentMethods = [
  { label: "Tarjeta", value: "tarjeta" },
  { label: "transferencia", value: "transferencia" },
  { label: "Efectivo", value: "efectivo" },
  { label: "QR", value: "qr" },
];

// Función para obtener cursos del backend
const fetchCourses = async () => {
  try {
    const response = await api.get("/recibosSinPermiso/listaCursos"); // Asegúrate de que esta URL sea correcta
    courses.value = response.data; // Asegúrate de que la respuesta tenga la estructura esperada
    // Autoseleccionar todos los cursos al cargar la vista
    selectedCourses.value = courses.value.map((course) => course); // Selecciona todos los cursos
    // Autoseleccionar todos los cursos
  } catch (error) {
    console.error("Error al cargar los cursos:", error);
  }
};
// Función para limpiar los campos automáticamente
const resetFields = () => {
  totalInscriptions.value = 0;
  lastMonthInscriptions.value = 0;
  totalInscriptionsThisMonth.value = 0;
  growthPercentage.value = 0;
  detailedInscriptions.value = [];
  chartData.value.labels = [];
  chartData.value.datasets[0].data = [];
  chartData.value.datasets[0].backgroundColor = [];
  chartData.value.datasets[0].borderColor = [];
};

const polarChartData = ref({
  labels: ["Tarjeta", "Transferencia", "Efectivo", "QR"],
  datasets: [
    {
      data: [25, 15, 35, 20], // Valores de ejemplo que se reemplazarán con datos del backend
      backgroundColor: [
        "rgba(255, 99, 132, 0.3)",
        "rgba(54, 162, 235, 0.3)",
        "rgba(255, 206, 86, 0.3)",
        "rgba(75, 192, 192, 0.3)",
      ],
      borderColor: [
        "rgba(255, 99, 132)",
        "rgba(54, 162, 235)",
        "rgba(255, 206, 86)",
        "rgba(75, 192, 192)",
      ],
      borderWidth: 1,
    },
  ],
});

const polarChartOptions = ref({
  plugins: {
    legend: {
      display: true,
      position: "top",
    },
  },
  scales: {
    r: {
      ticks: {
        backdropColor: "rgba(255, 255, 255, 0.7)", // Fondo de las etiquetas de los ticks
        color: "#666", // Color de las etiquetas de los ticks
      },
      grid: {
        color: surfaceBorder, // Color de la cuadrícula
        borderWidth: 1,
      },
    },
  },
});
// Función para obtener los estilos del documento
const updateDocumentStyles = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  textColor.value = documentStyle.getPropertyValue("--p-text-color").trim();
  textColorSecondary.value = documentStyle
    .getPropertyValue("--p-text-muted-color")
    .trim();
  surfaceBorder.value = documentStyle
    .getPropertyValue("--p-content-border-color")
    .trim();
};

// Configuración para actualizar los estilos cuando cambian
watchEffect(() => {
  updateDocumentStyles();
});

// Función para generar el certificado
const generarReporte = async () => {
  try {
    // Verifica que dateRange y selectedCourses tengan datos válidos
    if (
      !dateRange.value ||
      !dateRange.value[0] ||
      !dateRange.value[1] ||
      selectedCourses.value.length === 0
    ) {
      console.log(
        "Faltan datos en los filtros, por favor completa todos los campos."
      );
      return; // Salir de la función si no hay datos completos
    }

    // Ajustar la fecha de inicio y fin para incluir todo el día seleccionado
    const startDate = new Date(dateRange.value[0]);
    const endDate = new Date(dateRange.value[1]);
    endDate.setHours(23, 59, 59, 999);

    // Formatear las fechas a cadenas 'YYYY-MM-DD'
    const formattedStartDate = startDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'
    const formattedEndDate = endDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'

    // Construir los parámetros para enviar al backend
    const params = {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      courses: selectedCourses.value
        .map((course) => course.idCurso.toString()) // Asegúrate de que cada ID sea una cadena
        .join(","), // Une todos los IDs en una cadena separada por comas
    };
    console.log(params);
    const response = await api.post("/reportes/incripcionesCurso", params);
    if (response.data.url) {
      window.open(response.data.url);
    } else {
      throw new Error("No se pudo generar el PDF.");
    }
  } catch (error) {
    console.error("Error al generar certificado:", error);
  }
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
      || selectedStatus.value.length === 0
      || selectedPaymentMethod.value.length === 0
    ) {
      resetFields(); // Limpiar los campos automáticamente

      return; // Salir de la función si no hay datos completos
    }
    // Ajustar la fecha de inicio y fin para incluir todo el día seleccionado
    const startDate = new Date(dateRange.value[0]);
    const endDate = new Date(dateRange.value[1]);
    endDate.setHours(23, 59, 59, 999);

    // Asegurarse de que los valores sean arreglos antes de enviarlos
    const formattedStatus = Array.isArray(selectedStatus.value)
      ? selectedStatus.value.join(",")
      : "";
    const formattedPaymentMethod = Array.isArray(selectedPaymentMethod.value)
      ? selectedPaymentMethod.value.join(",")
      : "";

    // Formatear las fechas a cadenas ISO
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

    console.log(formattedStartDate, formattedEndDate);
    const params = new URLSearchParams({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      courses: selectedCourses.value.map((course) => course.idCurso).join(","), // Enviar los IDs como una cadena
      selectedStatus:formattedStatus, // Enviar los estados de cuota seleccionados
      selectedPaymentMethod: formattedPaymentMethod, // Enviar los métodos de pago seleccionados
    });
    // Realiza la llamada a tu backend
    const response = await api.get(
      `/recibosSinPermiso/detallePagos?${params}`
    );
    // Asigna los nuevos datos a las variables reactivas
    totalInscriptions.value = response.data.totalInscriptions;
    lastMonthInscriptions.value = response.data.lastMonthInscriptions;
    totalInscriptionsThisMonth.value = response.data.totalInscriptionsThisMonth;

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
    chartData.value.labels = response.data.chartOptions.map((label) =>
      label.length > 15 ? label.substring(0, 10) + "..." : label
    );
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
watch([dateRange, selectedCourses, selectedStatus, selectedPaymentMethod], (newValues, oldValues) => {
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
  // Establecer la fecha de inicio hace un año y la fecha de fin en el día actual
  const today = new Date();
  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 1);

  // Asegúrate de que `dateRange` sea un arreglo con dos fechas
  dateRange.value = [lastYear, today];
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
  updateDocumentStyles();
});
</script>

<style scoped>
/* Estilos personalizados */
</style>
