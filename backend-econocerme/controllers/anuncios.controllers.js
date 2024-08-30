import connection from '../db.js';
import { upload, borrarImagen } from "../helpers/cloudinary.js";
import fs from "fs-extra";

// Lista de anuncios
export const listaAnuncios = async (req, res) => {
    try {
        const [result] = await connection.query('SELECT id, titulo, miniatura, descripcion, fecha_inicio, fecha_fin, tipo FROM anuncio WHERE estado = 1');
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};

// Obtener un anuncio por ID
export const obtenerAnuncio = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await connection.query('SELECT id, titulo, miniatura, descripcion, fecha_inicio, fecha_fin, tipo FROM anuncio WHERE id = ?', [id]);
        if (result.length === 0) {
            return res.status(404).json({ mensaje: "Anuncio no encontrado" });
        }
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};

// Agregar un anuncio
export const agregarAnuncio = async (req, res) => {
    const { titulo, descripcion, fecha_inicio, fecha_fin, tipo } = req.body;

    try {
        if (!req.files) {
            return res.status(400).json({ mensaje: "Por favor, suba un archivo de imagen" });
        }

        // Subir la imagen a Cloudinary
        const cloudFile = await upload(req.files.miniatura.tempFilePath, "Anuncios");
        await fs.unlink(req.files.miniatura.tempFilePath);

        // Verificar si el título del anuncio ya existe
        const [existente] = await connection.query('SELECT * FROM anuncio WHERE titulo = ?', [titulo]);
        if (existente.length > 0) {
            return res.status(400).json({ mensaje: "El título del anuncio ya está registrado" });
        }

        // Insertar el nuevo anuncio en la base de datos
        const [result] = await connection.query('INSERT INTO anuncio (titulo, miniatura, descripcion, fecha_inicio, fecha_fin, tipo) VALUES (?, ?, ?, ?, ?, ?)', 
            [titulo, cloudFile.secure_url, descripcion, fecha_inicio, fecha_fin, tipo]);

        res.status(201).json({ mensaje: "Anuncio creado exitosamente", anuncioId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};

// Editar un anuncio
export const editarAnuncio = async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, fecha_inicio, fecha_fin, tipo } = req.body;

    let miniatura = req.body.miniatura;

    try {
        // Subir la nueva imagen a Cloudinary si se ha enviado un archivo
        if (req.files && req.files.miniatura) {
            const cloudFile = await upload(req.files.miniatura.tempFilePath, "Anuncios");
            await fs.unlink(req.files.miniatura.tempFilePath);
            miniatura = cloudFile.secure_url;
        }

        const [result] = await connection.query('UPDATE anuncio SET titulo = ?, miniatura = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, tipo = ? WHERE id = ?', 
            [titulo, miniatura, descripcion, fecha_inicio, fecha_fin, tipo, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Anuncio no encontrado" });
        }
        res.json({ mensaje: "Anuncio actualizado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};

// Eliminar un anuncio
export const eliminarAnuncio = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await connection.query('UPDATE anuncio SET estado = 0 WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Anuncio no encontrado" });
        }
        res.json({ mensaje: "Anuncio cambiado a estado inactivo exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};
