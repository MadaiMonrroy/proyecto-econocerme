<template>
  <div class="card p-4">
    <h2 class="text-2xl font-semibold mb-4 text-center">
      Detalle de Inscripción - Pago {{ data[0]?.numeroCuota }} /
      {{ data[0]?.cantidadCuotas }}
    </h2>

    <label class="font-semibold text-right">Nombre Completo:</label>
    <label class="p-2 text-right">{{ data[0]?.nombreCompleto }}</label><br />
    <label class="font-semibold text-right">Fecha de Vencimiento:</label>
    <label class="p-2 text-right">{{ formatDate(data[0]?.fechaVencimientoCuota) }}</label><br />
    <label class="pt-8 font-semibold text-right">Fecha de Pago:</label>
    <label class="p-2 text-right">{{ formatDate(data[0]?.fechaPagoCuota) }}</label>

    <!-- Contenedor para la tabla con overflow -->
    <div class="pt-4 overflow-x-auto">
      <table class="min-w-full pt-8 !border-0">
        <thead>
          <tr class="whitespace-nowrap bg-violet-200 dark:text-violet-50 dark:bg-violet-950">
            <th class="border border-violet-950 dark:border-violet-50 px-2 py-4 w-5 text-center">CANT.</th>
            <th class="border border-violet-950 dark:border-violet-50 px-2 py-2 w-48 text-left">CURSOS(S)</th>
            <th class="border border-violet-950 dark:border-violet-50 px-2 py-2 w-32 text-right">PRECIO</th>
            <th class="border border-violet-950 dark:border-violet-50 px-2 py-2 w-32 text-right">CARGO ADICIONAL</th>
            <th class="border border-violet-950 dark:border-violet-50 px-2 py-2 w-32 text-right">SUB TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row) in data" :key="row.idCuotaPago" class="whitespace-nowrap">
            <!-- <td class="border border-violet-950 dark:border-violet-50 px-2 py-2 text-center w-5">
              {{ index + 1 }} 
            </td> -->
            <td class="border border-violet-950 dark:border-violet-50 px-2 py-2 text-center w-5">
              1
            </td>
            <td class="border border-violet-950 dark:border-violet-50 px-2 py-2 w-48">{{ row.curso }}</td>
            <td class="border border-violet-950 dark:border-violet-50 px-2 py-2 text-right w-32">
              {{ formatCurrency(row.precioCurso) }}
            </td>
            <td class="border border-violet-950 dark:border-violet-50 px-2 py-2 text-right w-32">
              {{ calculateFivePercent(row) }}
            </td>
            <td class="border border-violet-950 dark:border-violet-50 px-2 py-2 text-right w-32">
              {{ calculateIncreasedPrice(row) }}
            </td>
          </tr>
          <!-- Fila para Totales -->
          <tr>
            <td class=" px-2 py-2 font-semibold text-right" colspan="4">
              TOTAL Bs.
            </td>
            <td class="border border-violet-950 dark:border-violet-50 px-2 py-2 text-right">
              {{ calculateTotalIncreasedPrice() }}
            </td>
          </tr>
          <tr>
            <td class=" px-2 py-2 font-semibold text-right" colspan="4">
              CANTIDAD DE CUOTAS:
            </td>
            <td class="border border-violet-950 dark:border-violet-50 px-2 py-2 text-right">
              {{ data[0]?.cantidadCuotas }}
            </td>
          </tr>
          <tr>
            <td class=" px-2 py-2 font-semibold text-right" colspan="4">
              MONTO POR CUOTA Bs.
            </td>
            <td class="border border-violet-950 dark:border-violet-50 px-2 py-2 text-right">
              {{ calculateMontoCuota() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Datos adicionales al pie de la tabla -->
    <div class="pt-4">
      <label class="p-2 text-left font-semibold">Son: {{ montoCuotaLiteral }}</label> <br>
      <label class="p-2 font-semibold text-right">Método de pago:</label>
      <label class="p-2 text-left uppercase">{{ data[0]?.metodoPago }}</label>
      <Button @click="generatePdf" severity="help">Generar Recibo</Button>

    </div>

  </div>
</template>





<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/axiosConfig.js";
import { useRouter } from "vue-router";

// Datos reactivos para la tabla
const data = ref([]);
const montoCuotaLiteral = ref(""); // Guardar el monto en palabras
const route = useRoute();
const router = useRouter();

function numeroALetras(num) {
  const unidades = [
    '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'
  ];
  const decenas = [
    '', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
  ];
  const especiales = [
    'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'
  ];
  const centenas = [
    '', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
  ];

  if (num === 0) return 'CERO';
  if (num === 100) return 'CIEN';

  let letras = '';

  // Para manejar números hasta 10,000
  if (num >= 1000) {
    if (num === 1000) {
      letras = 'MIL ';
    } else if (num < 2000) {
      letras = 'MIL ' + numeroALetras(num % 1000);
    } else {
      letras = unidades[Math.floor(num / 1000)] + ' MIL ' + numeroALetras(num % 1000);
    }
  } else if (num >= 100) {
    letras = centenas[Math.floor(num / 100)] + ' ' + numeroALetras(num % 100);
  } else if (num >= 20) {
    letras = decenas[Math.floor(num / 10)] + (num % 10 > 0 ? ' Y ' + unidades[num % 10] : '');
  } else if (num >= 11 && num <= 19) {
    letras = especiales[num - 11];
  } else {
    letras = unidades[num];
  }

  return letras.trim();
}

// async function generatePdf() {
//   const idInscripcion = route.params.idInscripcion;
//   const idCuotaPago = route.query.idCuotaPago;

//   // URL del backend que genera el PDF
//   const backendUrl =(`http://localhost:3000/api/recibos/generarPdf?idInscripcion=${idInscripcion}&idCuotaPago=${idCuotaPago}`);

//   // Abrir el PDF generado en una nueva pestaña
//   window.open(backendUrl);
// }
async function generatePdf() {
  try {
    const idInscripcion = route.params.idInscripcion;
    const idCuotaPago = route.query.idCuotaPago;

    const response = await api.post("/recibos/generarPdf", {
      idInscripcion,
      idCuotaPago
    });

    if (response.data.url) {
      window.open(response.data.url);
    } else {
      throw new Error('No se pudo generar el PDF.');
    }
  } catch (error) {
    console.error('Error generando el PDF:', error);
    alert('Hubo un problema al generar el PDF. Intenta nuevamente.');
  }
}

// Función para convertir el monto a letras, incluyendo decimales
function convertirMontoCuota(monto) {
  const enteros = Math.floor(monto);
  const centavos = Math.round((monto - enteros) * 100);
  
  const letrasEnteros = numeroALetras(enteros);
  const letrasCentavos = centavos > 0 ? `${centavos}/100` : "00/100";

  return `${letrasEnteros} ${letrasCentavos} BOLIVIANOS`;
}


// Función para formatear fechas
function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
}

// Función para formatear moneda
function formatCurrency(amount) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(amount);
}
// Función para convertir el monto total a palabras y asignarlo a `montoCuotaLiteral`
function convertMontoCuotaToWords() {
  const monto = parseFloat(calculateMontoCuota());

  if (isNaN(monto)) return ""; // Manejar caso de NaN

  const montoEnPalabras = convertirMontoCuota(monto);
  return montoEnPalabras.toUpperCase(); // Convertir a mayúsculas
}




// Función para obtener los datos
async function fetchData(idInscripcion, idCuotaPago) {
  try {
    const response = await api.get(
      `/recibos/detalleInscripcionPago/${idInscripcion}?idCuotaPago=${idCuotaPago}`
    );
    // Asignar datos al valor reactivo
    data.value = response.data;
    calculateValues();
    montoCuotaLiteral.value = convertMontoCuotaToWords(); 

  } catch (error) {
    console.error("Error al obtener los detalles de inscripción:", error);
  }
}

// Función para calcular el monto de la cuota
function calculateMontoCuota() {
  const totalPrecio = parseFloat(calculateTotalIncreasedPrice());
  const cantidadCuotas = data.value[0]?.cantidadCuotas;

  // Asegurarse de que no sea cero para evitar división por cero
  return cantidadCuotas > 0
    ? (totalPrecio / cantidadCuotas).toFixed(2)
    : "0.00";
}

// Método para calcular el 5% y el precio incrementado
function calculateValues() {
  data.value = data.value.map((row) => {
    if (row) {
      row.fivePercent =
        data.value[0]?.cantidadCuotas >= 2
          ? (parseFloat(row.precioCurso) * 0.05).toFixed(2)
          : "0.00";
      row.increasedPrice =
        data.value[0]?.cantidadCuotas >= 2
          ? (parseFloat(row.precioCurso) * 1.05).toFixed(2)
          : row.precioCurso;
    }
    return row;
  });
}

// Métodos para calcular los valores de las columnas
function calculateFivePercent(row) {
  return row.fivePercent !== undefined ? row.fivePercent : "-";
}

function calculateIncreasedPrice(row) {
  return row.increasedPrice !== undefined ? row.increasedPrice : "-";
}

// Función para sumar el increasedPrice
function calculateTotalIncreasedPrice() {
  return data.value
    .filter((row) => row.increasedPrice !== "-")
    .reduce((acc, row) => acc + parseFloat(row.increasedPrice), 0)
    .toFixed(2);
}

// Obtener los parámetros al montar el componente
onMounted(() => {
  const route = useRoute();
  const idInscripcion = route.params.idInscripcion;
  const idCuotaPago = route.query.idCuotaPago;
  // Llamar a la función de obtención de datos
  fetchData(idInscripcion, idCuotaPago);
});

// Usar watch para observar cambios en `data`
watch(data, (newData) => {
  console.log("Datos actualizados:", JSON.stringify(newData, null, 2));
});
</script>

<style scoped>
/* Estilos opcionales */
</style>
