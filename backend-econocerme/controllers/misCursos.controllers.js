import connection from "../db.js";

export const obtenerMisCursos = async (req, res) => {
  const { idUsuario } = req.params;

  try {
    // Consulta SQL para obtener los cursos a los que está inscrito el usuario
    const [result] = await connection.query(
      `
        SELECT c.idCurso, c.titulo, c.miniatura, c.especialidad, c.descripcion, c.duracion, c.precio, c.estado, c.fechaCreacion, c.ultimaActualizacion
        FROM curso c
        JOIN detalle_inscripcion di ON c.idCurso = di.idCurso
        JOIN inscripcion i ON di.idInscripcion = i.idInscripcion
        WHERE i.idUsuario = ? AND i.estado = 1 AND c.estado = 1 
      `,
      [idUsuario]
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron cursos para este usuario." });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};
export const obtenerCursosNoInscritos = async (req, res) => {
  const { idUsuario } = req.params;

  try {
    // Consulta SQL para obtener los cursos en los que el usuario no está inscrito
    const [result] = await connection.query(
      `
    SELECT c.idCurso, c.titulo, c.miniatura, c.especialidad, c.descripcion, c.duracion, c.precio, c.estado, c.fechaCreacion, c.ultimaActualizacion
FROM curso c
WHERE c.estado = 1 
  AND c.idCurso NOT IN (
    SELECT di.idCurso
    FROM detalle_inscripcion di
    JOIN inscripcion i ON di.idInscripcion = i.idInscripcion
    WHERE i.idUsuario = ?
      AND i.estado = 1
  )
  `,
      [idUsuario]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "No se encontraron cursos no inscritos para este usuario.",
      });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};

// ESTAS SON CONSULTAS PARA SACAR LAS VISTAS DE LOS CURSOS DESDE EL ESTUDIANTE

// Función para obtener el curso, módulos, lecciones y detalles del usuario
export const obtenerCursoCompleto = async (req, res) => {
  const { idCurso } = req.params;

  try {
    const [curso] = await connection.query(
      `SELECT 
        c.titulo, 
        c.miniatura, 
        c.especialidad as especialidadCurso, 
        c.descripcion, 
        c.duracion, 
        c.precio, 
        c.ultimaActualizacion,
        u.id as idUsuario, 
        u.nombres, 
        u.primerApellido, 
        u.segundoApellido, 
        u.email, 
        u.tipoUsuario, 
        u.fotoPerfil,
        CASE
          WHEN u.tipoUsuario = 'coach' THEN u.biografia
          ELSE NULL
        END AS biografia,
        CASE
          WHEN u.tipoUsuario = 'coach' THEN u.especialidad
          ELSE NULL
        END AS especialidad,
        CASE
          WHEN u.tipoUsuario = 'coach' THEN u.experiencia
          ELSE NULL
        END AS experiencia
      FROM curso c
      INNER JOIN usuario u ON c.idUsuario = u.id
      WHERE c.idCurso = ?`,
      [idCurso]
    );

    if (curso.length === 0) {
      return res.status(203).json({
        status: "error",
        message: "Curso no encontrado",
      });
    }

    const modulos = await connection.query(
      `SELECT 
    m.nombre AS nombreModulo,
    GROUP_CONCAT(l.tituloSeccion ORDER BY l.idLeccion ASC) AS lecciones
  FROM modulo m
  LEFT JOIN leccion l ON m.idModulo = l.idModulo
  WHERE m.idCurso = ?
  GROUP BY m.idModulo`,
      [idCurso]
    );
    const modulos1 = modulos[0]; // Acceder solo a la primera parte que contiene los datos

    const resultado = {
      curso: {
        titulo: curso[0].titulo,
        miniatura: curso[0].miniatura,
        especialidadCurso: curso[0].especialidadCurso,
        descripcion: curso[0].descripcion,
        duracion: curso[0].duracion,
        precio: curso[0].precio,
        ultimaActualizacion: curso[0].ultimaActualizacion,
      },
      usuario: {
        idUsuario: curso[0].idUsuario,
        nombres: curso[0].nombres,
        primerApellido: curso[0].primerApellido,
        segundoApellido: curso[0].segundoApellido,
        email: curso[0].email,
        tipoUsuario: curso[0].tipoUsuario,
        fotoPerfil: curso[0].fotoPerfil,
        ...(curso[0].tipoUsuario === "coach" && {
          biografia: curso[0].biografia,
          especialidad: curso[0].especialidad,
          experiencia: curso[0].experiencia,
        }),
      },
      modulos: modulos1.map(modulo => ({
        nombreModulo: modulo.nombreModulo,
        lecciones: (modulo.lecciones ? modulo.lecciones.split(',').map(leccion => leccion.trim()) : [])
      }))
    };
    console.log(resultado,"Sdfsd");
    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
