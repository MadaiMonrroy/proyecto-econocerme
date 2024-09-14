import connection from '../db.js';

export const obtenerMisCursos = async (req, res) => {
    const { idUsuario } = req.params;
  
    try {
      // Consulta SQL para obtener los cursos a los que está inscrito el usuario
      const [result] = await connection.query(`
        SELECT c.idCurso, c.titulo, c.miniatura, c.especialidad, c.descripcion, c.duracion, c.precio, c.estado, c.fechaCreacion, c.ultimaActualizacion
        FROM curso c
        JOIN detalle_inscripcion di ON c.idCurso = di.idCurso
        JOIN inscripcion i ON di.idInscripcion = i.idInscripcion
        WHERE i.idUsuario = ? AND i.estado = 1
      `, [idUsuario]);
  
      if (result.length === 0) {
        return res.status(404).json({ message: 'No se encontraron cursos para este usuario.' });
      }
  
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor.' });
    }
  };