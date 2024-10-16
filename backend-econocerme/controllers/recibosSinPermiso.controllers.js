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

  console.log(idUsuario,idCurso)
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
    const [rows] = await connection.query(query, [idUsuario, idCurso, idUsuario, idCurso]);
    console.log("Resultado de la consulta:", rows);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron detalles del curso." });
    }

    return res.status(200).json(rows[0]); // Devuelve solo el primer resultado
  } catch (error) {
    console.error("Error al obtener los detalles del curso:", error.message);
    return res.status(500).send("Error al obtener los detalles del curso.");
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
            di.precioCurso AS precioCurso,
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
