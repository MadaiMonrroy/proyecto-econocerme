import connection from "../db.js";
import { upload } from "../helpers/cloudinary.js";
import fs from "fs-extra";

// Obtener todos los módulos de un curso
export const listaModulos = async (req, res) => {
    const idCurso = req.params.idCurso;
    try {
      const [result] = await connection.query(
        "SELECT idModulo, nombre, descripcion, videoIntroURL, imagen, estado, fechaCreacion, ultimaActualizacion FROM modulo WHERE idCurso = ? AND estado = 1",
        [idCurso]
      );
      res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensaje: "Ocurrió un error en el servidor",
      });
    }
    console.log("aqui estoy")
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
  const { idCurso, nombre, descripcion, videoIntroURL, idUsuario } = req.body;

  try {
    if (!req.files) {
      return res.json({ msg: "Por Favor Debe Subir Un Archivo de Imagen" });
    }

    const fileTypes = ["image/jpeg", "image/png", "image/jpg"];
    const imageSize = 1024;

    let imagen = null;
    if (req.files.imagen) {
      const file = req.files.imagen;
      if (!fileTypes.includes(file.mimetype)) {
        return res.status(400).json({ mensaje: 'Formato de imagen no soportado' });
      }
      if (file.size / 1024 > imageSize) {
        return res.status(400).json({ mensaje: `La imagen debe ser menor a ${imageSize} KB` });
      }
      const cloudFile = await upload(file.tempFilePath, "Modulos");
      await fs.unlink(file.tempFilePath);
      imagen = cloudFile.secure_url;
    }

    // Insertar el nuevo módulo
    const [result] = await connection.query(
      "INSERT INTO modulo (idCurso, nombre, descripcion, videoIntroURL, imagen, estado, idUsuario) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [idCurso, nombre, descripcion, videoIntroURL, imagen, 1, idUsuario]
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
  const { nombre, descripcion, videoIntroURL, idUsuario } = req.body;

  let imagen = req.body.imagen;

  // Solo procesar la nueva imagen si se ha enviado un archivo
  if (req.files && req.files.imagen) {
    const file = req.files.imagen;
    const cloudFile = await upload(file.tempFilePath, "Modulos");
    await fs.unlink(file.tempFilePath);
    imagen = cloudFile.secure_url;
  }

  try {
    const [result] = await connection.query(
      `UPDATE modulo SET
                nombre = ?,
                descripcion = ?,
                videoIntroURL = ?,
                imagen = ?,
                estado = 1,
                idUsuario = ?
            WHERE idModulo = ?`,
      [nombre, descripcion, videoIntroURL, imagen, idUsuario, idModulo]
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
