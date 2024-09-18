import connection from "../db.js";

// Obtener todos las Inscripciones

export const listaInscripciones = async (req, res) => {
  try {
    const [inscripciones] = await connection.query(`
      SELECT 
        I.idInscripcion,
        CONCAT(U.nombres, ' ', U.primerApellido, ' ', U.segundoApellido) AS nombreCompleto,
        IFNULL(U.fotoPerfil, '${process.env.BASE_URL}/uploads/usuarios/avatar3.png') AS fotoPerfil,
        I.observacion,
        I.fechaInscripcion,
        I.estado,
        P.montoTotal,
        IFNULL(COUNT(CP.idCuotaPago), 0) AS cuotas
      FROM inscripcion I
      INNER JOIN usuario U ON U.id = I.idUsuario
      INNER JOIN pago P ON P.idInscripcion = I.idInscripcion
      LEFT JOIN cuota_pago CP ON P.idPago = CP.idPago
      GROUP BY I.idInscripcion, nombreCompleto, fotoPerfil, I.observacion, I.fechaInscripcion, P.montoTotal;
    `);

    const [cursos] = await connection.query(`
      SELECT 
        DI.idInscripcion,
        C.idCurso,
        C.titulo,
        C.miniatura,
        C.descripcion,
        C.duracion,
        C.precio
      FROM detalle_inscripcion DI
      INNER JOIN curso C ON DI.idCurso = C.idCurso;
    `);

    // Combinar los resultados
    const inscripcionesConCursos = inscripciones.map(inscripcion => {
      const cursosRelacionados = cursos.filter(curso => curso.idInscripcion === inscripcion.idInscripcion);
      return {
        ...inscripcion,
        cursos: cursosRelacionados,
      };
    });

    // Enviar la respuesta con los datos obtenidos
    res.status(200).json({
      mensaje: "Lista de inscripciones obtenida correctamente",
      data: inscripcionesConCursos
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
}

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
  let montoCuota = 0;
  const {
    idUsuario,
    idCurso,
    observacion,
    cantidadCuotas,
    montoTotal,
    idUsuarioModificacion,
  } = req.body;
  console.log(req.body);
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();

    // Insertar en la tabla inscripcion
    const [inscripcionResult] = await conn.execute(
      `INSERT INTO inscripcion (idUsuario, observacion, idUsuarioModificacion) VALUES (?, ?, ?)`,
      [idUsuario, observacion, idUsuarioModificacion]
    );

    const idInscripcion = inscripcionResult.insertId;

    // Insertar en la tabla detalle_inscripcion para cada curso
    for (const curso of idCurso) {
      await conn.execute(
        `INSERT INTO detalle_inscripcion (idInscripcion, idCurso) VALUES (?, ?)`,
        [idInscripcion, curso.idCurso]
      );
    }

    // Insertar en la tabla pago
    const [pagoResult] = await conn.execute(
      `INSERT INTO pago (idInscripcion, montoTotal, idUsuarioModificacion) VALUES (?, ?, ?)`,
      [idInscripcion, montoTotal, idUsuarioModificacion]
    );

    const idPago = pagoResult.insertId;
    const montoCuota = montoTotal/cantidadCuotas;
    



    let fechaVencimiento = new Date();
    for (let i = 0; i < cantidadCuotas; i++) {
      const fechaCuota = new Date(fechaVencimiento);
      fechaCuota.setMonth(fechaVencimiento.getMonth() + i);
      await conn.execute(
        `INSERT INTO cuota_pago (idPago, montoCuota, fechaVencimiento, idUsuarioModificacion) VALUES (?, ?, ?, ?)`,
        [idPago, montoCuota, fechaCuota, idUsuarioModificacion]
      );
    }

    await conn.commit();



    res.status(200).json({
      mensaje: 'Inscripción agregada correctamente',
      idInscripcion: idInscripcion,
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
