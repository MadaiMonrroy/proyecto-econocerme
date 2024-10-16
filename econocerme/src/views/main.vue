<template>
    <div class="">
      <!-- Cards Section -->
      <div class="p-4">
        <!-- Cards Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Card>
              <template #title>
                <i class="pi pi-chart-line mr-2"></i>Card 1
              </template>
              <template #content>
                <h2 class="text-2xl font-bold">150</h2>
                <p>Active Users</p>
              </template>
            </Card>
          </div>
          <div>
            <Card>
              <template #title>
                <i class="pi pi-dollar mr-2"></i>Card 2
              </template>
              <template #content>
                <h2 class="text-2xl font-bold">$3,500</h2>
                <p>Monthly Revenue</p>
              </template>
            </Card>
          </div>
          <div>
            <Card>
              <template #title> <i class="pi pi-users mr-2"></i>Card 3 </template>
              <template #content>
                <h2 class="text-2xl font-bold">25</h2>
                <p>New Signups</p>
              </template>
            </Card>
          </div>
          <div>
            <Card>
              <template #title> <i class="pi pi-users mr-2"></i>Card 4 </template>
              <template #content>
                <h2 class="text-2xl font-bold">25</h2>
                <p>New Signups</p>
              </template>
            </Card>
          </div>
        </div>
      </div>
      <div class="p-4">
        <!-- Grid Container -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Card 1: Large Chart Card -->
          <div class="col-span-1 md:col-span-2 shadow">
            <Card>
              <template #title> <i class="pi pi-users mr-2"></i>Card 4 </template>
              <template #content>
                <!-- Contenido del gráfico grande -->
                <h3 class="text-lg font-bold">Chart Overview</h3>
                <div
                  class="h-48 bg-gray-100 rounded mt-4 flex items-center justify-center"
                >
                  Gráfico Principal
                </div>
              </template>
            </Card>
          </div>
  
          <!-- Card 2: Small Line Chart Card -->
          <Card>
            <template #title> <i class="pi pi-users mr-2"></i>Card 4 </template>
            <template #content>
              <div class="shadow">
                <!-- Contenido del gráfico de línea -->
                <h3 class="text-lg font-bold">Line Chart</h3>
                <div
                  class="h-auto bg-gray-100 rounded mt-4 flex items-center justify-center"
                >
                  
                </div>
                <div
                  class="h-auto bg-gray-100 rounded mt-4 flex items-center justify-center"
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
          <Card>
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
  
          <Card>
            <template #title> <i class="pi pi-users mr-2"></i>Card 4 </template>
            <template #content>
              <!-- Card 4: Bar Chart Card -->
              <div class="">
                <!-- Contenido del gráfico de barras -->
                <h3 class="text-lg font-bold">Bar Chart</h3>
                <div
                  class="h-24 bg-gray-100 rounded mt-4 flex items-center justify-center"
                >
                  Gráfico de Barras
                </div>
              </div>
            </template>
          </Card>
  
          <Card>
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
  </template>
  
  <script>
  export default {
    components: {},
    data() {
      return {
        chartData: null,
        chartOptions: null
        
        
    }},
    mounted() {
      this.chartData = this.setChartData();
      this.chartOptions = this.setChartOptions();
    },
    methods: {
      setChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
  
        return {
          datasets: [
            {
              data: [11, 16, 7, 3, 14],
              backgroundColor: [
                documentStyle.getPropertyValue("--p-pink-500"),
                documentStyle.getPropertyValue("--p-gray-500"),
                documentStyle.getPropertyValue("--p-orange-500"),
                documentStyle.getPropertyValue("--p-purple-500"),
                documentStyle.getPropertyValue("--p-cyan-500"),
              ],
              label: "My dataset",
            },
          ],
          labels: ["Pink", "Gray", "Orange", "Purple", "Cyan"],
        };
      },
      setChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue("--p-text-color");
        const surfaceBorder = documentStyle.getPropertyValue(
          "--p-content-border-color"
        );
  
        return {
          plugins: {
            legend: {
              labels: {
                color: textColor,
              },
            },
          },
          scales: {
            r: {
              grid: {
                color: surfaceBorder,
              },
            },
          },
        };
      },
    },
  }
  </script>
  
  <style scoped>
  /* Aquí puedes agregar estilos personalizados */
  </style>
  