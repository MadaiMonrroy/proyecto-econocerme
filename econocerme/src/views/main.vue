
<template>
    
<div class="grid grid-cols-4 grid-rows-5 gap-4">
    <div >1</div>
    <div >2</div>
    <div >3</div>
    <div >4</div>
    <div class="col-start-3 row-start-5">6</div>
    <div class="row-span-2 col-start-1 row-start-3">7</div>
    <div class="col-start-1 row-start-2">
        <div class="card max-w-lg">
        <Chart type="bar" :data="chartData" :options="chartOptions" class="max-w-lg"  />
    </div>
    </div>
    <div class="row-span-2 col-start-2 row-start-2">
        <template>
    <div class="flex justify-end">
        <SelectButton v-model="layout" :options="options" :allowEmpty="false">
            <template #option="{ option }">
                <i :class="[option.value === 'list' ? 'pi pi-bars' : 'pi pi-table']"></i>
            </template>
        </SelectButton>
    </div>
</template>



    </div>
    <div class="row-span-2 col-start-2 row-start-4">10</div>
    <div class="col-start-4 row-start-5">11</div>
    <div class="col-start-1 row-start-5">12</div>
    <div class="col-span-2 row-span-3 col-start-3 row-start-2">14</div>
</div>
    
    
</template>

<script setup>
import { ref, onMounted } from "vue";

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
    return {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: 'Sales',
                data: [540, 325, 702, 620],
                backgroundColor: ['rgba(249, 115, 22, 0.2)', 'rgba(6, 182, 212, 0.2)', 'rgb(107, 114, 128, 0.2)', 'rgba(139, 92, 246 0.2)'],
                borderColor: ['rgb(249, 115, 22)', 'rgb(6, 182, 212)', 'rgb(107, 114, 128)', 'rgb(139, 92, 246)'],
                borderWidth: 1
            }
        ]
    };
};
const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}
</script>
