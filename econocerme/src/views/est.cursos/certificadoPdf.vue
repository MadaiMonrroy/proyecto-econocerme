<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="pt-9 w-[900px] h-[650px]">
      <!-- Decoraciones laterales -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-50">
        <div
          class="absolute top-0 left-[-50px] w-[230px] h-full bg-gradient-to-r from-blue-300 to-white"
        ></div>
        <div
          class="absolute top-0 right-[-50px] w-[230px] h-full bg-gradient-to-l from-blue-300 to-white"
        ></div>
        <div
          class="absolute top-0 left-0 w-[150px] h-[150px] bg-gradient-to-r from-custom-purple to-custom-pink rounded-br-full opacity-70"
        ></div>
        <div
          class="absolute bottom-0 right-0 w-[150px] h-[150px] bg-gradient-to-l from-custom-purple to-custom-pink rounded-tl-full opacity-70"
        ></div>

        <div
          class="absolute top-[20%] left-[-40px] w-[80px] h-[80px] bg-blue-300 rounded-full"
        ></div>
        <div
          class="absolute top-[30%] left-[-30px] w-[100px] h-[100px] bg-blue-200 rounded-full"
        ></div>


        <div
          class="absolute top-[65%] right-[-40px] w-[80px] h-[80px] bg-blue-300 rounded-full"
        ></div>
        <div
          class="absolute top-[70%] right-[-30px] w-[100px] h-[100px] bg-blue-200 rounded-full"
        ></div>
      </div>

      <!-- Encabezado del certificado -->
      <div class="text-center mb-12 -mt-5">
        <img src="@/assets/logoec.png" alt="Logo" class="mx-auto w-80 h-24" />
        <h2 class="text-4xl font-bold pt-12 tracking-widest text-gray-800">
          CERTIFICADO DE FINALIZACIÓN
        </h2>
        <p class="text-lg font-medium text-gray-600 mt-3">Otorgado a:</p>
        <h1 class="text-5xl font-serif text-dark-purple mt-2">
          {{ recipientName }}
        </h1>
      </div>

      <!-- Cuerpo del certificado -->
      <div class="px-10 text-center pt-6">
        <p class="text-lg leading-relaxed ">
          Este certificado reconoce la dedicación y el compromiso de
          <span class="font-semibold">{{ recipientName.toUpperCase() }} </span>
          durante el curso de
          <span class="font-bold">{{ courseName.toUpperCase() }}</span
          >. Con {{ Math.round(courseHours) }} horas de formación, se han
          adquirido valiosas herramientas y conocimientos que fortalecen la
          capacidad de impactar positivamente en la vida de otras mujeres.
        </p>
      </div>

      <!-- Footer del certificado -->
      <div class="mt-12 grid grid-cols-2 gap-4 items-center pt-10 text-center">
        <div class="pt-4">
          <p class="text-lg font-medium text-gray-800">Jhovany Sanchezz</p>
          <div class="border-t border-gray-300 pt-4"></div>
          <p class="text-sm -m-4 text-gray-600">
            CEO de Encantada de Conocerme
          </p>
        </div>
        <div class="pt-4">
          <p class="text-lg font-medium text-gray-800">{{ authorName }}</p>
          <div class="border-t border-gray-300 pt-4"></div>
          <p class="text-sm -m-4 text-gray-600">Coach y Facilitadora</p>
        </div>
      </div>
      <!-- Fecha -->
      <div
        class="absolute bottom-9 left-1/2 transform -translate-x-1/2 text-center"
      >
        <p class="text-gray-500">{{ formatDate(certificationDate) }}</p>
      </div>
      <!-- Canvas QR -->
      <div class="absolute bottom-10 right-28">
        <canvas ref="qrCanvas" width="128" height="128"></canvas>
      </div>
      
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/axiosConfig.js";
import QRCode from "qrcode"; // Importa la librería

export default {
  data() {
    return {
      recipientName: "",
      courseName: "",
      courseHours: 0,
      certificationDate: "",
      authorName: "",
      decryptedData: null, // Para almacenar los datos desencriptados
      showQRModal: false,
      encryptedData: null, // Datos encriptados para generar el QR
    };
  },
  mounted() {
    // Cambiado de onMounted a mounted
    const route = useRoute();
    const idUsuario = route.params.idUsuario; // Verifica que este parámetro esté definido en tus rutas
    const idCurso = route.query.idCurso; // Verifica que este parámetro esté definido en tus rutas

    // Llamar a la función de obtención de datos
    this.fetchData(idUsuario, idCurso);
    console.log(idUsuario, idCurso);
  },
  methods: {
    async fetchData(idUsuario, idCurso) {
      try {
        const response = await api.get(
          `/recibosSinPermiso/detallesCertificado/${idUsuario}?idCurso=${idCurso}`
        );
        const data = response.data;
        // Asignar los datos a las propiedades
        this.recipientName =
          data.nombreCompletoUsuario || "Nombre del Participante";
        this.courseName = data.tituloCurso || "Curso de Liderazgo y Motivación";
        this.courseHours = data.duracionCurso || 40;
        this.certificationDate =
          data.fechaEvaluacion || "15 de noviembre de 2023";
        this.authorName = data.nombreCompletoCreador || "María Fernanda Gómez";
        // Guardar los datos encriptados
        this.encryptedData = data.encryptedData;
        const canvas = this.$refs.qrCanvas;

      // Generamos el QR en el canvas usando los datos encriptados
      QRCode.toCanvas(canvas, this.encryptedData, { width: 128 }, (error) => {
        if (error) console.error(error);
        console.log("QR Code generado exitosamente.");
        // Copiar el QR al canvas del modal
      });
        // Generar el QR con los datos encriptados
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    formatDate(dateString) {
      const options = { day: "numeric", month: "long", year: "numeric" };
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", options);
    },
  },
};
</script>

<style scoped>
/* Estilo adicional si lo necesitas */
</style>
