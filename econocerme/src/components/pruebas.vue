
<template>
    <div class="card flex justify-center">
        <Password v-model="value" toggleMask />

        <DatePicker v-model="icondisplay" showIcon fluid iconDisplay="input" inputId="icondisplay" />
        <div class="flex-auto">
            <label for="buttondisplay" class="font-bold block mb-2"> Button </label>
            <DatePicker v-model="buttondisplay" showIcon fluid :showOnFocus="false" inputId="buttondisplay" />
        </div>
        <div class="flex-auto">
            <label for="icondisplay" class="font-bold block mb-2"> Default Icon </label>
            <DatePicker v-model="icondisplay" showIcon fluid iconDisplay="input" inputId="icondisplay" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const value = ref(null);
</script>

<style>

</style>
