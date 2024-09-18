<template>
  <div class="p-4">
    <Breadcrumb :home="home" :model="items" class="card h-14">
      <template #item="{ item, props }">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
        >
          <a :href="href" v-bind="props.action" @click="navigate">
            <span :class="[item.icon, 'text-color']" />
            <span class="text-primary font-semibold">{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else :href="item.url" :target="item.target" v-bind="props.action">
          <span class="text-surface-700 dark:text-surface-0">{{
            item.label
          }}</span>
        </a>
      </template>
    </Breadcrumb>
    <div v-if="mostrarSpinner" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
    <ProgressSpinner
      strokeWidth="3"
      fill="transparent"
      aria-label="Custom ProgressSpinner"
      style="width: 200px; height: 200px;" 
    />
  </div>
      

    <div class="card overflow-x-auto">
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
          <span class="text-2xl tracking-wide">Lista de Usuarios</span>
        </template>
        <div class="">
          <DataTable
            :value="usuariosConNumeracion"
            :rows="5"
            paginator
            :rowsPerPageOptions="[5, 10, 25]"
            :globalFilter="globalFilter"
            :globalFilterFields="[
              'nombres',
              'primerApellido',
              'segundoApellido',
              'email',
              'fechaNacimiento',
            ]"
          >
            <template #paginatorstart>
              <Button
                type="button"
                icon="pi pi-refresh"
                text
                @click="reloadPage"
              />
            </template>
            <template #paginatorend>
              <Button
                type="button"
                icon="pi pi-download"
                text
                @click="exportToExcel"
              />
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
            <Column
              field="nombres"
              header="Nombres"
              sortable
              class="px-6 py-4"
            />
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
      header="DATOS DEL USUARIO"
      v-model:visible="showUserDetailsModal"
      modal
      :style="{ width: '90vw', maxWidth: '750px' }"
      @hide="closeUserDetailsModal"
    >
      <div v-if="selectedUser">
        <form class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4">
          <!-- Parte izquierda: Foto de perfil -->
          <div class="flex flex-col items-center pt-4">
            <div
              class="relative h-48 w-48 md:h-96 md:w-96 rounded-full overflow-hidden shadow-2xl my-4"
            >
              <Image
                v-if="selectedUser.fotoPerfil"
                :src="selectedUser.fotoPerfil"
                alt="Foto de Perfil"
                preview
                class="object-cover object-center h-full w-full"
              />
            </div>
          </div>

          <!-- Parte derecha: Datos personales -->
          <div class="flex flex-col w-full space-y-4">
            <div>
              <h1 class="text-lg font-semibold mb-2" for="nombres">Nombres</h1>
              <InputText
                v-model="selectedUser.nombres"
                type="text"
                id="nombres"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                readonly
              />
            </div>
            <div>
              <h1 class="text-lg font-semibold mb-2" for="primerApellido">
                Primer Apellido
              </h1>
              <InputText
                v-model="selectedUser.primerApellido"
                id="primerApellido"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                readonly
              />
            </div>
            <div>
              <h1 class="text-lg font-semibold mb-2" for="segundoApellido">
                Segundo Apellido
              </h1>
              <InputText
                v-model="selectedUser.segundoApellido"
                id="segundoApellido"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                readonly
              />
            </div>
            <div>
              <h1 class="text-lg font-semibold mb-2" for="email">Email</h1>
              <InputText
                v-model="selectedUser.email"
                id="email"
                class="block w-full text-sm border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                readonly
              />
            </div>
            <div>
              <h1 class="text-lg font-semibold mb-2" for="fechaNacimiento">
                Fecha de Nacimiento
              </h1>

              <DatePicker
                v-model="selectedUser.fechaNacimiento"
                dateFormat="dd-mm-yy"
                showIcon
                fluid
                inputId="icondisplay"
                id="fechaNacimiento"
                class="-mt-0"
                readonly
              />
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
        <div
          class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-9 p-5"
        >
          <!-- Columna izquierda -->
          <div class="flex flex-col space-y-8">
            <div>
              <h1 for="fotoPerfil"><strong>Foto de Perfil</strong></h1>
              <CustomFileInput
                @change="handleFileUpload"
                type="file"
                id="fotoPerfil"
                :valueimg="selectedUsuario.fotoPerfil"
                class="h-auto w-full rounded-lg"
              />
            </div>
            <!-- Botón para generar nueva contraseña -->
            <div v-if="isEditMode" class="flex items-center space-x-2">
              <Button
                @click="handlePasswordChange"
                severity="primary"
                class="text-white px-4 w-full py-2 rounded-md"
                >Generar Nueva Contraseña</Button
              >
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="flex flex-col space-y-4">
            <div>
              <h1 for="nombres"><strong>Nombres</strong></h1>
              <InputText
                v-model="selectedUsuario.nombres"
                type="text"
                id="nombres"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
                placeholder="Ingrese nombres"
                required
              />
            </div>
            <div>
              <h1 for="primerApellido"><strong>Primer Apellido</strong></h1>
              <InputText
                v-model="selectedUsuario.primerApellido"
                type="text"
                id="primerApellido"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
                placeholder="Ingrese primer apellido"
                required
              />
            </div>
            <div>
              <h1 for="segundoApellido"><strong>Segundo Apellido</strong></h1>
              <InputText
                v-model="selectedUsuario.segundoApellido"
                type="text"
                id="segundoApellido"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
                placeholder="Ingrese segundo apellido"
              />
            </div>
            <div>
              <h1 for="fechaNacimiento">
                <strong>Fecha de Nacimiento</strong>
              </h1>
              <DatePicker
                v-model="selectedUsuario.fechaNacimiento"
                dateFormat="dd-mm-yy"
                :maxDate="new Date(2005, 11, 31)"
                showIcon
                fluid
                inputId="icondisplay"
                id="fechaNacimiento"
                placeholder="Fecha de Nacimiento"
                class="mt-1 w-auto rounded-md py-1"
              />
            </div>
          </div>
        </div>
        <div class="pl-5 pr-5 pb-4">
          <h1 for="email"><strong>Email</strong></h1>
          <InputText
            v-model="selectedUsuario.email"
            type="email"
            id="email"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1"
            placeholder="Ingrese el correo electronico"
            required
          />
        </div>
        <div class="p-4 flex justify-end space-x-4">
          <Button type="submit" severity="help" class="px-4 py-2 rounded-md"
            >Guardar</Button
          >
          <Button
            type="button"
            severity="secondary"
            class="px-4 py-2 rounded-md"
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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useAuthStore } from "@/stores/authStore";
import api from "@/axiosConfig.js";
const authStore = useAuthStore();

const usuarios = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const isConfirmModalOpen = ref(false);
const toast = useToast();
const showUserDetailsModal = ref(false);
const selectedUser = ref(null);
const globalFilter = ref(""); // Variable para almacenar el valor del buscador global

const mostrarSpinner = ref(false); 
const home = ref({
  icon: "pi pi-home",
  route: "/panelControl/main",
});
const items = ref([
  {
    label: "Estudiantes",
    icon: "pi pi-book",
    route: "/panelControl/estudiantes",
  },
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
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const showUserDetails = (user) => {
  selectedUser.value = user;
  user.fechaNacimiento = formatDate(selectedUser.value.fechaNacimiento);
  showUserDetailsModal.value = true;
};

const closeUserDetailsModal = () => {
  showUserDetailsModal.value = false;
  selectedUser.value = null;
};
const fetchData = async () => {
  try {
    const response = await api.get("/usuarios/usuario");
    console.log(response);
    usuarios.value = response.data.filter(
      (usuario) => usuario.tipoUsuario === "usuario"
    );
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchData);

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
};

const openEditModal = (usuario) => {
  console.log(usuario);
  
  console.log(selectedUsuario.value.fotoPerfil);

  isEditMode.value = true;
  selectedUsuario.value = { ...usuario };
  selectedUsuario.value.fechaNacimiento = formatDate(usuario.fechaNacimiento);
  selectedUsuario.value.idUsuario = idUsuario;
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

const usuariosConNumeracion = computed(() => {
  // Limpiamos el filtro de espacios en blanco innecesarios
  const filter = globalFilter.value.trim().toLowerCase();

  // Si el filtro está vacío (solo espacios o nada), mostramos todos los usuarios
  if (!filter) {
    return usuarios.value.map((usuario, index) => ({
      ...usuario,
      index: index + 1,
      expanded: false,
    }));
  }

  // Filtramos los usuarios cuando hay texto en el filtro
  return usuarios.value
    .filter((usuario) => {
      const nombres = usuario.nombres?.toLowerCase() || "";
      const primerApellido = usuario.primerApellido?.toLowerCase() || "";
      const segundoApellido = usuario.segundoApellido?.toLowerCase() || "";
      const email = usuario.email?.toLowerCase() || "";
      const fechaNacimiento = formatDate(usuario.fechaNacimiento || "");

      // Verificamos si alguno de los campos contiene el filtro
      return (
        nombres.includes(filter) ||
        primerApellido.includes(filter) ||
        segundoApellido.includes(filter) ||
        email.includes(filter) ||
        fechaNacimiento.includes(filter)
      );
    })
    .map((usuario, index) => ({
      ...usuario,
      index: index + 1,
      expanded: false,
    }));
});

const addUsuario = async () => {
  closeModal();

  mostrarSpinner.value = true;
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
    await api.post("/usuarios/agregarUsuario", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    fetchData();
    
    mostrarSpinner.value = false;

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
  console.log(convertirFechaAMysql(selectedUsuario.value.fechaNacimiento))
  formData.append("estado", selectedUsuario.value.estado);
  formData.append("tipoUsuario", selectedUsuario.value.tipoUsuario);
  formData.append("id", selectedUsuario.value.id); // Agregar el ID del usuario
  //console.log(date);
  formData.append("idUsuario", selectedUsuario.value.idUsuario);
  if(selectedUsuario.value.fotoPerfil === "http://localhost:3000/uploads/usuarios/avatar3.png" || selectedUsuario.value.fotoPerfil === null){
    selectedUsuario.value.fotoPerfil = null
  }
  console.log(selectedUsuario.value.fotoPerfil);

  if (selectedFile) {
    formData.append("fotoPerfil", selectedFile);
  }else{
    selectedUsuario.value.fotoPerfil }

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
        },
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
    await api.delete(`/usuarios/eliminarUsuario/${usuarioToDelete.value}`);
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
  const worksheet = workbook.addWorksheet("Anuncios");

  // Agrega encabezados
  worksheet.columns = [
    { header: "#", key: "id", width: 10 },
    { header: "Foto de Perfil", key: "fotoPerfil", width: 30 },
    { header: "Nombres", key: "nombres", width: 20 },
    { header: "Primer Apellido", key: "primerApellido", width: 15 },
    { header: "Segundo Apellido", key: "segundoApellido", width: 15 },
    { header: "Estado", key: "estado", width: 10 },
    { header: "Email", key: "email", width: 20 },
    { header: "Fecha de Nacimiento", key: "fechaNacimiento", width: 5 },
  ];

  // Agrega filas
  usuarios.value.forEach((usuario) => {
    worksheet.addRow(usuario);
  });

  // Generar y descargar el archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "usuarios.xlsx");
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
