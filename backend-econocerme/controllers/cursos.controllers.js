import connection from "../db.js";

import { upload, borrarImagen } from "../helpers/cloudinary.js";
import fs from "fs-extra";

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
    miniatura,
    especialidad,
    descripcion,
    duracion,
    precio,
  } = req.body;

  try {
    if (!req.files) {
      return res.json({ msg: "Por Favor Debe Subir Un Archivo de Imagen" });
    }
    const fileTypes = ["image/jpeg", "image/png", "image/jpg"];
    const imageSize = 1024;

    console.log(req.files.miniatura, " El Primer Archivo del Cambino");

    const cloudFile = await upload(req.files.miniatura.tempFilePath, "Cursos");
    await fs.unlink(req.files.miniatura.tempFilePath);
    
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

    // Si el curso no existe, procedemos a insertarlo
    const [result] = await connection.query(
      "INSERT INTO curso (titulo, miniatura, especialidad, descripcion, duracion, precio) VALUES (?, ?, ?, ?, ?, ?)",
      [titulo, cloudFile.secure_url, especialidad, descripcion, duracion, precio]
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
const crearCurso = async (req, res = response) => {
  try {
    //puedes quitar esto por si no quieres que la imagen sea obligatoria
    if (!req.files) {
      return res.json({ msg: "Por Favor Debe Subir Un Archivo de Imagen" });
    }
    const fileTypes = ["image/jpeg", "image/png", "image/jpg"];
    const imageSize = 1024;
    // if (!fileTypes.includes(image.mimetype)) return res.send('Image formats supported: JPG, PNG, JPEG');
    // if (image.size / 1024 > imageSize) return res.send(Image size should be less than ${imageSize}kb);
    const { file } = req.files;
    console.log(file);

    console.log(req.files.miniatura, " El Primer Archivo del Cambino");
    // const cloudFile = await upload(req.files.file.tempFilePath, "Libros");
    // const datos = await newDatos(req.body);
    // await fs.unlink(req.files.file.tempFilePath);

    // LOGICA PARA GUARDAR EL CURSO EN TU BASE DE DATOS

    res.status(200).json({
      ok: true,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Hable Con el Administrador",
    });
  }
};

//editar curso
export const editarCurso = async (req, res) => {
  const idCurso = req.params.id;
  const {
    titulo,
    especialidad,
    descripcion,
    duracion,
    precio,
  } = req.body;

  let miniatura = req.body.miniatura;

  // Solo procesar la nueva imagen si se ha enviado un archivo
  if (req.files && req.files.miniatura) {
    const file = req.files.miniatura;
    const cloudFile = await upload(file.tempFilePath, "Cursos");
    await fs.unlink(file.tempFilePath);
    miniatura = cloudFile.secure_url;
  }

  try {
    const [result] = await connection.query(
      `UPDATE curso SET
                titulo = ?,
                miniatura = ?,
                especialidad = ?,
                descripcion = ?,
                duracion = ?,
                precio = ?
            WHERE idCurso = ?`,
      [
        titulo,
        miniatura,
        especialidad,
        descripcion,
        duracion,
        precio,
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
