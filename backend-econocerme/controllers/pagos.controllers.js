import connection from "../db.js";

// Obtener todos los pagos
export const listaPagos = async (req, res) => {
  try {
    res.status(200).json({
      mensaje: "Lista de pagos obtenida correctamente",
      data: rows
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
	const idPago = req.params.id;
  console.log(idPago, " PAGO")
  try {
    const [result] = await connection.query(`
      SELECT 
        P.idPago,
        P.montoTotal,
        P.estado,
        IFNULL(COUNT(DI.idCurso), 0) AS cursos, -- Contamos los cursos de la tabla detalle_inscripcion
        IFNULL(U.fotoPerfil, '${process.env.BASE_URL}/uploads/usuarios/avatar3.png') AS fotoPerfil,
        CONCAT(U.nombres, ' ', U.primerApellido, ' ', U.segundoApellido) AS nombreCompleto,
        P.fechaCreacion
      FROM pago P
      INNER JOIN inscripcion I ON P.idInscripcion = I.idInscripcion
      INNER JOIN usuario U ON I.idUsuario = U.id
      LEFT JOIN detalle_inscripcion DI ON I.idInscripcion = DI.idInscripcion
      WHERE P.idPago = ?
      GROUP BY P.idPago, P.montoTotal, P.estado, fotoPerfil, nombreCompleto, P.fechaCreacion
`, [idPago]);


		// Verificar si hay resultados
		if (result.length === 0) {
			return res.status(404).json({ mensaje: "No se encontro la inscripcion." });
		}
console.log(result)
    res.status(200).json({
      mensaje: "Pago Obtenido Correctamente",
      data: result
    });
  } catch (error) {
    console.error(error);
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
