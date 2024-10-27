<template>
  <div class="flex justify-center items-center min-h-screen -m-8">
    <div>
      

      <!-- Diálogo para mostrar el QR y el componente de escaneo -->
      <Dialog
        v-model:visible="showQRModal"
        header="Escanear Código QR"
        :modal="true"
        class="max-w-96"
        @show="handleQRCodeScan"
      >
        <div class="qr-container">
          <canvas ref="qrCanvasModal" width="128" height="128"></canvas>
        </div>
        <!-- Aquí podrías mostrar los datos desencriptados -->
        <div v-if="decryptedData" class="max-w-32">
          <h3>Datos Desencriptados:</h3>
          <pre>{{ decryptedData }}</pre>
        </div>
      </Dialog>
    </div>
    <div
      class="relative w-[900px] h-[650px] bg-white dark:bg-gray-950 shadow-2xl border border-blue-300 rounded-lg overflow-hidden p-10"
    >
      <!-- Decoraciones laterales -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div
          class="absolute top-0 left-0 w-[150px] h-[150px] bg-gradient-to-r from-custom-purple to-custom-pink rounded-br-full opacity-70"
        ></div>
        <div
          class="absolute bottom-0 right-0 w-[150px] h-[150px] bg-gradient-to-l from-custom-purple to-custom-pink rounded-tl-full opacity-70"
        ></div>
        <div
          class="absolute top-0 left-[-50px] w-[130px] h-full bg-gradient-to-r from-blue-300 to-transparent"
        ></div>
        <div
          class="absolute top-[20%] left-[-40px] w-[80px] h-[80px] bg-blue-300 rounded-full"
        ></div>
        <div
          class="absolute top-[30%] left-[-30px] w-[100px] h-[100px] bg-blue-200 rounded-full"
        ></div>

        <div
          class="absolute top-0 right-[-50px] w-[130px] h-full bg-gradient-to-l from-blue-300 to-transparent"
        ></div>
        <div
          class="absolute top-[65%] right-[-40px] w-[80px] h-[80px] bg-blue-300 rounded-full"
        ></div>
        <div
          class="absolute top-[70%] right-[-30px] w-[100px] h-[100px] bg-blue-200 rounded-full"
        ></div>
      </div>

      <!-- Botón Volver -->
      <Button
        class="absolute -top-5 -left-5 font-semibold py-2 px-4 rounded-2xl"
        @click="goBack"
        text=""
        icon="pi pi-arrow-left"
        raised=""
        label="Volver a las Certificaciones"
        severity="contrast"
        outlined=""
      >
      </Button>
      <!-- Botón Imprimir -->
      <Button
        class="absolute -top-5 -right-[530px] bg-green-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-green-600 transition"
        @click="printCertificate"
        label="Imprimir"
        icon="pi pi-print"
        raised=""
        text=""
        severity="contrast"
        outlined=""
      >
      </Button>
      <!-- Encabezado del certificado -->
      <div class="text-center mb-8 -mt-8">
        <img
          src="@/assets/logoec.svg"
          alt="Logo"
          class="dark:brightness-0 dark:invert mx-auto w-48 h-32"
        />
        <h2 class="text-4xl font-bold -pt-2 tracking-widest text-gray-800">
          CERTIFICADO DE FINALIZACIÓN
        </h2>
        <p class="text-lg font-medium text-gray-600 mt-3">Otorgado a:</p>
        <h1
          class="text-5xl font-serif text-dark-purple dark:text-dark-pink mt-2"
        >
          {{ recipientName }}
        </h1>
      </div>

      <!-- Cuerpo del certificado -->
      <div class="px-10 text-center pt-2">
        <p class="text-lg leading-relaxed text-gray-700">
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
      <div class="mt-2 grid grid-cols-2 gap-4 items-center pt-7 text-center">
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
      <div class="absolute bottom-9 right-9">
        <canvas ref="qrCanvas" width="128" height="128"></canvas>
      </div>

      <!-- Botón para abrir el diálogo -->
      <Button
      class="absolute  top-[85px] right-2 font-semibold py-2 px-4 rounded-2xl"
        label="Abrir QR"
        icon="pi pi-qrcode"
        @click="showQRModal = true"
        raised=""
        text=""
        severity="contrast"
        outlined=""
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/axiosConfig.js";
import QRCode from "qrcode"; // Importa la librería
import jsQR from "jsqr"; // Importa jsQR para leer QR desde imágenes/canvas

export default {
  components: {},
  data() {
    return {
      recipientName: "",
      courseName: "",
      courseHours: 0,
      certificationDate: "",
      authorName: "",
      idUsuario: "", // Agrega esta línea
      idCurso: "", // Agrega esta línea
      decryptedData: null, // Para almacenar los datos desencriptados
      showQRModal: false,
      encryptedData: null, // Datos encriptados para generar el QR
    };
  },
  mounted() {
    const route = useRoute();
    this.idUsuario = route.params.idUsuario; // Asigna a la propiedad
    this.idCurso = route.query.idCurso; // Asigna a la propiedad

    this.fetchData(this.idUsuario, this.idCurso);
  },

  methods: {
    async fetchData(idUsuario, idCurso) {
      try {
        const response = await api.get(
          `/recibosSinPermiso/detallesCertificado/${idUsuario}?idCurso=${idCurso}`
        );
        const data = response.data;
        this.recipientName =
          data.nombreCompletoUsuario || "Nombre del Participante";
        this.courseName = data.tituloCurso || "Curso de Liderazgo y Motivación";
        this.courseHours = data.duracionCurso || 40;
        this.certificationDate =
          data.fechaEvaluacion || "15 de noviembre de 2023";
        this.authorName = data.nombreCompletoCreador || "María Fernanda Gómez";

        // Guardar los datos encriptados
        this.encryptedData = data.encryptedData;

        // Generar el QR con los datos encriptados
        this.generateQRCode(this.encryptedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    async handleQRCodeScan() {
      console.log("QR Code scanned:", this.encryptedData); // Añade esta línea

      try {
        // Enviamos el string decodificado como un parámetro en la URL
        const response = await api.get(
          `/recibosSinPermiso/desencriptar/${this.encryptedData}`
        );
        this.decryptedData = response.data; // Almacena los datos desencriptados
        this.generateQRCodeDesc(this.decryptedData);
      } catch (error) {
        console.error("Error al desencriptar los datos:", error);
      }
    },
    async generateQRCodeDesc(decryptedData) {
      if (!decryptedData) {
        console.error("No se puede generar el QR: no hay datos encriptados.");
        return; // Salir si no hay datos
      }

      const canvasModal = this.$refs.qrCanvasModal;

      // Generamos el QR en el canvas usando los datos encriptados
      QRCode.toCanvas(
        canvasModal,
        JSON.stringify(decryptedData),
        { width: 128 },
        (error) => {
          if (error) console.error(error);
          console.log("QR Code generado exitosamente.");
          // Copiar el QR al canvas del modal
        }
      );
    },
    async generateQRCode(encryptedData) {
      if (!encryptedData) {
        console.error("No se puede generar el QR: no hay datos encriptados.");
        return; // Salir si no hay datos
      }

      const canvas = this.$refs.qrCanvas;

      // Generamos el QR en el canvas usando los datos encriptados
      QRCode.toCanvas(canvas, encryptedData, { width: 128 }, (error) => {
        if (error) console.error(error);
        console.log("QR Code generado exitosamente.");
        // Copiar el QR al canvas del modal
      });
    },
    // copyQRCodeToModal() {
    //   const canvasModal = this.$refs.qrCanvasModal;
    //   const canvas = this.$refs.qrCanvas;

    //   const contextModal = canvasModal.getContext("2d");
    //   console.log("esto es canvas", canvas)
    //   console.log("esto es canvasModal", canvas)
    //   if (canvas) {
    //     contextModal.drawImage(canvas, 0, 0);
    //     const imageData = contextModal.getImageData(0, 0, canvasModal.width, canvasModal.height);
    // console.log("Datos de imagen en canvasModal:", imageData);
    //   } else {
    //     console.error("El canvas del certificado no está disponible.");
    //   }
    // },
    formatDate(dateString) {
      const options = { day: "numeric", month: "long", year: "numeric" };
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", options);
    },
    goBack() {
      // Aquí puedes agregar la lógica para volver a la página anterior
      this.$router.push("/panelEstudiante/certificaciones"); // Cambia 'nombreRutaCertificaciones' por la ruta correcta
    },
    async printCertificate() {
      try {
        const response = await api.post("/evaluaciones/generarCertificado", {
          idUsuario: this.idUsuario, // Usa this para acceder a la propiedad
          idCurso: this.idCurso, // Usa this para acceder a la propiedad
        });

        if (response.data.url) {
          window.open(response.data.url);
        } else {
          throw new Error("No se pudo generar el PDF.");
        }
      } catch (error) {
        console.error("Error al generar certificado:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo generar el certificado",
          life: 3000,
        });
      }
    },
  },
};
</script>

<style scoped>
/* Estilo adicional si lo necesitas */
</style>
