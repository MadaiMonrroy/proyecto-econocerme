import connection from "../db.js";

// Obtener todos los pagos
export const listaPagos = async (req, res) => {
  try {
    res.status(200).json({
      mensaje: "Lista de pagos obtenida correctamente",
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

// Obtener el Pago
export const obtenerPago = async (req, res) => {
  const idInscripcion = req.params.id; // Ahora recibimos idInscripcion
  try {
    // 1. Obtener el idPago a partir del idInscripcion
    const [resultIdPago] = await connection.query(
      `
      SELECT idPago 
      FROM pago 
      WHERE idInscripcion = ?
    `,
      [idInscripcion]
    );
    const idPago = resultIdPago[0].idPago;
    console.log("idpago",idPago);

    // 1. Verificar el estado de todas las cuotas asociadas a este pago
    const [cuotasResult] = await connection.query(
      `
      SELECT COUNT(*) AS totalCuotas, 
             SUM(CASE WHEN estadoCuota = 1 THEN 1 ELSE 0 END) AS cuotasPagadas
      FROM cuota_pago 
      WHERE idPago = ?
    `,
      [idPago]
    );

    const { totalCuotas, cuotasPagadas } = cuotasResult[0];

    // 2. Actualizar el estado del pago:
    // Si todas las cuotas están pagadas (estado 1), actualizar estado del pago a 1
    // Si no, dejar el estado del pago en 2
    let nuevoEstadoPago = 2; // Por defecto pendiente
    if (cuotasPagadas == totalCuotas) {
      nuevoEstadoPago = 1; // Pagado si todas las cuotas están completas
    }
    await connection.query(
      `
      UPDATE pago 
      SET estado = ? 
      WHERE idPago = ?
    `,
      [nuevoEstadoPago, idPago]
    );

    const [result] = await connection.query(
      `
      SELECT 
        P.idPago,
        P.montoTotal,
        P.estado,
        IFNULL(COUNT(DI.idCurso), 0) AS cursos, 
        IFNULL(U.fotoPerfil, '${process.env.BASE_URL}/uploads/usuarios/avatar3.png') AS fotoPerfil,
        CONCAT(U.nombres, ' ', U.primerApellido, ' ', U.segundoApellido) AS nombreCompleto,
        P.fechaCreacion
      FROM pago P
      INNER JOIN inscripcion I ON P.idInscripcion = I.idInscripcion
      INNER JOIN usuario U ON I.idUsuario = U.id
      LEFT JOIN detalle_inscripcion DI ON I.idInscripcion = DI.idInscripcion
      WHERE P.idPago = ?
      GROUP BY P.idPago, P.montoTotal, P.estado, fotoPerfil, nombreCompleto, P.fechaCreacion
`,
      [idPago]
    );

    // Verificar si hay resultados
    if (result.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No se encontro la inscripcion." });
    }
    res.status(200).json({
      mensaje: "Pago Obtenido Correctamente",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

export const editarPago = async (req, res) => {
  const idPago = req.params.id;
  try {
    res.json({
      mensaje: "Pago editada correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

export const eliminarPago = async (req, res) => {
  const idPago = req.params.id;

  try {
    // Actualizar el estado del curso a inactivo (estado = 0)
    const [result] = await connection.query(
      "UPDATE pago SET estado = 0 WHERE idPago = ?",
      [idPago]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Pago no encontrado",
      });
    }

    res.json({
      mensaje: "Pago eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};
