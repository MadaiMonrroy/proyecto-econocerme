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

export const detallesCertificado = async (req, res) => {
  const idUsuario = req.params.idUsuario;
  const idCurso = req.query.idCurso; // Obteniendo idCuotaPago desde los query params

  console.log(idUsuario, idCurso);
  // Construir la consulta SQL
  const query = `
    WITH NotaMaxima AS (
      SELECT 
        e.idCurso,
        e.idUsuario,
        MAX(e.notaFinal) AS notaMaxima,
        MAX(e.fechaCreacion) AS fechaEvaluacion -- Obtener la fecha de la última evaluación
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
                            WHERE idUsuario = ? AND idCurso = ?) -- Asegura que la nota máxima es 100
    LIMIT 1; -- Limita el resultado a una sola fila
  `;

  try {
    const [rows] = await connection.query(query, [
      idUsuario,
      idCurso,
      idUsuario,
      idCurso,
    ]);
    console.log("Resultado de la consulta:", rows);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron detalles del curso." });
    }

    return res.status(200).json(rows[0]); // Devuelve solo el primer resultado
  } catch (error) {
    console.error("Error al obtener los detalles del curso:", error.message);
    return res.status(500).send("Error al obtener los detalles del curso.");
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
    console.log(ids)
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
  const courseIds = courses ? courses.split(',') : [];

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
    console.log(rows)
    if (rows.length === 0) {
      return res
        .status(404)
        .json({
          message:
            "No se encontraron inscripciones para los cursos seleccionados en el rango de fechas.",
        });
    }

    // Procesar resultados
    const chartData = rows.map((row) => row.totalInscripciones);
    const chartOptions = rows.map((row) => row.titulo);
    const totalInscriptions = chartData.reduce((acc, curr) => acc + curr, 0);
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    // Consulta para inscripciones del último mes
    const lastMonthQuery = `
      SELECT COUNT(di.idInscripcion) AS totalInscripciones
      FROM detalle_inscripcion di
      JOIN inscripcion i ON di.idInscripcion = i.idInscripcion
      WHERE i.estado = 1 
        AND di.idCurso IN (${courseIds.join(",")}) 
        AND i.fechaInscripcion >= ?
    `;

    const [lastMonthRows] = await connection.query(lastMonthQuery, [
      lastMonthDate,
    ]);
    const lastMonthInscriptions = lastMonthRows[0]?.totalInscripciones || 0;

    // Calcular el porcentaje de crecimiento mensual
    const growthPercentage =
      lastMonthInscriptions > 0
        ? ((totalInscriptions - lastMonthInscriptions) /
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
      lastMonthInscriptions,
      growthPercentage,
      detailedInscriptions,
    });
  } catch (error) {
    console.error(
      "Error al obtener los detalles del certificado:",
      error.message
    );
    return res
      .status(500)
      .send("Error al obtener los detalles del certificado.");
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
