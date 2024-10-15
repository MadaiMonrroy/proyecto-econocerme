import connection from "../db.js";


export const obtenerIdPagoPorInscripcion = async (req, res) => {
	const idInscripcion = req.params.id;

	try {
	  const [pagoResult] = await connection.query(`
		SELECT idPago 
		FROM pago 
		WHERE idInscripcion = ?
	  `, [idInscripcion]);
  
	  if (pagoResult.length === 0) {
		return res.status(404).json({ message: "No se encontró ningún pago" });
	}

	  return res.status(200).json({ idPago: pagoResult[0].idPago });
	} catch (error) {
	  throw new Error("Error al obtener el idPago: " + error.message);
	}
  };
  
// Obtener todas las cuotas de un pago

export const listaCuotas = async (req, res) => {
	const idPago = req.params.id;
	console.log("idpago",idPago)
	try {
		const [result] = await connection.query(`
			SELECT CP.*, P.idInscripcion
			FROM cuota_pago CP
			INNER JOIN pago P ON CP.idPago = P.idPago
			WHERE CP.idPago = ?
		  `, [idPago]);
		// Verificar si hay resultados
		if (result.length === 0) {
			return res.status(404).json({ mensaje: "No se encontraron cuotas para esta inscripcion" });
		}


		// Responder con los módulos encontrados
		res.json(result);
	} catch (error) {
		console.error("Error al obtener las cuotas:", error);
		return res.status(500).json({
			mensaje: "Ocurrió un error en el servidor",
		});
	}
};


// Obtener un módulo por ID
export const obtenerCuota = async (req, res) => {
	const idCuota = req.params.id;
	try {
		const [result] = await connection.query(
			"SELECT * FROM cuota_pago WHERE idCuota = ?",
			[idCuota]
		);
		if (result.length === 0) {
			return res.status(404).json({
				mensaje: "Cuota no encontrada",
			});
		}
		res.json(result[0]);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			mensaje: "Ocurrió un error en el servidor",
		});
	}
};

// Editar una cuota
export const editarCuota = async (req, res) => {
	const idCuota = req.params.id;
	//   const { nombre, descripcion, videoIntroURL, idUsuario } = req.body;
	try {
		const [result] = await connection.query(
			`UPDATE cuota_pago SET
                metodoPago = ?,
                fechaVencimiento = ?,
                fechaPagoCuota = ?,
                idUsuarioModificacion = ?
            WHERE idCuotaPago = ?`,
			[metodoPago, fechaVencimiento, fechaPagoCuota, idUsuarioModificacion, idCuotaPago]
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({
				mensaje: "Cuota no encontrada",
			});
		}
		res.json({
			mensaje: "Cuota actualizada correctamente",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			mensaje: "Ocurrió un error en el servidor",
		});
	}
};
