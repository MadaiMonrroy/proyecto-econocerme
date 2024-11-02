<template>
  <div class="p-4">
    <Card class="">
      <template #title>
        <i class="pi pi-file-plus mr-2"></i>
        Reportes
      </template>
      <template #content>
        <div class="flex mb-2 gap-2 justify-end">
          <Button
            @click="value = '0'"
            rounded
            label="1"
            class="w-8 h-8 p-0 dark:text-surface-0"
            :outlined="value !== '0'"
          />
          <Button
            @click="value = '1'"
            rounded
            label="2"
            class="w-8 h-8 p-0 dark:text-surface-0"
            :outlined="value !== '1'"
          />
          <Button
            @click="value = '2'"
            rounded
            label="3"
            class="w-8 h-8 p-0 dark:text-surface-0"
            :outlined="value !== '2'"
          />
          <Button
            @click="value = '3'"
            rounded
            label="4"
            class="w-8 h-8 p-0 dark:text-surface-0"
            :outlined="value !== '3'"
          />
          <Button
            @click="value = '4'"
            rounded
            label="5"
            class="w-8 h-8 p-0 dark:text-surface-0"
            :outlined="value !== '4'"
          />
        </div>
        <Tabs v-model:value="value">
          <TabList>
            <Tab value="0">Inscripciones por Curso</Tab>
            <Tab value="1">Pagos Pendientes</Tab>
            <Tab value="2">Evaluaciones por Curso</Tab>
            <Tab value="3">Anuncios Activos</Tab>
            <Tab value="4">Cursos y Sus Inscripciones</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <reportInscripcionesCurso/>
            </TabPanel>
            <TabPanel value="1">
              <reportePagos/>
            </TabPanel>
            <TabPanel value="2">
              <p>sdfsdf</p>
            </TabPanel>
            <TabPanel value="3">
              <p>sdfsdf</p>
            </TabPanel>
            <TabPanel value="4">
              <p>sdfsdf</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </template>
    </Card>
  </div>
</template>
<script>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";
import reportInscripcionesCurso from "./reportInscripcionesCurso.vue";
import reportePagos from "./reportePagos.vue";
export default {
  components: { reportInscripcionesCurso, reportePagos },

  data() {
    return {
      value: "0",
    };
  },
};
</script>
