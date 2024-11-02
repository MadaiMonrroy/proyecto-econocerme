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
    console.log(req.body);
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

export const resumenGeneralAdmin = async (req, res) => {
  try {
    const result = {};
    // Ajustar el idioma de los nombres de los meses a español
    await connection.query(`SET lc_time_names = 'es_ES'`);
    // 1. Estudiantes Activos
    const [estudiantesActivos] = await connection.query(`
      SELECT COUNT(DISTINCT idUsuario) AS totalEstudiantes
      FROM inscripcion
      WHERE estado = 1;
    `);
    result.estudiantesActivos = estudiantesActivos[0].totalEstudiantes;

    // 2. Total de Cursos Activos
    const [cursosActivos] = await connection.query(`
      SELECT COUNT(*) AS totalCursos
      FROM curso
      WHERE estado = 1;
    `);
    result.cursosActivos = cursosActivos[0].totalCursos;

    // 3. Ingresos del Mes
    const [ingresosMes] = await connection.query(`
      SELECT SUM(montoCuota) AS totalIngresos
      FROM cuota_pago
      WHERE MONTH(fechaPagoCuota) = MONTH(CURRENT_DATE())
      AND YEAR(fechaPagoCuota) = YEAR(CURRENT_DATE());
    `);
    result.ingresosMes = ingresosMes[0].totalIngresos || 0;

    // 4. Nuevas Inscripciones
    const [nuevasInscripciones] = await connection.query(`
      SELECT COUNT(*) AS totalInscripciones
      FROM inscripcion
      WHERE MONTH(fechaInscripcion) = MONTH(CURRENT_DATE())
      AND YEAR(fechaInscripcion) = YEAR(CURRENT_DATE());
    `);
    result.nuevasInscripciones = nuevasInscripciones[0].totalInscripciones || 0;

    // 5. Anuncios Activos
    const [anunciosActivos] = await connection.query(`
      SELECT COUNT(*) AS totalAnuncios
      FROM anuncio
      WHERE estado = 1;
    `);
    result.anunciosActivos = anunciosActivos[0].totalAnuncios || 0;

    // 6. Promedio modulos por Curso
    const leccionesPorCurso = await connection.query(`
      SELECT ROUND(AVG(totalModulos), 2) AS promedioModulosPorCurso
      FROM (
      SELECT COUNT(*) AS totalModulos
      FROM modulo
      GROUP BY idCurso
      ) AS subquery;
    `);
    result.leccionesPorCurso = leccionesPorCurso[0].promedioModulosPorCurso || 0;

    // 7. Promedio Inscripciones por Curso
    const [inscripcionesActivas] = await connection.query(`
      SELECT ROUND(AVG(totalInscripciones), 2) AS promedioInscripcionesPorCurso
FROM (
    SELECT COUNT(i.idInscripcion) AS totalInscripciones
    FROM inscripcion i
    INNER JOIN detalle_inscripcion di ON di.idInscripcion = i.idInscripcion
    WHERE i.estado = 1
    GROUP BY di.idCurso
) AS subquery;
    `);
    result.inscripcionesActivas =
      inscripcionesActivas[0].totalInscripcionesActivas || 0;

    // 8. Estudiantes con Deuda
    const [estudiantesConDeuda] = await connection.query(`
      SELECT ROUND(AVG(totalInscripciones), 2) AS promedioInscripcionesPorCurso
FROM (
    SELECT COUNT(i.idInscripcion) AS totalInscripciones
    FROM inscripcion i
    INNER JOIN detalle_inscripcion di ON di.idInscripcion = i.idInscripcion
    WHERE i.estado = 1
    GROUP BY di.idCurso
) AS subquery;
    `);
    result.estudiantesConDeuda = estudiantesConDeuda[0].promedioInscripcionesPorCurso ;

    // 9. Distribución de Métodos de Pago
    const metodosPago = await connection.query(`
SELECT metodoPago, COUNT(*) AS total
      FROM cuota_pago
      WHERE cuota_pago.estadoCuota =1
      GROUP BY metodoPago;
    `);
    result.metodosPago = metodosPago;

    // 10. Comparación de Cursos Más Populares que estan por encima del promedio de inscritos
    const cursosPopulares = await connection.query(`
      WITH TotalInscripciones AS (
    SELECT c.idCurso, c.titulo, COUNT(*) AS totalInscripciones
    FROM inscripcion i
    INNER JOIN detalle_inscripcion di ON di.idInscripcion = i.idInscripcion
    INNER JOIN curso c ON c.idCurso = di.idCurso
    WHERE i.estado = 1
    GROUP BY di.idCurso
    ),
    PromedioInscripciones AS (
    SELECT AVG(totalInscripciones) AS promedio
    FROM TotalInscripciones
    )
    SELECT t.idCurso, t.titulo, t.totalInscripciones
    FROM TotalInscripciones t
  CROSS JOIN PromedioInscripciones p
  WHERE t.totalInscripciones > p.promedio
ORDER BY t.totalInscripciones DESC;
    `);
    result.cursosPopulares = cursosPopulares;

    // 11. Progreso de Pagos por Estado
    const progresoPagos = await connection.query(`
      SELECT estadoCuota, COUNT(*) AS total
      FROM cuota_pago
      GROUP BY estadoCuota;
    `);
    result.progresoPagos = progresoPagos;

    // 12. Inscripciones vs Ingresos
    const inscripcionesVsIngresos = await connection.query(`

      SELECT MONTHNAME(fechaInscripcion) AS mes, COUNT(*) AS totalInscripciones
      FROM inscripcion
      WHERE inscripcion.estado = 1
      GROUP BY MONTHNAME(fechaInscripcion);
    `);
    const ingresosMensuales = await connection.query(`

      SELECT MONTHNAME(fechaPagoCuota) AS mes, SUM(montoCuota + montoMora) AS totalIngresos
      FROM cuota_pago 
      WHERE cuota_pago.estadoCuota = 1
      GROUP BY MONTHNAME(fechaPagoCuota);
    `);
    result.inscripcionesVsIngresos = {
      inscripciones: inscripcionesVsIngresos,
      ingresos: ingresosMensuales,
    };

    // 13. Ingresos vs Número de Estudiantes
    const ingresosPorCurso = await connection.query(`
      SELECT c.idCurso, c.titulo, SUM(cp.montoCuota + cp.montoMora) AS totalIngresos, COUNT(DISTINCT i.idUsuario) AS totalEstudiantes
      FROM curso c
      INNER JOIN detalle_inscripcion di ON di.idCurso = c.idCurso
      INNER JOIN inscripcion i ON di.idInscripcion = i.idInscripcion
      INNER JOIN pago p ON i.idInscripcion = p.idInscripcion
      INNER JOIN cuota_pago cp ON cp.idPago = p.idPago
      WHERE i.estado = 1 
      GROUP BY c.idCurso, c.titulo;
    `);
    result.ingresosPorCurso = ingresosPorCurso;

    // 14. Tasa de Finalización de Cursos
    const [tasaFinalizacion] = await connection.query(`
      SELECT COUNT(DISTINCT idUsuario) / 
        (SELECT COUNT(DISTINCT i.idUsuario)
         FROM inscripcion i WHERE i.estado = 1) * 100 AS porcentajeFinalizacion
      FROM evaluacion
WHERE MONTH(fechaCreacion) = MONTH(CURDATE())
AND notaFinal >= 70;
    `);
    result.tasaFinalizacion = tasaFinalizacion[0].porcentajeFinalizacion || 0;

    // 15. Ratio de Cursos con Evaluaciones Activas
    const [ratioEvaluacionesActivas] = await connection.query(`
	SELECT (SELECT COUNT(DISTINCT idCurso) FROM pregunta_respuesta) / 
	(SELECT COUNT(idCurso) FROM curso WHERE curso.estado=1) * 100 AS porcentajeEvaluacionesActivas;
        
    `);
    result.ratioEvaluacionesActivas =
      ratioEvaluacionesActivas[0].porcentajeEvaluacionesActivas || 0;

    // 16. Tiempo Promedio para Completar un Curso
    const [tiempoPromedio] = await connection.query(`
      SELECT AVG(DATEDIFF(e.fechaCreacion, i.fechaInscripcion)) AS tiempoPromedioDias
      FROM inscripcion i
      INNER JOIN detalle_inscripcion di ON di.idInscripcion = i.idInscripcion
      INNER JOIN evaluacion e ON di.idCurso = e.idCurso
      WHERE e.notaFinal IS NOT NULL;
    `);
    result.tiempoPromedio = tiempoPromedio[0].tiempoPromedioDias || 0;

    // 18. Ratio de Inscripciones vs Pagos Completados
    const [ratioInscripcionesPagos] = await connection.query(`
SELECT (SELECT COUNT(*) FROM pago WHERE estado = 1) / 
        (SELECT COUNT(idInscripcion) FROM inscripcion WHERE inscripcion.estado = 1) * 100 AS porcentajePagosCompletados;
    `);
    result.ratioInscripcionesPagos =
    ratioInscripcionesPagos[0].porcentajePagosCompletados || 0;

    res.json(result);
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    res.status(500).send("Error al generar el reporte");
  }
};
