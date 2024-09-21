import connection from "../db.js";

// Agregar preguntas y respuestas para un curso (transaccional)
export const agregarPreguntas = async (req, res) => {
  const { preguntas, cursoId, idUsuario } = req.body;

  const conn = await connection.getConnection();
  await conn.beginTransaction();  // Iniciar la transacción

  try {
    // Recorremos cada pregunta para insertarla
    for (const pregunta of preguntas) {
      const { text, options, correctAnswer } = pregunta;
      
      // Insertar pregunta con las opciones en formato JSON y la respuesta correcta
      await conn.query(
        "INSERT INTO pregunta_respuesta (idCurso, pregunta, opcionesRespuesta, respuestaCorrecta, idUsuario) VALUES (?, ?, ?, ?, ?)",
        [cursoId, text, JSON.stringify(options), options[correctAnswer], idUsuario]
      );
    }

    await conn.commit();  // Confirmar la transacción
    res.status(201).json({ mensaje: "Preguntas agregadas exitosamente" });
  } catch (error) {
    await conn.rollback();  // Revertir la transacción en caso de error
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error al agregar las preguntas" });
  } finally {
    conn.release();
  }
};

// Obtener preguntas y respuestas de un curso
export const obtenerPreguntasPorCurso = async (req, res) => {
  const { cursoId } = req.params;

  try {
    console.log(`Obteniendo preguntas para el cursoId: ${cursoId}`);
    const [preguntas] = await connection.query(
      "SELECT idPregunta, pregunta, opcionesRespuesta, respuestaCorrecta FROM pregunta_respuesta WHERE idCurso = ? AND (estado = 1 OR estado = 2)",
      [cursoId]
    );
    console.log("Preguntas obtenidas:", preguntas);

    const preguntasFormateadas = preguntas.map(pregunta => {
      let opciones = [];
      
      // Verificar si opcionesRespuesta ya es un array o necesita conversión
      if (typeof pregunta.opcionesRespuesta === 'string') {
        try {
          // Intentar convertir opcionesRespuesta de JSON
          opciones = JSON.parse(pregunta.opcionesRespuesta);
        } catch (error) {
          console.error(`Error al analizar opcionesRespuesta: ${pregunta.opcionesRespuesta}`);
          // Si no se puede convertir a JSON, intentar dividirlo por comas
          opciones = pregunta.opcionesRespuesta.split(',').map(op => op.trim());
        }
      } else {
        // Si ya es un array, lo usamos directamente
        opciones = pregunta.opcionesRespuesta;
      }

      return {
        idPregunta: pregunta.idPregunta,
        text: pregunta.pregunta,
        options: opciones,
        correctAnswer: opciones.indexOf(pregunta.respuestaCorrecta)
      };
    });

    res.json(preguntasFormateadas);
  } catch (error) {
    console.error("Error en la consulta:", error);
    res.status(500).json({ mensaje: "Ocurrió un error al obtener las preguntas" });
  }
};

  
  

 // Editar preguntas y respuestas existentes
export const editarPreguntas = async (req, res) => {
  const { preguntas, cursoId, idUsuario } = req.body;

  const conn = await connection.getConnection();
  await conn.beginTransaction();  // Iniciar la transacción

  try {
    // Recorremos cada pregunta y verificamos si debe actualizarse
    for (const pregunta of preguntas) {
      const { idPregunta, text, options, correctAnswer } = pregunta;

      // Asegúrate de que la opción correcta se indexa correctamente
      const respuestaCorrecta = options[correctAnswer];

      // Actualizar pregunta y respuestas
      await conn.query(
        "UPDATE pregunta_respuesta SET pregunta = ?, opcionesRespuesta = ?, respuestaCorrecta = ?, idUsuario = ? WHERE idPregunta = ? AND idCurso = ?",
        [text, JSON.stringify(options), respuestaCorrecta, idUsuario, idPregunta, cursoId]
      );
    }

    await conn.commit();  // Confirmar la transacción
    res.json({ mensaje: "Preguntas actualizadas exitosamente" });
  } catch (error) {
    await conn.rollback();  // Revertir la transacción en caso de error
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error al actualizar las preguntas" });
  } finally {
    conn.release();
  } 
};
// Eliminar preguntas (lógica: cambiar estado a 0)
export const eliminarPregunta = async (req, res) => {
  const { idPregunta } = req.params;
  const { idUsuario } = req.query;
  try {
    // Aquí puedes añadir una verificación adicional para validar que el idUsuario tenga permisos
    // o realizar alguna otra acción relacionada con el idUsuario si es necesario.

    await connection.query(
      "UPDATE pregunta_respuesta SET estado = 0, idUsuario = ? WHERE idPregunta = ?",
      [idUsuario, idPregunta]
    );
    
    res.json({ mensaje: "Pregunta eliminada exitosamente (estado 0)" });
  } catch (error) {
    console.error("Error al eliminar la pregunta:", error);
    res.status(500).json({ mensaje: "Ocurrió un error al eliminar la pregunta" });
  }
};

  
  