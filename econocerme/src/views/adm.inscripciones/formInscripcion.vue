<template>
    <div class="flex justify-center items-center p-2">
      <div class="card w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <Toast/>
        <h2 class="text-2xl font-semibold mb-6 text-center">{{ inscripcion.idInscripcion ? 'Editar Inscripcion' : 'Agregar Nueva Inscripcion' }}</h2>
        <form @submit.prevent="inscripcion.idInscripcion ? actualizarInscripcion() : agregarInscripcion()">
          <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
            <!-- Lado izquierdo -->
            <div class="space-y-4">
  
  
  
              <!-- Selector de usuario -->
              <div>
                <label for="usuarioId" class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Usuario</label>
                <select v-model="inscripcion.usuarioId" id="usuarioId"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required>
                  <option value="" disabled>Seleccionar Usuario</option>
                  <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
                    {{ usuario.nombres }} {{ usuario.primerApellido }} {{ usuario.segundoApellido }}
                  </option>
                </select>
  
              </div>
    
              <!-- Selector de curso -->
              <div>
                <label for="cursoId" class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Curso</label>
                <select v-model="inscripcion.cursoId" id="cursoId"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required>
                  <option value="" disabled>Seleccionar Curso</option>
                  <option v-for="curso in cursos" :key="curso.idCurso" :value="curso.idCurso">
                    {{ curso.titulo }}
                  </option>
                </select>
              </div>
  
              <!-- Campo de observación -->
              <div>
                <label for="observacion" class="block text-sm font-medium text-gray-700 mb-2">Observación</label>
                <textarea v-model="inscripcion.observacion" id="observacion"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="4" placeholder="Ingrese observación" />
              </div>
  
  
  
  
  
  
  
            </div>
  
          </div>
  
          <div class="mt-6 flex justify-end space-x-4">
            <button type="submit"
              class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {{ inscripcion.idInscripcion ? 'Guardar' : 'Registrar Inscripción' }}
            </button>
            <button type="button" @click="cancelarEdicion"
              class="inline-block px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter, useRoute } from 'vue-router';
  import InputNumber from 'primevue/inputnumber'; // Asegúrate de que InputNumber está importado
  import CustomFileInput from '@/components/CustomFileInput.vue';
  import { useToast } from 'primevue/usetoast';
  import { useAuthStore } from "@/stores/authStore";
  
  const authStore = useAuthStore();
  
  const toast = useToast();
  const route = useRoute();
  const router = useRouter();
  const token = authStore.token;
  
  const inscripcion = reactive({
    usuarioId: '',
    cursoId: '',
    observacion: '',
  });
  
  
  const usuarios = reactive([]);
  const cursos = reactive([]);
  
  const cargarDatos = async () => {
    try {
      const [usuariosResponse, cursosResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/usuarios/usuarios', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/api/cursos/curso', { headers: { Authorization: `Bearer ${token}` } })
      ]);
  
      usuarios.splice(0, usuarios.length, ...usuariosResponse.data);
      cursos.splice(0, cursos.length, ...cursosResponse.data);
    //   console.log(cursos);
    //   console.log(usuarios);
    } catch (error) {
      console.error(error);
    }
  };
  
  
  
  const logFormData = (formData) => {
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  };
  
  const agregarInscripcion = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/inscripciones/agregarInscripcion', {
        idUsuario: inscripcion.usuarioId,
        idCurso: inscripcion.cursoId,
        observacion: inscripcion.observacion
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data.mensaje);
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Inscripción exitosa', life: 1000 });
      router.push('/panelControl/inscripciones');
    } catch (error) {
      const mistake =  error.response.data.mensaje;
      toast.add({ severity: 'error', summary: 'Error', detail: mistake, life: 2000 });

    }
  };
  
  
  const cargarInscripcion = async (idInscripcion) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/cursos/obtenerInscripcion/${idInscripcion}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      Object.assign(inscripcion, response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  
  const actualizarInscripcion = async () => {
  
    try {
      router.push('/panelControl/inscripciones');
    } catch (error) {
      console.error(error);
    }
  };
  


  const cancelarEdicion = () => {
    router.push('/panelControl/inscripciones');
  };
  
  onMounted(() => {
    const { idInscripcion } = route.params;
    if (idInscripcion) {
      cargarInscripcion(idInscripcion);
    }
    cargarDatos();
  });
  </script>



