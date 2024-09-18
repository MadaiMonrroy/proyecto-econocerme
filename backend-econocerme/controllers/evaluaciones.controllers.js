import connection from "../db.js";

// Agregar preguntas y respuestas para un curso
export const agregarPreguntas = async (req, res) => {
  const { preguntas, cursoId, idUsuario } = req.body;

  try {
    // Recorremos cada pregunta para insertarla
    for (const pregunta of preguntas) {
      const { text, options, correctAnswer } = pregunta;
      
      // Insertar pregunta con las opciones en formato JSON y la respuesta correcta
      await connection.query(
        "INSERT INTO pregunta_respuesta (idCurso, pregunta, opcionesRespuesta, respuestaCorrecta, idUsuario) VALUES (?, ?, ?, ?, ?)",
        [cursoId, text, JSON.stringify(options), options[correctAnswer], idUsuario]
      );
    }

    res.status(201).json({ mensaje: "Preguntas agregadas exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error al agregar las preguntas" });
  }
};
// Obtener preguntas y respuestas de un curso
export const obtenerPreguntasPorCurso = async (req, res) => {
    const { cursoId } = req.params;
  
    try {
      console.log(`Obteniendo preguntas para el cursoId: ${cursoId}`);
      const [preguntas] = await connection.query(
        "SELECT idPregunta, pregunta, opcionesRespuesta, respuestaCorrecta FROM pregunta_respuesta WHERE idCurso = ? AND estado = 1",
        [cursoId]
      );
      console.log("Preguntas obtenidas:", preguntas);
  
      const preguntasFormateadas = preguntas.map(pregunta => {
        let opciones = [];
        try {
          opciones = JSON.parse(pregunta.opcionesRespuesta);
        } catch (error) {
          console.error(`Error al analizar opcionesRespuesta: ${pregunta.opcionesRespuesta}`);
          opciones = [];
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
  
    try {
      // Recorremos cada pregunta y verificamos si debe actualizarse
      for (const pregunta of preguntas) {
        const { idPregunta, text, options, correctAnswer } = pregunta;
  
        // Asegúrate de que la opción correcta se indexa correctamente
        const respuestaCorrecta = options[correctAnswer];
  
        // Actualizar pregunta y respuestas
        await connection.query(
          "UPDATE pregunta_respuesta SET pregunta = ?, opcionesRespuesta = ?, respuestaCorrecta = ?, idUsuario = ? WHERE idPregunta = ? AND idCurso = ?",
          [text, JSON.stringify(options), respuestaCorrecta, idUsuario, idPregunta, cursoId]
        );
      }
  
      res.json({ mensaje: "Preguntas actualizadas exitosamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Ocurrió un error al actualizar las preguntas" });
    }
  };
  
  