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

// Obtener un pago por ID
export const obtenerPago = async (req, res) => {
  const idPago = req.params.id;
  try {
    res.json({
      mensaje: "Pago agregada correctamente",
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
