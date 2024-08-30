<!-- src/components/CustomCalendar.vue -->
<template>
    <div class="relative">
      <label :for="id" class="block text-sm font-medium text-gray-700 mb-2">{{ label }}</label>
      <input
        type="date"
        :id="id"
        v-model="dateValue"
        class="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const dateValue = ref(props.modelValue);
  
  watch(dateValue, (newValue) => {
    emit('update:modelValue', newValue);
  });
  </script>
  
  <style scoped>
  /* Estilos adicionales si es necesario */
  </style>
  