import puppeteer from "puppeteer";
import connection from "../db.js";
import path from "path";
import fs from "fs-extra";
// Función para obtener el recibo de pago basado en el id de inscripción
export const obtenerReciboPago = async (req, res) => {
  const { id } = req.params; // Obtener el ID de la inscripción de los parámetros

  try {
    const recibo = await obtenerDatosRecibo(id); // Consulta a la base de datos

    if (!recibo) {
      return res.status(404).json({ message: "Recibo no encontrado" });
    }

    res.json(recibo); // Retornar los datos del recibo
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el recibo de pago" });
  }
};

export const detalleInscripcionPago = async (req, res) => {
  const idInscripcion = req.params.idInscripcion;
  const idCuotaPago = req.query.idCuotaPago; // Obteniendo idCuotaPago desde los query params

  console.log("yo soy el idCuotapago", idCuotaPago);
  console.log("Resultado de la consulta:", idInscripcion); // Depura los resultados de la consulta

  // Construir la consulta SQL
  let query = `
        WITH cuotas AS (
            SELECT 
                cp.idCuotaPago,
                ROW_NUMBER() OVER (PARTITION BY p.idInscripcion ORDER BY cp.fechaVencimiento) AS numeroCuota,
                cp.fechaVencimiento,
                cp.fechaPagoCuota,
                cp.metodoPago,
                cp.estadoCuota AS estadoCuota,
                COUNT(cp.idCuotaPago) OVER (PARTITION BY p.idInscripcion) AS cantidadCuotas,
                p.idInscripcion
            FROM cuota_pago cp
            JOIN pago p ON cp.idPago = p.idPago
            WHERE p.idInscripcion = ?  -- Parámetro para filtrar por idInscripcion
        )
        SELECT 
            cu.idCuotaPago,
            cu.numeroCuota,
            i.fechaInscripcion,
            CONCAT(u.nombres, ' ', u.primerApellido, ' ', u.segundoApellido) AS nombreCompleto,
            c.titulo AS curso,
            c.precio AS precioCurso,
            cu.cantidadCuotas,
            cu.fechaPagoCuota,
            cu.metodoPago,
            cu.estadoCuota,
            cu.fechaVencimiento AS fechaVencimientoCuota
        FROM cuotas cu
        JOIN detalle_inscripcion di ON cu.idInscripcion = di.idInscripcion
        JOIN curso c ON di.idCurso = c.idCurso
        JOIN inscripcion i ON cu.idInscripcion = i.idInscripcion
        JOIN usuario u ON i.idUsuario = u.id
    `;

  // Si hay idCuotaPago, agregar el WHERE
  let params = [idInscripcion];
  if (idCuotaPago) {
    query += " WHERE cu.idCuotaPago = ?";
    params.push(idCuotaPago); // Agregar el parámetro idCuotaPago
  }

  query += " ORDER BY cu.numeroCuota;";

  try {
    const [rows] = await connection.query(query, params); // Pasar todos los parámetros
    console.log("Resultado de la consulta:", rows); // Depura los resultados de la consulta

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener el detalle de inscripción:", error.message);
    return res.status(500).send("Error al obtener el detalle de inscripción.");
  }
};

// Función para obtener el screenshot del recibo
export const obtenerScreenshotRecibo = async (req, res) => {
  const { id } = req.params;

  try {
    // Construir la URL de la vista en el frontend
    const url = `http://localhost:5173/reciboPago/${id}`; // Cambia esto si tu vista tiene una URL diferente

    // Generar el "screenshot"
    const screenshotBuffer = await generarScreenshot(url);

    // Enviar el "screenshot" como respuesta
    res.set({
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename=recibo_${id}.png`,
    });
    res.send(screenshotBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al generar el screenshot" });
  }
};

// Función auxiliar para generar el "screenshot"
const generarScreenshot = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" }); // Navegar a la URL y esperar a que se cargue
  const screenshotBuffer = await page.screenshot({ fullPage: true });
  await browser.close();

  return screenshotBuffer;
};
// export const generarPdf = async (req, res) => {
//     // const { idInscripcion, idCuotaPago } = req.query; // Obtener parámetros
//     console.log(req.body)

//     try {
//       // Abrir Puppeteer
//       const browser = await puppeteer.launch({ headless: true });
//       const page = await browser.newPage();

//       // URL del frontend para la vista del recibo
//       const url = `http://localhost:5173/generarPdf?idInscripcion=${idInscripcion}&idCuotaPago=${idCuotaPago}`;

//       // Navegar a la URL y esperar que la página cargue completamente
//       await page.goto(url, { waitUntil: 'networkidle2' });

//       // Generar el PDF
//       const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

//       // Cerrar Puppeteer
//       await browser.close();

//       // Configurar el encabezado y enviar el PDF como respuesta
//       res.set({
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': 'attachment; filename="reporte.pdf"',
//       });

//       res.send(pdfBuffer);
//     } catch (error) {
//       console.error('Error al generar el PDF:', error);
//       res.status(500).send('Error al generar el PDF');
//     }
//   };

export const generarPdf = async (req, res) => {
  const { idInscripcion, idCuotaPago } = req.body; // Recibir la URL desde el cuerpo de la solicitud
  console.log("estos datos estan llegando", idInscripcion, idCuotaPago);
  try {
    // Inicializar Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    const url = `http://localhost:5173/generarPdf/${idInscripcion}?idCuotaPago=${idCuotaPago}`;

    // Navegar a la URL proporcionada
    await page.goto(url, { waitUntil: "networkidle2" });
    // Generar el PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `,
      scale: 0.8,
    });

    // Cerrar el navegador
    await browser.close();

    // Definir la ruta donde se guardará el archivo PDF
    const outputDir = path.resolve("uploads/pdfs"); // Carpeta donde guardarás los PDFs
    const pdfFilename = `url-report-${Date.now()}.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);

    // Eliminar cualquier archivo PDF existente en la carpeta
    const files = await fs.readdir(outputDir);
    for (const file of files) {
      if (file.endsWith(".pdf")) {
        await fs.unlink(path.join(outputDir, file)); // Eliminar el archivo existente
      }
    }

    // Crear el directorio si no existe
    if (!fs.existsSync(outputDir)) {
      await fs.mkdir(outputDir, { recursive: true });
    }

    // Guardar el archivo PDF en el servidor
    await fs.writeFile(pdfPath, pdfBuffer);

    // Generar la URL pública del archivo PDF
    const pdfUrl = `http://localhost:3000/uploads/pdfs/${pdfFilename}`; // Cambia el puerto si es necesario

    // Enviar la URL del PDF como respuesta
    res.send({ url: pdfUrl });
  } catch (error) {
    console.error("Error al generar el PDF desde URL:", error);
    res.status(500).send("No se pudo generar el PDF desde la URL");
  }
};
