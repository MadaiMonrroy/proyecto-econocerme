import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connection from "../db.js";
import fs from "fs-extra";
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carpeta donde se guardarán los videos de lecciones
const LESSON_VIDEO_UPLOAD_DIR = path.join(__dirname, '../uploads/lecciones/videos');

// Crear carpeta si no existe
fs.ensureDirSync(LESSON_VIDEO_UPLOAD_DIR);

// Obtener todas las lecciones de un módulo
export const listaLecciones = async (req, res) => {
  const idModulo = req.params.idModulo;

  // Validar que el idModulo sea un número válido
  if (isNaN(idModulo)) {
    return res.status(400).json({ mensaje: "El id del módulo es inválido" });
  }

  try {
    const [result] = await connection.query(
      "SELECT idLeccion, tituloSeccion, videoURL, descripcion, estado, fechaCreacion, ultimaActualizacion FROM leccion WHERE idModulo = ? AND estado = 1",
      [idModulo]
    );

    // Verificar si hay resultados
    if (result.length === 0) {
      return res.status(200).json({ mensaje: "No se encontraron lecciones para este módulo" });
    }

    // Responder con las lecciones encontradas
    res.json(result);
  } catch (error) {
    console.error("Error al obtener las lecciones:", error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

// Obtener una lección por ID
export const obtenerLeccion = async (req, res) => {
  const idLeccion = req.params.id;
  try {
    const [result] = await connection.query(
      "SELECT idLeccion, tituloSeccion, videoURL, descripcion, estado, fechaCreacion, ultimaActualizacion FROM leccion WHERE idLeccion = ?",
      [idLeccion]
    );
    if (result.length === 0) {
      return res.status(200).json({
        mensaje: "Lección no encontrada",
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

// Agregar una nueva lección
export const agregarLeccion = async (req, res) => {
  
  const { idModulo, tituloSeccion, descripcion, idUsuario } = req.body;
  try {
    if (!req.files || !req.files.videoURL) {
      return res.status(400).json({ mensaje: "Por favor debe subir un video" });
    }
   
    // Subir video
    const fileVideo = req.files.videoURL;
    const extVideo = path.extname(fileVideo.name);
    const fileNameVideo = `${uuidv4()}${extVideo}`;
    const filePathVideo = path.join(LESSON_VIDEO_UPLOAD_DIR, fileNameVideo);
    await fileVideo.mv(filePathVideo);
    const videoUrl = `http://localhost:3000/uploads/lecciones/videos/${fileNameVideo}`;

    // Insertar la nueva lección
    
    const [result] = await connection.query(
      "INSERT INTO leccion (idModulo, tituloSeccion, videoURL, descripcion, idUsuario) VALUES (?, ?, ?, ?, ?)",
      [idModulo, tituloSeccion, videoUrl, descripcion, idUsuario]
    );

    res.json({
      idLeccion: result.insertId,
      mensaje: "Lección agregada correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

// Editar una lección
// Editar una lección
export const editarLeccion = async (req, res) => {
    const idLeccion = req.params.id;
    const { tituloSeccion, descripcion, idUsuario } = req.body;
  
    let video = req.body.video; // Aquí capturamos la URL del video
  
    try {
      // Obtener la URL del video actual antes de actualizar
      const [oldLeccion] = await connection.query(
        "SELECT videoURL FROM leccion WHERE idLeccion = ?",
        [idLeccion]
      );
  
      if (oldLeccion.length === 0) {
        return res.status(200).json({
          mensaje: "Lección no encontrada",
        });
      }
  
      const oldVideoUrl = oldLeccion[0].videoURL;
  
      // Solo procesar el nuevo video si se ha enviado un archivo
      if (req.files && req.files.video) {
        // Eliminar el video anterior del servidor
        const oldVideoPath = path.join(LESSON_VIDEO_UPLOAD_DIR, path.basename(oldVideoUrl));
        if (fs.existsSync(oldVideoPath)) {
          fs.removeSync(oldVideoPath);  // Eliminar el archivo del servidor
        }
  
        // Subir el nuevo video
        const fileVideo = req.files.video;
        const extVideo = path.extname(fileVideo.name);
        const fileNameVideo = `${uuidv4()}${extVideo}`;
        const filePathVideo = path.join(LESSON_VIDEO_UPLOAD_DIR, fileNameVideo);
        await fileVideo.mv(filePathVideo);
        video = `http://localhost:3000/uploads/lecciones/videos/${fileNameVideo}`;
      }
  
      // Actualizar la lección con el nuevo video o conservar el actual si no se cambia
      const [result] = await connection.query(
        `UPDATE leccion SET
                  tituloSeccion = ?,
                  videoURL = ?,
                  descripcion = ?,
                  estado = 1,
                  idUsuario = ?
              WHERE idLeccion = ?`,
        [tituloSeccion, video, descripcion, idUsuario, idLeccion]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({
          mensaje: "Lección no encontrada",
        });
      }
  
      res.json({
        mensaje: "Lección actualizada correctamente",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensaje: "Ocurrió un error en el servidor",
      });
    }
  };

// Eliminar una lección por ID
export const eliminarLeccion = async (req, res) => {
  const idLeccion = req.params.id;
  const idUsuario = req.body.idUsuario;

  try {
    // Actualizar el estado de la lección a inactivo (estado = 0)
    const [result] = await connection.query(
      "UPDATE leccion SET estado = 0, idUsuario = ? WHERE idLeccion = ?",
      [idUsuario, idLeccion]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Lección no encontrada",
      });
    }

    res.json({
      mensaje: "Lección eliminada correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};
