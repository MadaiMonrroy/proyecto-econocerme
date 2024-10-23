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
	const today = new Date(); // Fecha actual
  
	try {
	  // Obtener todas las cuotas asociadas al pago
	  const [result] = await connection.query(`
		SELECT CP.*, P.idInscripcion
		FROM cuota_pago CP
		INNER JOIN pago P ON CP.idPago = P.idPago
		WHERE CP.idPago = ?
	  `, [idPago]);
  
	  // Verificar si hay resultados
	  if (result.length === 0) {
		return res.status(404).json({ mensaje: "No se encontraron cuotas para esta inscripción" });
	  }
  
	  // Iterar sobre cada cuota para verificar la fecha de vencimiento y el estado
	  for (let cuota of result) {
		const fechaVencimiento = new Date(cuota.fechaVencimiento);
  
		// Solo calcular montoMora y actualizar estado si la cuota está en estado 2 y ha vencido
		if (cuota.estadoCuota === 2 && fechaVencimiento < today) {
		  // Calcular mora (10% del monto de la cuota)
		  const montoMora = cuota.montoCuota * 0.10;
  
		  // Actualizar el estado de la cuota a 3 (vencido) y asignar el monto de mora
		  await connection.query(`
			UPDATE cuota_pago 
			SET estadoCuota = 3, montoMora = ?
			WHERE idCuotaPago = ?
		  `, [montoMora, cuota.idCuotaPago]);
		}
	  }
  
	  // Volver a hacer un SELECT para obtener todas las cuotas actualizadas
	  const [cuotasActualizadas] = await connection.query(`
		SELECT CP.*, P.idInscripcion
		FROM cuota_pago CP
		INNER JOIN pago P ON CP.idPago = P.idPago
		WHERE CP.idPago = ?
	  `, [idPago]);
  
	  // Responder con las cuotas actualizadas
	  res.json(cuotasActualizadas);
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
// Editar una cuota con transacción
export const editarCuota = async (req, res) => {
    const idCuota = req.params.id; // Obtener el idCuota de los parámetros de la URL
    const { metodoPago, idUsuarioModificacion } = req.body; // Extraer del cuerpo de la solicitud

    const conn = await connection.getConnection(); // Obtener conexión a la base de datos

    try {
        await conn.beginTransaction(); // Iniciar transacción

        // 1. Actualizar el estado de la cuota a pagado (estadoCuota = 1)
        const [result] = await conn.query(
            `UPDATE cuota_pago SET
                estadoCuota = 1, -- Cambiar el estado de la cuota a 1
                metodoPago = ?, -- Asignar el método de pago
                fechaPagoCuota = CURRENT_TIMESTAMP, -- Asignar la fecha y hora actuales
                idUsuarioModificacion = ? -- Modificar el id del usuario que modifica
            WHERE idCuotaPago = ?`, // Actualizar la cuota con el idCuota
            [metodoPago, idUsuarioModificacion, idCuota]
        );

        if (result.affectedRows === 0) {
            await conn.rollback(); // Revertir cambios si no se encontró la cuota
            return res.status(404).json({
                mensaje: "Cuota no encontrada",
            });
        }

        // 2. Obtener el idPago de la cuota actualizada
        const [cuota] = await conn.query(
            `SELECT idPago FROM cuota_pago WHERE idCuotaPago = ?`, [idCuota]
        );
        const idPago = cuota[0].idPago;

        // 3. Contar el total de cuotas asociadas al mismo pago
        const [totalCuotas] = await conn.query(
            `SELECT COUNT(*) AS total FROM cuota_pago WHERE idPago = ?`, [idPago]
        );

        // 4. Contar las cuotas pagadas (estadoCuota = 1) asociadas al mismo pago
        const [cuotasPagadas] = await conn.query(
            `SELECT COUNT(*) AS pagadas FROM cuota_pago WHERE idPago = ? AND estadoCuota = 1`, [idPago]
        );

        const total = totalCuotas[0].total;
        const pagadas = cuotasPagadas[0].pagadas;

        // 5. Calcular el progreso en base al porcentaje de cuotas pagadas
        const progresoPago = (pagadas / total) * 100;

        // 6. Actualizar el progresoPago en la tabla detalle_inscripcion
        await conn.query(
            `UPDATE detalle_inscripcion di
            JOIN pago p ON di.idInscripcion = p.idInscripcion
            SET di.progresoPago = ?
            WHERE p.idPago = ?`, [progresoPago, idPago]
        );

        // Confirmar la transacción
        await conn.commit();

        res.json({
            mensaje: "Cuota actualizada y progreso de pago recalculado correctamente",
        });
    } catch (error) {
        await conn.rollback(); // Revertir cambios si ocurre un error
        console.error(error);
        return res.status(500).json({
            mensaje: "Ocurrió un error en el servidor",
        });
    } finally {
        conn.release(); // Liberar la conexión
    }
};



