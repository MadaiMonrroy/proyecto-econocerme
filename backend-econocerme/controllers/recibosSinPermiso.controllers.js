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


