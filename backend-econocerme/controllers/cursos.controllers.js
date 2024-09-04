import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import connection from '../db.js';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carpeta donde se guardarán las imágenes
const UPLOAD_DIR = path.join(__dirname, '../uploads/cursos');

// Crear carpeta si no existe
fs.ensureDirSync(UPLOAD_DIR);

// Obtener todos los cursos
export const listaCursos = async (req, res) => {
  try {
    const [result] = await connection.query(
      "SELECT idCurso, titulo, miniatura, especialidad, descripcion, duracion, precio FROM curso WHERE estado = 1"
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

// Obtener un curso por ID
export const obtenerCurso = async (req, res) => {
  const idCurso = req.params.id;
  try {
    const [result] = await connection.query(
      "SELECT idCurso, titulo, miniatura, especialidad, descripcion, duracion, precio FROM curso WHERE idCurso = ?",
      [idCurso]
    );
    if (result.length === 0) {
      return res.status(404).json({
        mensaje: "Curso no encontrado",
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

// Agregar un nuevo curso
export const agregarCurso = async (req, res) => {
  const {
    titulo,
    especialidad,
    descripcion,
    duracion,
    precio,
    idUsuario
  } = req.body;

  try {
    if (!req.files || !req.files.miniatura) {
      return res.json({ msg: "Por Favor Debe Subir Un Archivo de Imagen" });
    }

    // Guardar la imagen localmente
    const file = req.files.miniatura;
    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await file.mv(filePath);
    const imageUrl = `http://localhost:3000/uploads/cursos/${fileName}`;

    // Verificar si el curso ya existe por el título
    const [existingCurso] = await connection.query(
      "SELECT * FROM curso WHERE titulo = ?",
      [titulo]
    );

    if (existingCurso.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe un curso con este título",
      });
    }

    // Insertar el curso en la base de datos
    const [result] = await connection.query(
      "INSERT INTO curso (titulo, miniatura, especialidad, descripcion, duracion, precio, idUsuario) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [titulo, imageUrl, especialidad, descripcion, duracion, precio, idUsuario]
    );

    res.json({
      idCurso: result.insertId,
      mensaje: "Curso agregado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

// Editar curso
export const editarCurso = async (req, res) => {
  const idCurso = req.params.id;
  const {
    titulo,
    especialidad,
    descripcion,
    duracion,
    precio,
    idUsuario
  } = req.body;

  let miniatura = req.body.miniatura;

  // Solo procesar la nueva imagen si se ha enviado un archivo
  if (req.files && req.files.miniatura) {
    const file = req.files.miniatura;
    const ext = path.extname(file.name);
    miniatura = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, miniatura);
    await file.mv(filePath);
    miniatura = `http://localhost:3000/uploads/cursos/${miniatura}`;

  }

  try {
    const [result] = await connection.query(
      `UPDATE curso SET
                titulo = ?,
                miniatura = ?,
                especialidad = ?,
                descripcion = ?,
                duracion = ?,
                precio = ?,
                idUsuario = ?
            WHERE idCurso = ?`,
      [
        titulo,
        miniatura,
        especialidad,
        descripcion,
        duracion,
        precio,
        idUsuario,
        idCurso,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Curso no encontrado",
      });
    }
    res.json({
      mensaje: "Curso actualizado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

// Eliminar un curso por ID
export const eliminarCurso = async (req, res) => {
  const idCurso = req.params.id;

  try {
    // Actualizar el estado del curso a inactivo (estado = 0)
    const [result] = await connection.query(
      "UPDATE curso SET estado = 0 WHERE idCurso = ?",
      [idCurso]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Curso no encontrado",
      });
    }

    res.json({
      mensaje: "Curso eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};
