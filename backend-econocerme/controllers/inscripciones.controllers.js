import connection from "../db.js";

export const listaPreInscripciones = async (req, res) => {
  try {
    const [inscripciones] = await connection.query(`
      SELECT 
        I.idInscripcion,
        CONCAT(U.nombres, ' ', U.primerApellido, ' ', U.segundoApellido) AS nombreCompleto,
        IFNULL(U.fotoPerfil, '${process.env.BASE_URL}/uploads/usuarios/avatar3.png') AS fotoPerfil,
        I.observacion,
        I.fechaInscripcion,
        I.estado
      FROM inscripcion I
      INNER JOIN usuario U ON U.id = I.idUsuario
      WHERE I.estado = 2
      GROUP BY I.idInscripcion, nombreCompleto, fotoPerfil, I.observacion, I.fechaInscripcion;
    `);
    const [cursos] = await connection.query(`
      SELECT 
        DI.idInscripcion,
        C.idCurso,
        C.titulo,
        C.miniatura,
        C.descripcion,
        C.duracion,
        C.precio,
        C.estado
      FROM detalle_inscripcion DI
      INNER JOIN curso C ON DI.idCurso = C.idCurso
    `); //TODO: corregir esto

    // Combinar los resultados
    const inscripcionesConCursos = inscripciones.map((inscripcion) => {
      const cursosRelacionados = cursos.filter(
        (curso) => curso.idInscripcion === inscripcion.idInscripcion
      );
      return {
        ...inscripcion,
        cursos: cursosRelacionados,
      };
    });

    // Enviar la respuesta con los datos obtenidos
    res.status(200).json({
      mensaje: "Lista de pre inscripciones obtenida correctamente",
      data: inscripcionesConCursos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

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
      WHERE I.estado = 1
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
        C.precio,
        C.estado
      FROM detalle_inscripcion DI
      INNER JOIN curso C ON DI.idCurso = C.idCurso
    `); //TODO: corregir esto

    // Combinar los resultados
    const inscripcionesConCursos = inscripciones.map((inscripcion) => {
      const cursosRelacionados = cursos.filter(
        (curso) => curso.idInscripcion === inscripcion.idInscripcion
      );
      return {
        ...inscripcion,
        cursos: cursosRelacionados,
      };
    });

    // Enviar la respuesta con los datos obtenidos
    res.status(200).json({
      mensaje: "Lista de inscripciones obtenida correctamente",
      data: inscripcionesConCursos,
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
    // Suponiendo que tienes una conexión a la base de datos llamada `connection`
    const [resultados] = await connection.query(
      `
        SELECT 
            u.id AS idUsuario,
            u.nombres,
            u.primerApellido,
            u.segundoApellido,
            u.email,
            c.idCurso AS idCurso,
            c.titulo AS nombreCurso,
            c.miniatura As miniatura,
            c.descripcion,
            di.precioCurso
        FROM 
            inscripcion i
        JOIN 
            usuario u ON i.idUsuario = u.id
        JOIN 
            detalle_inscripcion di ON i.idInscripcion = di.idInscripcion
        JOIN 
            curso c ON di.idCurso = c.idCurso
        WHERE 
            i.idInscripcion = ?
      `,
      [idInscripcion]
    );

    // Comprobar si se encontró la inscripción
    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: "Inscripción no encontrada" });
    }

    // Agrupar los resultados
    const { idUsuario, nombres, primerApellido, segundoApellido, email } = resultados[0];

    // Crear un array de cursos
    const cursos = resultados.map((row) => ({
      idCurso: row.idCurso,
      titulo: row.nombreCurso,
      descripcion: row.descripcion,
      miniatura:row.miniatura,
      precio: row.precioCurso, // Agregar el precio del curso
    }));
    // Enviar la respuesta
    return res.json({
      idUsuario,
      nombres,
      primerApellido,
      segundoApellido,
      email,
      cursos,
    });
  } catch (error) {
    console.error("Error al obtener inscripción:", error);
    // Verifica que no se haya enviado una respuesta antes de enviar un error
    if (!res.headersSent) {
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  }
};



export const agregarInscripcion = async (req, res) => {
  const {
    idUsuario,
    idCurso,
    observacion,
    cantidadCuotas,
    montoTotal,
    metodoPago,
    idUsuarioModificacion,
  } = req.body;

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
      // Consultar el precio del curso desde la tabla 'curso'
      const [[cursoData]] = await conn.execute(
        `SELECT precio FROM curso WHERE idCurso = ?`,
        [curso.idCurso]
      );

      const precioCurso = parseFloat(cursoData.precio); // Convertir el precio a número decimal

      // Insertar el curso con su precio en la tabla detalle_inscripcion
      await conn.execute(
        `INSERT INTO detalle_inscripcion (idInscripcion, idCurso, precioCurso) VALUES (?, ?, ?)`,
        [idInscripcion, curso.idCurso, precioCurso]
      );
    }

    // Insertar en la tabla pago
    const [pagoResult] = await conn.execute(
      `INSERT INTO pago (idInscripcion, montoTotal, idUsuarioModificacion) VALUES (?, ?, ?)`,
      [idInscripcion, montoTotal, idUsuarioModificacion]
    );

    const idPago = pagoResult.insertId;

    // Calcular el monto de la cuota
    let montoCuota =
      cantidadCuotas > 1
        ? montoTotal / cantidadCuotas
        : montoTotal / cantidadCuotas;

    let fechaVencimiento = new Date();
    let idCuotaPagoConEstadoCuota1 = null; // Para almacenar el idCuotaPago con estadoCuota = 1

    // Insertar cuotas en la tabla cuota_pago
    for (let i = 0; i < cantidadCuotas; i++) {
      const fechaCuota = new Date(fechaVencimiento);
      if (i === 0) {
        // Primera cuota con estadoCuota = 1
        const [cuotaResult] = await conn.execute(
          `INSERT INTO cuota_pago (idPago, montoCuota, estadoCuota, metodoPago, fechaPagoCuota, fechaVencimiento, idUsuarioModificacion) VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
          [idPago, montoCuota, 1, metodoPago, fechaCuota, idUsuarioModificacion]
        );
        idCuotaPagoConEstadoCuota1 = cuotaResult.insertId; // Guardar el idCuotaPago
      } else {
        // Cuotas restantes
        await conn.execute(
          `INSERT INTO cuota_pago (idPago, montoCuota, fechaVencimiento, idUsuarioModificacion) VALUES (?, ?, ?, ?)`,
          [idPago, montoCuota, fechaCuota, idUsuarioModificacion]
        );
      }
      // Actualizar la fecha de vencimiento para la siguiente cuota
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    }
    await conn.execute(
      `UPDATE inscripcion 
       SET estado = 1, fechaInscripcion = CURRENT_TIMESTAMP 
       WHERE idInscripcion = ?`,
      [idInscripcion]
    );

    // Calcular el progreso de pago (100/cantidadCuotas)
    const progresoPago = 100 / cantidadCuotas;

    // Actualizar el progresoPago en la tabla detalle_inscripcion
    for (const curso of idCurso) {
      await conn.execute(
        `UPDATE detalle_inscripcion
         SET progresoPago = ?
         WHERE idInscripcion = ? AND idCurso = ?`,
        [progresoPago, idInscripcion, curso.idCurso]
      );
    }

    await conn.commit();

    res.status(200).json({
      mensaje: "Inscripción agregada correctamente",
      idInscripcion: idInscripcion,
      idCuotaPago: idCuotaPagoConEstadoCuota1, // Devolver el idCuotaPago con estadoCuota = 1
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

export const agregarPreinscripcion = async (req, res) => {
  const { idUsuario, idCurso, idUsuarioModificacion } = req.body;

  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();

    // Insertar en la tabla inscripcion
    const [inscripcionResult] = await conn.execute(
      `INSERT INTO inscripcion (idUsuario, idUsuarioModificacion) VALUES (?, ?)`,
      [idUsuario, idUsuarioModificacion]
    );
    const idInscripcion = inscripcionResult.insertId;

    // Obtener el precio de cada curso y luego insertar en detalle_inscripcion
    for (const cursoId of idCurso) {
      const [[cursoInfo]] = await conn.execute(
        `SELECT precio FROM curso WHERE idCurso = ?`,
        [cursoId] // Utilizamos directamente cursoId
      );

      await conn.execute(
        `INSERT INTO detalle_inscripcion (idInscripcion, idCurso, precioCurso) VALUES (?, ?, ?)`,
        [idInscripcion, cursoId, cursoInfo.precio]
      );
    }
    await conn.commit();

    res.status(200).json({
      mensaje: "Preinscripción realizada correctamente",
      idInscripcion: idInscripcion,
    });
  } catch (error) {
    await conn.rollback(); // Revertir transacción en caso de error
    console.error(error);
    res.status(500).json({
      mensaje: "Ocurrió un error en el servidor durante la preinscripción",
    });
  } finally {
    conn.release(); // Liberar la conexión
  }
};

export const completarInscripcion = async (req, res) => {
  const {
    idUsuario,
    idInscripcion,
    montoTotal,
    idCurso,
    observacion,
    cantidadCuotas,
    metodoPago,
    montoCuota,
    idUsuarioModificacion,
  } = req.body;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();

    // Insertar en la tabla pago
    const [pagoResult] = await conn.execute(
      `INSERT INTO pago (idInscripcion, montoTotal, idUsuarioModificacion) VALUES (?, ?, ?)`,
      [idInscripcion, montoTotal, idUsuarioModificacion]
    );

    const idPago = pagoResult.insertId;

    // Calcular el monto de la cuota
    let montoCuota = montoTotal / cantidadCuotas;

    // Insertar cuotas en la tabla cuota_pago
    let fechaVencimiento = new Date();
    let idCuotaPagoConEstadoCuota1 = null;

    for (let i = 0; i < cantidadCuotas; i++) {
      const fechaCuota = new Date(fechaVencimiento);
      if (i === 0) {
        const [cuotaResult] = await conn.execute(
          `INSERT INTO cuota_pago (idPago, montoCuota, estadoCuota, metodoPago, fechaPagoCuota, fechaVencimiento, idUsuarioModificacion) VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
          [idPago, montoCuota, 1, metodoPago, fechaCuota, idUsuarioModificacion]
        );
        idCuotaPagoConEstadoCuota1 = cuotaResult.insertId;
      } else {
        await conn.execute(
          `INSERT INTO cuota_pago (idPago, montoCuota, fechaVencimiento, idUsuarioModificacion) VALUES (?, ?, ?, ?)`,
          [idPago, montoCuota, fechaCuota, idUsuarioModificacion]
        );
      }
      // Avanzar la fecha de vencimiento para la siguiente cuota
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    }

    // Actualizar estado de inscripcion a 1, fechaInscripcion y observacion
    await conn.execute(
      `UPDATE inscripcion SET estado = 1, fechaInscripcion = CURRENT_TIMESTAMP, observacion = ? WHERE idInscripcion = ?`,
      [observacion, idInscripcion] // Agregamos el valor de observacion
    );
    // Calcular y actualizar progresoPago en detalle_inscripcion (similar a agregarInscripcion)
    const progresoPago = 100 / cantidadCuotas;

    // Actualizar el progresoPago en la tabla detalle_inscripcion para cada curso
    for (const curso of idCurso) {
      await conn.execute(
        `UPDATE detalle_inscripcion
         SET progresoPago = ?
         WHERE idInscripcion = ? AND idCurso = ?`,
        [progresoPago, idInscripcion, curso.idCurso]
      );
    }

    await conn.commit();

    res.status(200).json({
      mensaje: "Inscripción completada correctamente",
      idInscripcion: idInscripcion,
      idCuotaPago: idCuotaPagoConEstadoCuota1,
    });
  } catch (error) {
    await conn.rollback(); // Revertir transacción en caso de error
    console.error(error);
    res.status(500).json({
      mensaje: "Ocurrió un error en el servidor al completar la inscripción",
    });
  } finally {
    conn.release(); // Liberar la conexión
  }
};

export const eliminarPreInscripcion = async (req, res) => {
  const idInscripcion = req.params.idInscripcion;
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

export const listaInscritosCoach = async (req, res) => {
  const idCreador = req.params.idCreador;

  try {
    // Consulta que obtiene los detalles de los usuarios inscritos en los cursos del creador
    const [result] = await connection.query(`
      SELECT 
        u.nombres, 
        u.primerApellido, 
        u.segundoApellido, 
        u.email, 
        u.fotoPerfil, 
        u.fechaNacimiento, 
        u.estado,
        c.titulo, 
        c.miniatura, 
        c.especialidad
      FROM usuario u
      JOIN inscripcion i ON u.id = i.idUsuario
      JOIN detalle_inscripcion di ON i.idInscripcion = di.idInscripcion
      JOIN curso c ON di.idCurso = c.idCurso
      WHERE c.idCreador = ? AND (c.estado = 1 OR c.estado = 2)
    `, [idCreador]);

    if (result.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron inscritos para los cursos del creador especificado",
      });
    }

    res.json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};






