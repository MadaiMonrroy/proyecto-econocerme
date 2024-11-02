import puppeteer from "puppeteer";
import connection from "../db.js";
import path from "path";
import fs from "fs-extra";
import crypto from "crypto"; // Importar la librería de encriptación

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef"; // Clave de 32 bytes
const IV_LENGTH = 16;
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

// Función para encriptar datos
const encrypt = (text) => {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const detallesCertificado = async (req, res) => {
  const idUsuario = req.params.idUsuario;
  const idCurso = req.query.idCurso;
  const query = `
    WITH NotaMaxima AS (
      SELECT 
        e.idCurso,
        e.idUsuario,
        MAX(e.notaFinal) AS notaMaxima,
        MAX(e.fechaCreacion) AS fechaEvaluacion
      FROM evaluacion e
      WHERE e.idUsuario = ? AND e.idCurso = ?
      GROUP BY e.idCurso, e.idUsuario
    )
    SELECT 
      CONCAT(u.nombres, ' ', u.primerApellido, ' ', u.segundoApellido) AS nombreCompletoUsuario,
      c.titulo AS tituloCurso,
      c.duracion AS duracionCurso,
      nm.notaMaxima,
      nm.fechaEvaluacion,
      CONCAT(uC.nombres, ' ', uC.primerApellido, ' ', uC.segundoApellido) AS nombreCompletoCreador
    FROM NotaMaxima nm
    JOIN curso c ON nm.idCurso = c.idCurso
    JOIN usuario u ON nm.idUsuario = u.id
    JOIN usuario uC ON c.idUsuario = uC.id
    WHERE nm.notaMaxima = (SELECT MAX(notaFinal) 
                            FROM evaluacion 
                            WHERE idUsuario = ? AND idCurso = ?)
    LIMIT 1;
  `;

  try {
    const [rows] = await connection.query(query, [
      idUsuario,
      idCurso,
      idUsuario,
      idCurso,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron detalles del curso." });
    }

    const certificateData = rows[0];

    // Preparamos los datos para encriptar
    const dataToEncrypt = {
      nombre: certificateData.nombreCompletoUsuario,
      curso: certificateData.tituloCurso,
      horas: certificateData.duracionCurso,
      fecha: certificateData.fechaEvaluacion,
    };

    // Encriptamos los datos
    const encryptedData = encrypt(JSON.stringify(dataToEncrypt));

    // Retornamos los datos encriptados al frontend
    return res.status(200).json({ ...certificateData, encryptedData });
  } catch (error) {
    console.error("Error al obtener los detalles del curso:", error.message);
    return res.status(500).send("Error al obtener los detalles del curso.");
  }
};

// Función para desencriptar datos
// Función para desencriptar datos
const decrypt = (text) => {
  let parts = text.split(":");
  let iv = Buffer.from(parts.shift(), "hex");
  let encryptedText = Buffer.from(parts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Endpoint para desencriptar los datos
export const desencriptarDatos = (req, res) => {
  const encryptedData = req.params.encryptedData; // Obtener los datos encriptados de los parámetros de consulta
  console.log(encryptedData);
  if (!encryptedData) {
    return res
      .status(400)
      .json({ message: "No se proporcionaron datos encriptados" });
  }

  try {
    const decryptedData = decrypt(encryptedData); // Desencriptar los datos
    res.status(200).json(JSON.parse(decryptedData)); // Enviar los datos desencriptados
  } catch (error) {
    console.error("Error al desencriptar los datos:", error.message);
    return res
      .status(500)
      .json({ message: "Error al desencriptar los datos." });
  }
};

// Obtener todos los cursos
export const listaCursos = async (req, res) => {
  try {
    const [result] = await connection.query(
      "SELECT idCurso, titulo, miniatura, especialidad, descripcion, duracion, precio, estado FROM curso WHERE estado = 1 OR estado = 2"
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

// Obtener todos los cursos
export const listaCursosSeleccionados = async (req, res) => {
  try {
    // Recibe la lista de IDs desde el cuerpo de la solicitud
    const ids = req.query.ids;
    console.log(ids);
    // Si no hay IDs proporcionados, devuelve un error
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        mensaje: "Debe proporcionar una lista de IDs de cursos válida",
      });
    }

    // Construye la consulta usando los IDs proporcionados
    const [result] = await connection.query(
      "SELECT idCurso, titulo, miniatura, especialidad, descripcion, duracion, precio, estado FROM curso WHERE (estado = 1 OR estado = 2) AND idCurso IN (?)",
      [ids]
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

export const detalleInscripcionCurso = async (req, res) => {
  const { startDate, endDate, courses } = req.query; // Accede a los parámetros desde req.query
  const courseIds = courses ? courses.split(",") : [];
  // Consulta SQL para obtener los datos necesarios
  const query = `
  SELECT 
    c.idCurso, 
    c.titulo,
    CONCAT(u.nombres, ' ', u.primerApellido, ' ', u.segundoApellido) AS nombreCompleto, -- Nombre completo del usuario

    COALESCE(i.totalInscripciones, 0) AS totalInscripciones,
    COALESCE(cp.ingresoTotal, 0) AS ingresoTotal,
    COALESCE(e.promedioNotaFinal, 0) AS promedioNotaFinal
FROM 
    curso c
    LEFT JOIN usuario u ON c.idUsuario = u.id -- Unir con la tabla usuario para obtener el nombre completo

LEFT JOIN (
    SELECT 
        di.idCurso,
        COUNT(DISTINCT i.idInscripcion) AS totalInscripciones
    FROM 
        detalle_inscripcion di
    JOIN 
        inscripcion i ON di.idInscripcion = i.idInscripcion 
    WHERE 
        i.fechaInscripcion BETWEEN '${startDate}' AND '${endDate}'
    GROUP BY 
        di.idCurso
) AS i ON c.idCurso = i.idCurso
LEFT JOIN (
    SELECT 
        di.idCurso,
        SUM(cp.montoCuota) AS ingresoTotal
    FROM 
        detalle_inscripcion di
    JOIN 
        inscripcion i ON di.idInscripcion = i.idInscripcion AND i.estado = 1
    JOIN 
        pago p ON i.idInscripcion = p.idInscripcion
    JOIN 
        cuota_pago cp ON cp.idPago = p.idPago AND cp.estadoCuota = 1
    WHERE 
        i.fechaInscripcion BETWEEN '${startDate}' AND '${endDate}'
    GROUP BY 
        di.idCurso
) AS cp ON c.idCurso = cp.idCurso
LEFT JOIN (
    SELECT 
        di.idCurso,
        AVG(e.notaFinal) AS promedioNotaFinal
    FROM 
        evaluacion e
    JOIN 
        detalle_inscripcion di ON e.idCurso = di.idCurso
    GROUP BY 
        di.idCurso
) AS e ON c.idCurso = e.idCurso
WHERE 
    c.idCurso IN (${courseIds.join(",")}) ;
  `;

  try {
    const [rows] = await connection.query(query, [startDate, endDate]);
    console.log(rows);
    if (rows.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron inscripciones para los cursos seleccionados en el rango de fechas.",
      });
    }

    // Procesar resultados
    const chartData = rows.map((row) => row.totalInscripciones);
    const chartOptions = rows.map((row) => row.titulo);
    const totalInscriptions = chartData.reduce((acc, curr) => acc + curr, 0);
    const today = new Date();
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfCurrentPeriod = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfLastPeriod = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );

    // Consulta para el mes actual (hasta el día de hoy)
    const thisMonthPartialQuery = `
  SELECT COUNT(di.idInscripcion) AS totalInscriptionsThisMonth
  FROM detalle_inscripcion di
  JOIN inscripcion i ON di.idInscripcion = i.idInscripcion
  WHERE i.estado = 1 
    AND di.idCurso IN (${courseIds.join(",")}) 
    AND i.fechaInscripcion BETWEEN ? AND ?
`;

    const [thisMonthPartialRows] = await connection.query(
      thisMonthPartialQuery,
      [startOfThisMonth, endOfCurrentPeriod]
    );

    const totalInscriptionsThisMonth =
      thisMonthPartialRows[0]?.totalInscriptionsThisMonth || 0;
      console.log('thisMonthPartialRows:', totalInscriptionsThisMonth);

    // Consulta para el mismo periodo del mes anterior
    const lastMonthPartialQuery = `
  SELECT COUNT(di.idInscripcion) AS totalInscriptionsLastMonth
  FROM detalle_inscripcion di
  JOIN inscripcion i ON di.idInscripcion = i.idInscripcion
  WHERE i.estado = 1 
    AND di.idCurso IN (${courseIds.join(",")})
    AND i.fechaInscripcion BETWEEN ? AND ?
`;

    const [lastMonthPartialRows] = await connection.query(
      lastMonthPartialQuery,
      [startOfLastMonth, endOfLastPeriod]
    );
    const lastMonthInscriptions =
      lastMonthPartialRows[0]?.totalInscriptionsLastMonth || 0;

    // Cálculo del crecimiento
    const growthPercentage =
      lastMonthInscriptions > 0
        ? ((totalInscriptionsThisMonth - lastMonthInscriptions) /
            lastMonthInscriptions) *
          100
        : 0;

    // Detalle de inscripciones por curso
    const detailedInscriptions = rows.map((row) => ({
      titulo: row.titulo,
      nombreCompleto: row.nombreCompleto,
      totalInscripciones: row.totalInscripciones,
      ingresoTotal: row.ingresoTotal || 0,
      promedioNotaFinal: row.promedioNotaFinal || 0,
    }));

    // Respuesta final
    return res.status(200).json({
      chartData,
      chartOptions,
      totalInscriptions,
      totalInscriptionsThisMonth,
      lastMonthInscriptions,
      growthPercentage,
      detailedInscriptions,
    });
  } catch (error) {
    console.error(
      "Error al obtener los detalles:",
      error.message
    );
    return res
      .status(500)
      .send("Error al obtener los detalles.");
  }
};

export const cursosLibresporUsuario = async (req, res) => {
  const { usuarioId } = req.params;
  console.log(usuarioId);
  console.log("FUI CONSULTADO");

  try {
    const [cursos] = await connection.query(
      `
      SELECT C.idCurso, C.titulo, C.miniatura, C.descripcion, C.duracion, C.precio
      FROM curso C
      WHERE C.idCurso NOT IN (
        SELECT DI.idCurso
        FROM detalle_inscripcion DI
        JOIN inscripcion I ON DI.idInscripcion = I.idInscripcion
        WHERE I.idUsuario = ?
        ) AND C.estado = 1
      `,
      [usuarioId]
    );

    res.status(200).json(cursos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

export const detalleInscripcionPago = async (req, res) => {
  const idInscripcion = req.params.idInscripcion;
  const idCuotaPago = req.query.idCuotaPago; // Obteniendo idCuotaPago desde los query params

  // Construir la consulta SQL
  let query = `
        WITH cuotas AS (
            SELECT 
                cp.idCuotaPago,
                ROW_NUMBER() OVER (PARTITION BY p.idInscripcion ORDER BY cp.fechaVencimiento) AS numeroCuota,
                cp.fechaVencimiento,
                cp.fechaPagoCuota,
                cp.metodoPago,
                cp.montoMora,
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
            di.precioCurso AS precioCurso,
            cu.cantidadCuotas,
            cu.fechaPagoCuota,
            cu.metodoPago,
            cu.montoMora,
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

export const detallePagos = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
// Convierte los parámetros en arrays si están en formato de string
const courses = req.query.courses ? req.query.courses.split(',') : [];
const selectedPaymentMethod = req.query.selectedPaymentMethod ? req.query.selectedPaymentMethod.split(',') : [];
const selectedStatus = req.query.selectedStatus ? req.query.selectedStatus.split(',') : [];

console.log(startDate, endDate, courses, selectedPaymentMethod, selectedStatus);

// Parámetros dinámicos para filtrar los datos
const params = [startDate, endDate, ...courses, ...selectedPaymentMethod, ...selectedStatus];    // Parámetros dinámicos para filtrar los datos

    // Gráfico de pastel: Distribución de pago_cuota por método de pago
    const distributionQuery = `
      SELECT metodoPago, COUNT(*) AS totalCuotas
      FROM cuota_pago
      WHERE fechaPagoCuota BETWEEN ? AND ?
      AND estadoCuota = 1
      GROUP BY metodoPago
    `;

    const [distributionResult] = await connection.query(distributionQuery, [startDate, endDate, ...selectedStatus]);

    // Gráfico de barras: Total de ingresos por curso
    const ingresosQuery = `
       SELECT c.titulo AS curso, SUM(cp.montoCuota + cp.montoMora) AS totalIngresos
      FROM cuota_pago cp
      JOIN pago p ON cp.idPago = p.idPago
      JOIN inscripcion i ON p.idInscripcion = i.idInscripcion
      JOIN detalle_inscripcion di ON di.idInscripcion = i.idInscripcion
      JOIN curso c ON di.idCurso = c.idCurso
      WHERE cp.estadoCuota = 1
      AND cp.fechaPagoCuota BETWEEN ? AND ?
      AND c.idCurso IN (${courses.join(',')})
      GROUP BY c.titulo
      ORDER BY totalIngresos DESC
    `;

    const [ingresosResult] = await connection.query(ingresosQuery, [startDate, endDate, ...courses]);

    // Gráfico de barras: Comparación de montos adeudados por curso
    const deudaQuery = `
      SELECT c.titulo AS curso, SUM(cp.montoCuota + cp.montoMora) AS totalDeuda
      FROM cuota_pago cp
      JOIN pago p ON cp.idPago = p.idPago
      JOIN inscripcion i ON p.idInscripcion = i.idInscripcion
      JOIN curso c ON i.idCurso = c.idCurso
      WHERE cp.estadoCuota IN (2, 3)
      AND cp.fechaPagoCuota BETWEEN ? AND ?
      AND c.idCurso IN (${courses.join(',')})
      GROUP BY c.titulo
      ORDER BY totalDeuda DESC
    `;

    const [deudaResult] = await connection.query(deudaQuery, [startDate, endDate, ...courses]);

    // Indicadores numéricos
    const totalIngresosQuery = `
      SELECT SUM(cp.montoCuota + cp.montoMora) AS totalIngresos
      FROM cuota_pago cp
      WHERE cp.estadoCuota = 1
      AND cp.fechaPagoCuota BETWEEN ? AND ?
    `;

    const [totalIngresosResult] = await connection.query(totalIngresosQuery, [startDate, endDate]);

    const cuotasPendientesQuery = `
      SELECT SUM(cp.montoCuota + cp.montoMora) AS totalPendiente
      FROM cuota_pago cp
      WHERE cp.estadoCuota IN (2, 3)
      AND cp.fechaPagoCuota BETWEEN ? AND ?
    `;

    const [cuotasPendientesResult] = await connection.query(cuotasPendientesQuery, [startDate, endDate]);

    const usuariosCuotasQuery = `
      SELECT
        SUM(CASE WHEN cp.estadoCuota = 1 THEN 1 ELSE 0 END) AS usuariosCuotasPagadas,
        SUM(CASE WHEN cp.estadoCuota IN (2, 3) THEN 1 ELSE 0 END) AS usuariosCuotasPendientes
      FROM cuota_pago cp
      JOIN pago p ON cp.idPago = p.idPago
      JOIN inscripcion i ON p.idInscripcion = i.idInscripcion
      WHERE cp.fechaPagoCuota BETWEEN ? AND ?
    `;

    const [usuariosCuotasResult] = await connection.query(usuariosCuotasQuery, [startDate, endDate]);

    // Tabla de resultados dinámicos según el estado de cuota
    let tableQuery = '';
    if ((selectedPaymentMethod = '1') && (selectedPaymentMethod = '2') && (selectedPaymentMethod=3)) {
      tableQuery = `
        SELECT u.nombre AS usuario, c.titulo AS curso,
          cp.montoCuota AS montoPagado,
          IF(cp.estadoCuota IN (2, 3), cp.montoCuota + cp.montoMora, 0) AS montoPendiente,
          DATEDIFF(CURDATE(), cp.fechaVencimiento) AS diasRetraso,
          cp.estadoCuota AS estadoCuota
        FROM cuota_pago cp
        JOIN pago p ON cp.idPago = p.idPago
        JOIN inscripcion i ON p.idInscripcion = i.idInscripcion
        JOIN curso c ON i.idCurso = c.idCurso
        JOIN usuario u ON i.idUsuario = u.id
        WHERE cp.fechaPagoCuota BETWEEN ? AND ?
      `;
    } else if (selectedPaymentMethod.includes(1)) {
      tableQuery = `
        SELECT u.nombre AS usuario, c.titulo AS curso,
          cp.montoCuota AS montoPagado,
          cp.estadoCuota AS estadoCuota
        FROM cuota_pago cp
        JOIN pago p ON cp.idPago = p.idPago
        JOIN inscripcion i ON p.idInscripcion = i.idInscripcion
        JOIN curso c ON i.idCurso = c.idCurso
        JOIN usuario u ON i.idUsuario = u.id
        WHERE cp.estadoCuota = 1
        AND cp.fechaPagoCuota BETWEEN ? AND ?
      `;
    } else if (selectedPaymentMethod.includes(2) || selectedPaymentMethod.includes(3)) {
      tableQuery = `
        SELECT u.nombre AS usuario, c.titulo AS curso,
          IF(cp.estadoCuota = 1, cp.montoCuota, 0) AS montoPagado,
          IF(cp.estadoCuota IN (2, 3), cp.montoCuota + cp.montoMora, 0) AS montoPendiente,
          DATEDIFF(CURDATE(), cp.fechaVencimiento) AS diasRetraso,
          cp.estadoCuota AS estadoCuota
        FROM cuota_pago cp
        JOIN pago p ON cp.idPago = p.idPago
        JOIN inscripcion i ON p.idInscripcion = i.idInscripcion
        JOIN curso c ON i.idCurso = c.idCurso
        JOIN usuario u ON i.idUsuario = u.id
        WHERE cp.estadoCuota IN (2, 3)
        AND cp.fechaPagoCuota BETWEEN ? AND ?
      `;
    }

    const [tableResult] = await connection.query(tableQuery, [startDate, endDate]);

    return res.status(200).json({
      distributionResult,
      ingresosResult,
      deudaResult,
      totalIngresos: totalIngresosResult[0].totalIngresos,
      totalPendiente: cuotasPendientesResult[0].totalPendiente,
      usuariosCuotasResult,
      tableResult,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Error fetching payment details" });
  }
};

