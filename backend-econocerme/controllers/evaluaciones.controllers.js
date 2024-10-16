import puppeteer from "puppeteer";
import connection from "../db.js";
import path from "path";
import fs from "fs-extra";
export const ingresarEvaluacion = async (req, res) => {
  const { idUsuario, idCurso, respuestas } = req.body; // Obtener los datos del cuerpo de la solicitud
  console.log(idUsuario, idCurso, respuestas);
  const conn = await connection.getConnection(); // Obtener la conexión a la base de datos
  try {
    await conn.beginTransaction(); // Iniciar la transacción
    console.log("Iniciando transacción para la evaluación");

    // 1. Insertar en la tabla Evaluacion
    const [evaluacionResult] = await conn.execute(
      `INSERT INTO evaluacion (idCurso, idUsuario) VALUES (?, ?)`,
      [idCurso, idUsuario]
    );

    const idEvaluacion = evaluacionResult.insertId; // Obtener el idEvaluacion recién insertado
    let notaFinal = 0; // Variable para calcular la nota final

    // 2. Insertar en la tabla Respuesta para cada respuesta
    for (const respuesta of respuestas) {
      const { idPregunta, respuesta: respuestaUsuario } = respuesta; // Use respuesta directly
      // Check if any values are undefined
      if (idPregunta === undefined || respuestaUsuario === undefined) {
        return res
          .status(400)
          .json({ mensaje: "Faltan datos en las respuestas" });
      }

      // Insertar respuesta en la tabla respuesta
      await conn.execute(
        `INSERT INTO respuesta (idPregunta, idEvaluacion, respuestaUsuario) VALUES (?, ?, ?)`,
        [idPregunta, idEvaluacion, respuestaUsuario]
      );

      // 3. Consultar la respuesta correcta y calcular la nota final
      const [[preguntaResult]] = await conn.execute(
        `SELECT respuestaCorrecta FROM pregunta_respuesta WHERE idPregunta = ?`,
        [idPregunta]
      );

      if (
        preguntaResult &&
        respuestaUsuario === preguntaResult.respuestaCorrecta
      ) {
        notaFinal += 1; // Sumar un punto si la respuesta es correcta
      }
    }
    // Primero, cuenta las preguntas con estado = 1
    const [totalPreguntasResult] = await conn.execute(
      `SELECT COUNT(*) as total FROM respuesta WHERE idEvaluacion = ?`,
      [idEvaluacion]
    );
    const totalPreguntas = totalPreguntasResult[0].total;
    // Verifica que haya preguntas para evitar división por cero
    if (totalPreguntas === 0) {
      return res
        .status(400)
        .json({ mensaje: "No hay preguntas válidas para evaluar." });
    }
    // Calcular el porcentaje
    const porcentaje = (notaFinal / totalPreguntas) * 100;

    // Almacenar la nota final como un número entero
    notaFinal = Math.round(porcentaje); // Redondea a entero

    // Guarda notaFinal en la base de datos o devuélvela en la respuesta
    await conn.execute(
      `UPDATE evaluacion SET notaFinal = ? WHERE idEvaluacion = ?`,
      [notaFinal, idEvaluacion]
    );

    await conn.commit(); // Confirmar la transacción

    res.status(200).json({
      mensaje: "Evaluación ingresada exitosamente",
      idEvaluacion: idEvaluacion,
      notaFinal: notaFinal,
    });
  } catch (error) {
    await conn.rollback(); // Revertir en caso de error
    console.error(error);
    res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  } finally {
    conn.release(); // Liberar la conexión
  }
};
export const generarCertificado = async (req, res) => {
  const { idUsuario, idCurso } = req.body; // Recibir idUsuario e idCurso desde el cuerpo de la solicitud
  console.log("Datos para generar certificado", idUsuario, idCurso);
  
  try {
    // Definir la ruta donde se guardará el certificado PDF
    const outputDir = path.resolve("uploads/certificates");
    
    // Crear el directorio si no existe
    if (!fs.existsSync(outputDir)) {
      await fs.mkdir(outputDir, { recursive: true });
    }

    // Inicializar Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    const url = `http://localhost:5173/generarCertificado/${idUsuario}?idCurso=${idCurso}`;

    // Navegar a la URL donde se generará el certificado
    await page.goto(url, { waitUntil: "networkidle2" });

    // Generar el PDF del certificado
    const pdfBuffer = await page.pdf({
      width: '11in',   // Ancho de carta en pulgadas
  height: '8.5in', // Alto de carta en pulgadas
  printBackground: true,
  margin: {
    top: "0mm",
    right: "0mm",
    bottom: "0mm",
    left: "0mm",
  },
  displayHeaderFooter: false,
    });

    // Cerrar el navegador
    await browser.close();

    const pdfFilename = `certificado-${idUsuario}-${idCurso}-${Date.now()}.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);

    // Eliminar cualquier archivo PDF anterior en la carpeta, si es necesario
    const files = await fs.readdir(outputDir);
    for (const file of files) {
      if (file.endsWith(".pdf")) {
        await fs.unlink(path.join(outputDir, file)); // Eliminar archivos existentes
      }
    }

    // Guardar el archivo PDF en el servidor
    await fs.writeFile(pdfPath, pdfBuffer);

    // Generar la URL pública del certificado PDF
    const pdfUrl = `http://localhost:3000/uploads/certificates/${pdfFilename}`;

    // Enviar la URL del certificado como respuesta
    res.send({ url: pdfUrl });
  } catch (error) {
    console.error("Error al generar el certificado PDF:", error);
    res.status(500).send("No se pudo generar el certificado PDF");
  }
};


// Agregar preguntas y respuestas para un curso (transaccional)
export const agregarPreguntas = async (req, res) => {
  const { preguntas, cursoId, idUsuario } = req.body;

  const conn = await connection.getConnection();
  await conn.beginTransaction(); // Iniciar la transacción

  try {
    // Recorremos cada pregunta para insertarla
    for (const pregunta of preguntas) {
      const { text, options, correctAnswer } = pregunta;

      // Insertar pregunta con las opciones en formato JSON y la respuesta correcta
      await conn.query(
        "INSERT INTO pregunta_respuesta (idCurso, pregunta, opcionesRespuesta, respuestaCorrecta, idUsuario) VALUES (?, ?, ?, ?, ?)",
        [
          cursoId,
          text,
          JSON.stringify(options),
          options[correctAnswer],
          idUsuario,
        ]
      );
    }

    await conn.commit(); // Confirmar la transacción
    res.status(201).json({ mensaje: "Preguntas agregadas exitosamente" });
  } catch (error) {
    await conn.rollback(); // Revertir la transacción en caso de error
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al agregar las preguntas" });
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
      "SELECT idPregunta, pregunta, opcionesRespuesta, respuestaCorrecta FROM pregunta_respuesta WHERE idCurso = ? AND (estado = 1)",
      [cursoId]
    );
    console.log("Preguntas obtenidas:", preguntas);

    const preguntasFormateadas = preguntas.map((pregunta) => {
      let opciones = [];

      // Verificar si opcionesRespuesta ya es un array o necesita conversión
      if (typeof pregunta.opcionesRespuesta === "string") {
        try {
          // Intentar convertir opcionesRespuesta de JSON
          opciones = JSON.parse(pregunta.opcionesRespuesta);
        } catch (error) {
          console.error(
            `Error al analizar opcionesRespuesta: ${pregunta.opcionesRespuesta}`
          );
          // Si no se puede convertir a JSON, intentar dividirlo por comas
          opciones = pregunta.opcionesRespuesta
            .split(",")
            .map((op) => op.trim());
        }
      } else {
        // Si ya es un array, lo usamos directamente
        opciones = pregunta.opcionesRespuesta;
      }

      return {
        idPregunta: pregunta.idPregunta,
        text: pregunta.pregunta,
        options: opciones,
        correctAnswer: opciones.indexOf(pregunta.respuestaCorrecta),
      };
    });

    res.json(preguntasFormateadas);
  } catch (error) {
    console.error("Error en la consulta:", error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al obtener las preguntas" });
  }
};

// Editar preguntas y respuestas existentes
export const editarPreguntas = async (req, res) => {
  const { preguntas, cursoId, idUsuario } = req.body;

  const conn = await connection.getConnection();
  await conn.beginTransaction(); // Iniciar la transacción

  try {
    // Recorremos cada pregunta y verificamos si debe actualizarse
    for (const pregunta of preguntas) {
      const { idPregunta, text, options, correctAnswer } = pregunta;

      // Asegúrate de que la opción correcta se indexa correctamente
      const respuestaCorrecta = options[correctAnswer];

      // Actualizar pregunta y respuestas
      await conn.query(
        "UPDATE pregunta_respuesta SET pregunta = ?, opcionesRespuesta = ?, respuestaCorrecta = ?, idUsuario = ? WHERE idPregunta = ? AND idCurso = ?",
        [
          text,
          JSON.stringify(options),
          respuestaCorrecta,
          idUsuario,
          idPregunta,
          cursoId,
        ]
      );
    }

    await conn.commit(); // Confirmar la transacción
    res.json({ mensaje: "Preguntas actualizadas exitosamente" });
  } catch (error) {
    await conn.rollback(); // Revertir la transacción en caso de error
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al actualizar las preguntas" });
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
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al eliminar la pregunta" });
  }
};
