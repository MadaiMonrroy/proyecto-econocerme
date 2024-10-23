import puppeteer from "puppeteer";
import connection from "../db.js";
import path from "path";
import fs from "fs-extra";

export const incripcionesCurso = async (req, res) => {

  try {
      // Recibir los datos del request
      const { startDate, endDate, courses } = req.body; // Asegúrate de que los datos lleguen en el cuerpo del request
    // Definir la ruta donde se guardará el certificado PDF
    const outputDir = path.resolve("uploads/reportes");
    console.log(req.body)
    // Crear el directorio si no existe
    if (!fs.existsSync(outputDir)) {
      await fs.mkdir(outputDir, { recursive: true });
    }

    // Inicializar Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    const url = `http://localhost:5173/vpReporteInscripcionesCurso?startDate=${startDate}&endDate=${endDate}&courses=${courses}`;

    // Navegar a la URL donde se generará el certificado
    await page.goto(url, { waitUntil: "networkidle2" });

    // Generar el PDF del certificado
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "5mm",
        right: "0mm",
        bottom: "5mm",
        left: "0mm",
      },
      displayHeaderFooter: false,
    });

    // Cerrar el navegador
    await browser.close();

    const pdfFilename = `reporte-${Date.now()}.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);

    // Eliminar cualquier archivo PDF anterior en la carpeta, si es necesario
    const files = await fs.readdir(outputDir);
    for (const file of files) {
      if (file.endsWith(".pdf")) {
        await fs.unlink(path.join(outputDir, file)); // Eliminar archivos existentes
      }
    }

    // Guardar el archivo PDF en el servidor
    await fs.writeFile(pdfPath, pdfBuffer);

    // Generar la URL pública del certificado PDF
    const pdfUrl = `http://localhost:3000/uploads/reportes/${pdfFilename}`;

    // Enviar la URL del certificado como respuesta
    res.send({ url: pdfUrl });
  } catch (error) {
    console.error("Error al generar el certificado PDF:", error);
    res.status(500).send("No se pudo generar el certificado PDF");
  }
};
