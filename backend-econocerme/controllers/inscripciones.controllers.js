import connection from "../db.js";

// Obtener todos los cursos
export const listaInscripciones = async (req, res) => {
  try {
    // Realizar la consulta a la base de datos
    const [rows] = await connection.query(`
      SELECT 
        I.idInscripcion,
        CONCAT(U.nombres, ' ', U.primerApellido, ' ', U.segundoApellido) AS nombreCompleto,
        U.fotoPerfil,
        I.observacion,
        C.titulo AS tituloCurso,
        C.miniatura AS miniaturaCurso
      FROM 
        inscripcion I
      JOIN 
        usuario U ON I.idUsuario = U.id
      JOIN 
        detalle_inscripcion DI ON I.idInscripcion = DI.idInscripcion
      JOIN 
        curso C ON DI.idCurso = C.idCurso;
    `);

    // Enviar la respuesta con los datos obtenidos
    res.json({
      mensaje: "Lista de inscripciones obtenida correctamente",
      data: rows
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

// Obtener un inscripcion por ID
export const obtenerInscripcion = async (req, res) => {
  const idInscripcion = req.params.id;
  try {
    res.json({
      mensaje: "Inscripcion agregada correctamente",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};



export const agregarInscripcion = async (req, res) => {
  const { idUsuario, idCurso, observacion } = req.body;
  const conn = await connection.getConnection(); // Obtener una conexión del pool
  try {


    // Comprobar si el usuario ya está inscrito en el curso
    const [inscripcionExistente] = await conn.query(
      `SELECT 1 
       FROM detalle_inscripcion di
       JOIN inscripcion i ON i.idInscripcion = di.idInscripcion
       WHERE i.idUsuario = ? AND di.idCurso = ?`,
      [idUsuario, idCurso]
    );

    // Si ya existe una inscripción, retornar un mensaje de error
    if (inscripcionExistente.length > 0) {
      return res.status(400).json({
        mensaje: 'El usuario ya está registrado en este curso.',
      });
    }

    console.log(idUsuario, idCurso, observacion);
    await conn.beginTransaction(); // Iniciar transacción

    // Insertar en la tabla inscripcion
    const [resultInscripcion] = await conn.query(
      'INSERT INTO inscripcion (idUsuario, observacion) VALUES (?, ?)',
      [idUsuario, observacion]
    );
    const idInscripcion = resultInscripcion.insertId; // Obtener el ID de la inscripción

    // Insertar en la tabla detalle_inscripcion
    await conn.query(
      'INSERT INTO detalle_inscripcion (idInscripcion, idCurso) VALUES (?, ?)',
      [idInscripcion, idCurso]
    );

    await conn.commit(); // Confirmar la transacción

    res.json({
      mensaje: 'Inscripción agregada correctamente',
      idInscripcion,
    });
  } catch (error) {
    await conn.rollback(); // Revertir en caso de error
    console.error(error);
    res.status(500).json({
      mensaje: 'Ocurrió un error en el servidor',
    });
  } finally {
    conn.release(); // Liberar la conexión
  }
};

export const editarInscripcion = async (req, res) => {
  const idInscripcion = req.params.id;
  const {
	idUsuario,
	idCurso,
	observacion
  } = req.body;
  try {
    // const [result] = await connection.query(
    //   `UPDATE curso SET
    //             titulo = ?,
    //             miniatura = ?,
    //             especialidad = ?,
    //             descripcion = ?,
    //             duracion = ?,
    //             precio = ?
    //         WHERE idCurso = ?`,
    //   [
    //     titulo,
    //     miniatura,
    //     especialidad,
    //     descripcion,
    //     duracion,
    //     precio,
    //     idCurso,
    //   ]
    // );
    // if (result.affectedRows === 0) {
    //   return res.status(404).json({
    //     mensaje: "Curso no encontrado",
    //   });
    // }
	console.log(idUsuario, idCurso, observacion);
	res.json({
		mensaje: "Inscripcion editada correctamente",
	});
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

export const eliminarInscripcion = async (req, res) => {
  const idInscripcion = req.params.id;

  try {
    // Actualizar el estado del curso a inactivo (estado = 0)
    const [result] = await connection.query(
      "UPDATE inscripcion SET estado = 0 WHERE idInscripcion = ?",
      [idInscripcion]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Curso no encontrado",
      });
    }

    res.json({
      mensaje: "Inscripcion eliminada correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};