import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connection from "../db.js";
import fs from "fs-extra";
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carpeta donde se guardarán las imágenes
const UPLOAD_DIR = path.join(__dirname, '../uploads/modulos');
// Carpeta donde se guardarán los videos
const VIDEO_UPLOAD_DIR = path.join(__dirname, '../uploads/modulos/videos');

// Crear carpeta si no existe
fs.ensureDirSync(VIDEO_UPLOAD_DIR);

// Crear carpeta si no existe
fs.ensureDirSync(UPLOAD_DIR);

// Obtener todos los módulos de un curso
export const listaModulos = async (req, res) => {
  const idCurso = req.params.idCurso;
  console.log("ID del curso recibido:", idCurso); // Agrega esta línea


  // Validar que el idCurso sea un número válido
  if (isNaN(idCurso)) {
    return res.status(400).json({ mensaje: "El id del curso es inválido" });
  }

  try {
    const [result] = await connection.query(
      "SELECT idModulo, nombre, descripcion, videoIntroURL, imagen, estado, fechaCreacion, ultimaActualizacion FROM modulo WHERE idCurso = ? AND estado = 1",
      [idCurso]
    );

    // Verificar si hay resultados
    if (result.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron módulos para este curso" });
    }

    // Responder con los módulos encontrados
    res.json(result);
  } catch (error) {
    console.error("Error al obtener los módulos:", error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};


// Obtener un módulo por ID
export const obtenerModulo = async (req, res) => {
  const idModulo = req.params.id;
  try {
    const [result] = await connection.query(
      "SELECT idModulo, nombre, descripcion, videoIntroURL, imagen, estado, fechaCreacion, ultimaActualizacion FROM modulo WHERE idModulo = ?",
      [idModulo]
    );
    if (result.length === 0) {
      return res.status(404).json({
        mensaje: "Módulo no encontrado",
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

// Agregar un nuevo módulo
export const agregarModulo = async (req, res) => {
  
  const { idCurso, nombre, descripcion, idUsuario } = req.body;
  try {
    if (!req.files || !req.files.imagen) {
      return res.status(400).json({ mensaje: "Por favor debe subir una imagen" });
    }
   
    // Subir imagen
    const fileImagen = req.files.imagen;
    const extImagen = path.extname(fileImagen.name);
    const fileNameImagen = `${uuidv4()}${extImagen}`;
    const filePathImagen = path.join(UPLOAD_DIR, fileNameImagen);
    await fileImagen.mv(filePathImagen);
    const imageUrl = `http://localhost:3000/uploads/modulos/${fileNameImagen}`;

    // Subir video (si existe)
    let videoUrl = req.files.videoIntroURL;
    console.log(videoUrl)
    if (req.files && req.files.videoIntroURL) {
      const fileVideo = req.files.videoIntroURL;
      const extVideo = path.extname(fileVideo.name);
      const fileNameVideo = `${uuidv4()}${extVideo}`;
      const filePathVideo = path.join(VIDEO_UPLOAD_DIR, fileNameVideo);
      await fileVideo.mv(filePathVideo);
      videoUrl = `http://localhost:3000/uploads/modulos/videos/${fileNameVideo}`;
    }

    // Insertar el nuevo módulo
    const [result] = await connection.query(
      "INSERT INTO modulo (idCurso, nombre, descripcion, videoIntroURL, imagen, estado, idUsuario) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [idCurso, nombre, descripcion, videoUrl, imageUrl, 1, idUsuario]
    );

    res.json({
      idModulo: result.insertId,
      mensaje: "Módulo agregado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};

// Editar un módulo
export const editarModulo = async (req, res) => {
  const idModulo = req.params.id;
  const { nombre, descripcion, idUsuario } = req.body;

  let imagen = req.body.imagen;
  let video = req.body.videoIntroURL; // Aquí capturamos la URL del video

  try {
    // Obtener los datos actuales del módulo antes de actualizar
    const [oldModulo] = await connection.query(
      "SELECT videoIntroURL, imagen FROM modulo WHERE idModulo = ?",
      [idModulo]
    );

    if (oldModulo.length === 0) {
      return res.status(404).json({ mensaje: "Módulo no encontrado" });
    }

    const oldVideoUrl = oldModulo[0].videoIntroURL;
    const oldImagenUrl = oldModulo[0].imagen;

    // Si se sube una nueva imagen, eliminar la anterior y guardar la nueva
    if (req.files && req.files.imagen) {
      const fileImagen = req.files.imagen;
      const extImagen = path.extname(fileImagen.name);
      const fileNameImagen = `${uuidv4()}${extImagen}`;
      const filePathImagen = path.join(UPLOAD_DIR, fileNameImagen);
      await fileImagen.mv(filePathImagen);
      imagen = `http://localhost:3000/uploads/modulos/${fileNameImagen}`;

      // Eliminar la imagen anterior del servidor
      const oldImagenPath = path.join(UPLOAD_DIR, path.basename(oldImagenUrl));
      if (fs.existsSync(oldImagenPath)) {
        fs.removeSync(oldImagenPath);  // Eliminar el archivo del servidor
      }
    }

    // Si se sube un nuevo video, eliminar el anterior y guardar el nuevo
    if (req.files && req.files.video) {
      const fileVideo = req.files.video;
      const extVideo = path.extname(fileVideo.name);
      const fileNameVideo = `${uuidv4()}${extVideo}`;
      const filePathVideo = path.join(VIDEO_UPLOAD_DIR, fileNameVideo);
      await fileVideo.mv(filePathVideo);
      video = `http://localhost:3000/uploads/modulos/videos/${fileNameVideo}`;

      // Eliminar el video anterior del servidor
      const oldVideoPath = path.join(VIDEO_UPLOAD_DIR, path.basename(oldVideoUrl));
      if (fs.existsSync(oldVideoPath)) {
        fs.removeSync(oldVideoPath);  // Eliminar el archivo del servidor
      }
    }

    // Actualizar el módulo en la base de datos
    const [result] = await connection.query(
      `UPDATE modulo SET
                nombre = ?,
                descripcion = ?,
                videoIntroURL = ?,
                imagen = ?,
                estado = 1,
                idUsuario = ?
            WHERE idModulo = ?`,
      [nombre, descripcion, video, imagen, idUsuario, idModulo]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Módulo no encontrado",
      });
    }

    res.json({
      mensaje: "Módulo actualizado correctamente",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};



// Eliminar un módulo por ID
export const eliminarModulo = async (req, res) => {
  const idModulo = req.params.id;
  const idUsuario = req.body.idUsuario;

  try {
    // Actualizar el estado del módulo a inactivo (estado = 0)
    const [result] = await connection.query(
      "UPDATE modulo SET estado = 0, idUsuario = ? WHERE idModulo = ?",
      [idUsuario, idModulo]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Módulo no encontrado",
      });
    }

    res.json({
      mensaje: "Módulo eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Ocurrió un error en el servidor",
    });
  }
};
