<template>
    <div class="p-4">
      <div class=" ">
        <Breadcrumb :home="home" :model="items" class="card h-14">
        <template #item="{ item, props }">
                  <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                      <a :href="href" v-bind="props.action" @click="navigate">
                          <span :class="[item.icon, 'text-color']" />
                          <span class="text-primary font-semibold">{{ item.label }}</span>
                      </a>
                  </router-link>
                  <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                      <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
                  </a>
              </template>
        </Breadcrumb>
      </div>
      <!-- <div
        v-if="mostrarSpinner"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <ProgressSpinner
          style="width: 50px; height: 50px"
          strokeWidth="8"
          fill="transparent"
          animationDuration=".5s"
          aria-label="Custom ProgressSpinner"
          class="z-50"
        />
      </div>-->
  
      <div class="card">
  
        <h2 class="text-3xl mb-4 items-end">ESTUDIANTES</h2>
      <Divider />
  
      <!-- Contenedor para alinear el botón y el buscador en la misma línea -->
      <div class="flex justify-between items-center mb-4">
        <!-- Buscador alineado a la izquierda -->
        <div class="flex flex-1 max-w-md">
          <IconField class="flex flex-1">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <inputText
              v-model="globalFilter"
              placeholder="Buscar..."
              class="w-full"
            />
          </IconField>
        </div>
  
        <!-- Botón de agregar estudiante alineado a la derecha -->
        <div class="flex-none">
          <Button
            class="bg-green-500 text-white p-button-rounded p-button-success flex items-center"
            @click="openAddModal"
          >
            <i class="pi pi-user-plus mr-2"></i>
            Agregar Estudiante
          </Button>
        </div>
      </div>
   
      <!-- v-model:selection="selectedRow"
          selection-mode="multiple" -->
                  <!-- <Column header="#" sortable class="px-6 py-4"> </Column>-->
  
        
        <Divider />
        <Fieldset>
          <template #legend>
            <span class="text-2xl tracking-wide">Lista de Cursos</span>
          </template>
        <div class="">
        <DataTable
          :value="usuariosConNumeracion"
          :tableStyle="{'min-width': '50rem'}"
          :rows="4"
          :paginator="true"
          :rowsPerPageOptions="[4, 8, 12]"
          class="p-datatable-striped"
          scrollable
          scrollHeight = "61vh"
          stripedRows
          lazy
        >
        <template #paginatorstart>
                  <Button type="button" icon="pi pi-refresh" text @click="reloadPage" />
              </template>
              <template #paginatorend>
                  <Button type="button" icon="pi pi-download" text @click="exportToExcel" />
              </template>
            <template #body="rowData">
              {{ getRowIndex(rowData) }}
            </template>
            <Column field="index" header="#" sortable class="px-6 py-4" />
  
          <Column header="Foto de Perfil" class="px-6 py-4">
            <template #body="rowData">
              <Image
                v-if="rowData.data.fotoPerfil"
                :src="rowData.data.fotoPerfil"
                alt="Foto de Perfil"
                class="h-16 w-20 object-cover rounded-full"
                preview
              />
            </template>
          </Column>
          <Column field="nombres" header="Nombres" sortable class="px-6 py-4" />
          <Column
            field="primerApellido"
            header="Primer Apellido"
            sortable
            class="px-6 py-4"
          />
          <Column
            field="segundoApellido"
            header="Segundo Apellido"
            sortable
            class="px-6 py-4"
          />
          <Column field="estado" header="Estado" class="px-6 py-4">
            <template #body="rowData">
              <Tag
                v-if="rowData.data.estado === 1"
                value="Activo"
                severity="success"
                class="px-2 py-1"
              />
              <Tag
                v-else-if="rowData.data.estado === 2"
                value="Inactivo"
                severity="warn"
                class="px-2 py-1"
              />
              <Tag
                v-else
                value="Desconocido"
                severity="warning"
                class="px-2 py-1"
              />
            </template>
          </Column>
          <Column field="email" header="Email" class="px-6 py-4" />
  
          <Column
            field="fechaNacimiento"
            header="Fecha de Nacimiento"
            sortable
            class="px-6 py-4"
          >
            <template #body="rowData">
              {{ formatDate(rowData.data.fechaNacimiento) }}
            </template>
          </Column>
  
          <Column header="Acciones" class="px-6 py-4">
            <template #body="rowData">
              <div class="flex items-center space-x-2">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-secondary"
                  @click="showUserDetails(rowData.data)"
                />
                <Button
                  icon="pi pi-user-edit"
                  class="p-button-rounded p-button-info"
                  @click="openEditModal(rowData.data)"
                />
                <Button
                  icon="pi pi-user-minus"
                  class="p-button-rounded p-button-danger"
                  @click="eliminarUsuario(rowData.data.id)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
        </div>
      </Fieldset>
      </div>
      <!-- Modal para Confirmar Eliminación -->
      <Dialog
        v-model:visible="isConfirmModalOpen"
        header="Confirmar Eliminación"
        modal
        class="w-full max-w-sm"
      >
        <div class="p-4">
          <p>¿Estás seguro de que deseas eliminar este usuario?</p>
          <div class="mt-4 flex justify-end space-x-4">
            <Button
              class="bg-red-500 text-white px-4 py-2 rounded-md"
              @click="deleteUsuario"
              >Eliminar</Button
            >
            <Button
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              @click="closeConfirmModal"
              >Cancelar</Button
            >
          </div>
        </div>
      </Dialog>
      <!-- Modal para mostrar detalles del usuario -->
      <Dialog
        header="Detalles del Usuario"
        v-model:visible="showUserDetailsModal"
        modal
        :style="{ width: '50vw' }"
        @hide="closeUserDetailsModal"
      >
        <div v-if="selectedUser">
          <form class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Parte izquierda: Campos del formulario -->
            <div class="space-y-6">
              <div>
                <h1
                  for="nombres"
                  >Nombres</h1
                >
                <InputText
                  v-model="selectedUser.nombres"
                  type="text"
                  id="nombres"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled
                />
              </div>
              <div>
                <h1
                  for="primerApellido"
                  >Primer Apellido</h1
                >
                <InputText
                  v-model="selectedUser.primerApellido"
                  id="primerApellido"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled
                />
              </div>
              <div>
                <h1
                  for="segundoApellido"
                  >Segundo Apellido</h1
                >
                <InputText
                  v-model="selectedUser.segundoApellido"
                  id="segundoApellido"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled
                />
              </div>
              <div>
                <h1
                  for="email"
                  >Email</h1
                >
                <InputText
                  v-model="selectedUser.email"
                  id="email"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled
                />
              </div>
              <div>
                <h1
                  for="fechaNacimiento"
                  >Fecha de Nacimiento</h1
                >
                <InputText
                  v-model="selectedUser.fechaNacimiento"
                  type="date"
                  id="fechaNacimiento"
                  class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled
                />
              </div>
            </div>
  
            <!-- Parte derecha: Foto de perfil -->
            <div class="flex flex-col items-start space-y-2">
              <div class="w-full">
                <h1
                  for="fotoPerfil"
                  >Foto de Perfil</h1
                >
                <div class="border rounded-xl flex justify-center">
                  <img
                    v-if="selectedUser.fotoPerfil"
                    :src="selectedUser.fotoPerfil"
                    alt="Foto de Perfil"
                    class="my-4 h-24 w-24 object-cover rounded"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </Dialog>
      
      <Dialog
        v-model:visible="isModalOpen"
        :header="isEditMode ? 'Editar Usuario' : 'Agregar Usuario'"
        :visible="isModalOpen"
        modal
        class=" "
        :style="{ zIndex: 10 }"
      >
        <form @submit.prevent="isEditMode ? updateUsuario() : addUsuario()">
          <div class="grid grid-cols-2 gap-4 p-4">
            <div>
              <h1
                for="nombres"
                >Nombres</h1
              >
              <input
                v-model="selectedUsuario.nombres"
                type="text"
                id="nombres"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
                placeholder="Ingrese nombres"
                required
              />
            </div>
            <div>
              <h1
                for="primerApellido"
                >Primer Apellido</h1
              >
              <input
                v-model="selectedUsuario.primerApellido"
                type="text"
                id="primerApellido"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
                placeholder="Ingrese primer apellido"
                required
              />
            </div>
            <div>
              <h1
                for="segundoApellido"
                >Segundo Apellido</h1
              >
              <input
                v-model="selectedUsuario.segundoApellido"
                type="text"
                id="segundoApellido"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
                placeholder="Ingrese segundo apellido"
              />
            </div>
            <div>
              <h1
                for="email"
                >Email</h1
              >
              <input
                v-model="selectedUsuario.email"
                type="email"
                id="email"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
                placeholder="Ingrese email"
                required
              />
            </div>
            <!-- Foto de Perfil -->
            <div class="col-span-2 flex items-start">
              <div class="w-1/2">
                <h1
                  for="fotoPerfil"
                  >Foto de Perfil</h1
                >
                <CustomFileInput
                  @change="handleFileUpload"
                  type="file"
                  id="fotoPerfil"
                  class="mt-1 block w-full border border-gray-300 rounded-full shadow-sm px-3 py-1 "
                />
                <!-- Vista previa de la foto -->
                <div
                  v-if="isEditMode && !selectedFile"
                  class="mt-2 flex justify-center items-center"
                >
                  <div class="relative border border-gray-300 rounded-lg p-1">
                    <Image
                      :src="previewFotoPerfil"
                      alt="Vista previa de la foto de perfil"
                      class="h-24 w-30 object-cover rounded-md"
                      preview
                    />
                  </div>
                </div>
              </div>
              <div class="w-1/2 flex flex-col justify-between ml-4">
                <h1
                  for="fechaNacimiento"
                  >Fecha de Nacimiento</h1
                >
                <DatePicker
                  v-model="selectedUsuario.fechaNacimiento"
                  dateFormat="dd/mm/yy"
                  showIcon
                  fluid
                  inputId="icondisplay"
                  id="fechaNacimiento"
                  class="-mt-0"
                />
  
                <div v-if="isEditMode" class="mt-5 flex items-center space-x-2">
                  <Button
                    @click="handlePasswordChange"
                    class="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >Generar Nueva Contraseña</Button
                  >
                </div>
              </div>
            </div>
            <input
              type="hidden"
              v-model="selectedUsuario.tipoUsuario"
              value="usuario"
            />
            <input
              type="hidden"
              :value="isEditMode ? selectedUsuario.estado : 2"
            />
          </div>
          <div class="p-4 flex justify-end space-x-4">
            <Button
              type="submit"
              class="bg-blue-600 text-white px-4 py-2 rounded-md"
              >Guardar</Button
            >
            <Button
              type="button"
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              @click="closeModal"
              >Cancelar</Button
            >
          </div>
        </form>
        
      </Dialog>
      
    </div>
    
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import CustomFileInput from "@/components/CustomFileInput.vue";
  import { useToast } from "primevue/usetoast";
  import ExcelJS from 'exceljs';
  import { saveAs } from 'file-saver';
  import { useAuthStore } from "@/stores/authStore";
  import api from '@/axiosConfig.js'
  const authStore = useAuthStore();
  
  const usuarios = ref([]);
  const isModalOpen = ref(false);
  const isEditMode = ref(false);
  const isConfirmModalOpen = ref(false);
  const toast = useToast();
  const showUserDetailsModal = ref(false);
  const selectedUser = ref(null);
  
  /* const mostrarSpinner = ref(false); Controla la visibilidad del spinner*/
  const home = ref({
      icon: 'pi pi-home',
      route: '/panelControl/main'
  });
  const items = ref([
      { label: 'Estudiantes', 
        icon: "pi pi-book",
        route: '/panelControl/estudiantes' }
  ]);
  
  const token = authStore.token;
  const idUsuario = authStore.usuario.id;
  /* esto es para seleccionar varios datos de una tabla
  const selectedRow = ref();*/
  const selectedUsuario = ref({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    contrasenia: "", // Se maneja en el frontend
    fotoPerfil: "",
    fechaNacimiento: "",
    tipoUsuario: "usuario",
    estado: 2, // Por defecto inactivo
    idUsuario: idUsuario,
    
  });
  const previewFotoPerfil = ref("");
  let usuarioToDelete = ref(null); // Usuario a eliminar
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Suponiendo que la fecha viene en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Meses desde 0
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };
  const showUserDetails = (user) => {
    selectedUser.value = user;
    showUserDetailsModal.value = true;
  };
  
  const closeUserDetailsModal = () => {
    showUserDetailsModal.value = false;
    selectedUser.value = null;
  };
  const fetchData = async () => {
  
    try {
      const response = await api.get(
        "/usuarios/usuario"
    
      );
      
      usuarios.value = response.data.filter(
        (usuario) => usuario.tipoUsuario === "usuario"
      );
  
    } catch (error) {
      console.error(error);
    }
  };
  
  onMounted(fetchData
  );
  
  const openAddModal = () => {
    isEditMode.value = false;
    selectedUsuario.value = {
      nombres: "",
      primerApellido: "",
      segundoApellido: "",
      email: "",
      contrasenia: generatePassword(), // Generar en el frontend
      fotoPerfil: "",
      fechaNacimiento: "",
      tipoUsuario: "usuario",
      estado: 1,
      idUsuario: idUsuario,
    };
    previewFotoPerfil.value = "";
    isModalOpen.value = true;
  };
  
  let selectedFile = null;
  
  const handleFileUpload = (event) => {
    selectedFile = event.target.files[0];
    if (selectedFile) {
      previewFotoPerfil.value = URL.createObjectURL(selectedFile);
    } else {
      previewFotoPerfil.value = "";
      selectedFile = null; // Restablece el archivo seleccionado
    }
  };
  
  const openEditModal = (usuario) => {
    console.log(usuario)
    isEditMode.value = true;
    selectedUsuario.value = { ...usuario };
    selectedUsuario.value.fechaNacimiento = formatToDateInput(
      usuario.fechaNacimiento
    );
    selectedUsuario.value.idUsuario = idUsuario
    console.log(selectedUsuario.value.idUsuario)
    previewFotoPerfil.value = usuario.fotoPerfil ?  "": usuario.fotoPerfil;
    isModalOpen.value = true;
  };
  const formatToDateInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Meses desde 0
    const year = date.getUTCFullYear();
    return `${year}-${month}-${day}`;
  };
  function convertirFechaAMysql(fecha) {
    const fechaObj = new Date(fecha);
    const year = fechaObj.getFullYear();
    const month = String(fechaObj.getMonth() + 1).padStart(2, "0"); // Los meses comienzan en 0
    const day = String(fechaObj.getDate()).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  }
  const closeModal = () => {
    isModalOpen.value = false;
  };
  const closeConfirmModal = () => {
    isConfirmModalOpen.value = false;
  };
  // Función para recargar la página
  const reloadPage = () => {
    fetchData();
  };
  
  const cursosConNumeracion = computed(() => {
    // Filtrar cursos basado en globalFilter
    const filter = globalFilter.value.toLowerCase();
    return cursos.value
      .filter((curso) => {
        return (
          curso.titulo.toLowerCase().includes(filter) ||
          curso.especialidad.toLowerCase().includes(filter) ||
          curso.descripcion.toLowerCase().includes(filter) ||
          curso.estado.toString().includes(filter) || // Filtrar por duración
          curso.duracion.toString().includes(filter) || // Filtrar por duración
          curso.precio.toString().includes(filter) // Filtrar por precio
          
        );
        
      })
      
      .map((curso, index) => ({
        ...curso,
        index: index + 1,
        expanded: false // Añadir la propiedad `expanded` por defecto
  
      }));
  });
  const addUsuario = async () => {
    closeModal();
  
    /* mostrarSpinner.value = true;*/
    const formData = new FormData();
    formData.append("nombres", selectedUsuario.value.nombres);
    formData.append("primerApellido", selectedUsuario.value.primerApellido);
    formData.append("segundoApellido", selectedUsuario.value.segundoApellido);
    formData.append("email", selectedUsuario.value.email);
    formData.append(
      "fechaNacimiento",
      convertirFechaAMysql(selectedUsuario.value.fechaNacimiento)
    );
    formData.append("tipoUsuario", selectedUsuario.value.tipoUsuario);
    formData.append("contrasenia", selectedUsuario.value.contrasenia); // Se envía al backend
    formData.append("estado", selectedUsuario.value.estado);
    formData.append("idUsuario", selectedUsuario.value.idUsuario);
    
    if (selectedFile) {
      formData.append("fotoPerfil", selectedFile);
    }
  
    try {
      await api.post(
        "/usuarios/agregarUsuario",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
  
        }
      );
      fetchData();
  
      toast.add({
        severity: "info",
        summary: "Usuario Añadido",
        detail:
          "Usuario añadido exitosamente. Se ha enviado un correo de confirmación para completar el proceso de activación.",
        life: 5000,
      });
    } catch (error) {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail:
          "No se pudo añadir el usuario. Por favor, intente de nuevo más tarde.",
        life: 3000,
      });
    }
  };
  const searchTerm = ref("");
  
  const filteredUsuarios = computed(() => {
    return usuarios.value.filter((usuario) => {
      const fullName = `${usuario.nombres} ${usuario.primerApellido} ${usuario.segundoApellido}`;
      const email = usuario.email.toLowerCase();
      const search = searchTerm.value.toLowerCase();
      return (
        fullName.toLowerCase().includes(search) ||
        email.includes(search) ||
        usuario.estado.toString().includes(search) // Si quieres buscar también por estado
      );
    });
  });
  
  
  const updateUsuario = async () => {
    closeModal();
  
    const formData = new FormData();
    formData.append("nombres", selectedUsuario.value.nombres);
    formData.append("primerApellido", selectedUsuario.value.primerApellido);
    formData.append("segundoApellido", selectedUsuario.value.segundoApellido);
    formData.append("email", selectedUsuario.value.email);
    formData.append(
      "fechaNacimiento",
      convertirFechaAMysql(selectedUsuario.value.fechaNacimiento)
    );
    formData.append("estado", selectedUsuario.value.estado);
    formData.append("tipoUsuario", selectedUsuario.value.tipoUsuario);
    formData.append("id", selectedUsuario.value.id); // Agregar el ID del usuario
    //console.log(date);
    formData.append("idUsuario", selectedUsuario.value.idUsuario);
    console.log(selectedUsuario.value.idUsuario)
  
    if (selectedFile) {
      formData.append("fotoPerfil", selectedFile);
    }
  
    if (selectedUsuario.value.contrasenia) {
      formData.append("contrasenia", selectedUsuario.value.contrasenia); // Solo enviar si se cambia
    }
  
    try {
      await api.put(
        `/usuarios/editarUsuario/${selectedUsuario.value.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
  
          }
        }
      );
     
      // Actualizar el usuario en la lista local
      const index = usuarios.value.findIndex(
        (usuario) => usuario.id === selectedUsuario.value.id
      );
      if (index !== -1) {
        usuarios.value[index] = { ...selectedUsuario.value }; // Actualizar el usuario en la lista
      }
      fetchData();
      toast.add({
        severity: "success",
        summary: "Datos Actuaizados del Usuario",
        detail: "Los datos del usuario se han actualizado correctamente.",
        life: 3000,
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Hubo un problema al actualizar el usuario. Intente nuevamente.",
        life: 3000,
      });
    }
  };
  
  const eliminarUsuario = (id) => {
    usuarioToDelete.value = id;
    isConfirmModalOpen.value = true;
  };
  
  const deleteUsuario = async () => {
    try {
      await api.delete(
        `/usuarios/eliminarUsuario/${usuarioToDelete.value}`
      );
      fetchData();
      closeConfirmModal();
      toast.add({
        severity: "success",
        summary: "Usuario Eliminado",
        detail: "El usuario ha sido eliminado con éxito.",
        life: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Hubo un problema al eliminar el usuario.",
        life: 3000,
      });
    }
  };
  // Función para generar contraseña aleatoria
  const generatePassword = () => {
    const length = 8;
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const allChars = lowercase + uppercase + numbers + special;
  
    let password = [];
  
    // Garantizamos que al menos un carácter de cada tipo esté presente
    password.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
    password.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
    password.push(numbers[Math.floor(Math.random() * numbers.length)]);
    password.push(special[Math.floor(Math.random() * special.length)]);
  
    // Rellenamos la contraseña con caracteres aleatorios hasta llegar a 8 caracteres
    while (password.length < length) {
      password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }
  
    // Mezclamos la contraseña para evitar patrones predecibles
    password = password.sort(() => Math.random() - 0.5).join("");
  
    return password;
  };
  const getRowIndex = (rowData) => {
    return usuarios.value.findIndex((user) => user.id === rowData.data.id) + 1;
  };
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Anuncios');
  
    // Agrega encabezados
    worksheet.columns = [
      { header: '#', key: 'id', width: 10 },
      { header: 'Foto de Perfil', key: 'fotoPerfil', width: 30 },
      { header: 'Nombres', key: 'nombres', width: 20 },
      { header: 'Primer Apellido', key: 'primerApellido', width: 15 },
      { header: 'Segundo Apellido', key: 'segundoApellido', width: 15 },
      { header: 'Estado', key: 'estado', width: 10 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Fecha de Nacimiento', key: 'fechaNacimiento', width: 5 }
    ];
  
    // Agrega filas
    usuarios.value.forEach((usuario) => {
      worksheet.addRow(usuario);
    });
  
    // Generar y descargar el archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'usuarios.xlsx');
  };
  const handlePasswordChange = () => {
    selectedUsuario.value.contrasenia = generatePassword();
    toast.add({
      severity: "info",
      summary: "Contraseña Generada",
      detail: "Se ha generado una nueva contraseña para el usuario.",
      life: 3000,
    });
    
  };
  
  </script>
  