
<template>
    <div class="card flex justify-center">
        <Password v-model="value" toggleMask />
        <h1>dasd</h1>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const value = ref(null);
</script>
