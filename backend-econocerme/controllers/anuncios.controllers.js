import connection from "../db.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Carpeta donde se guardarán las imágenes
const UPLOAD_DIR = path.join(__dirname, "../uploads/anuncios");

// Crear carpeta si no existe
fs.ensureDirSync(UPLOAD_DIR);

// Lista de anuncios
export const listaAnuncios = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Establecemos la fecha actual a la medianoche
    // Restar un día para obtener la fecha de ayer
    const formatoFechaHoy = hoy.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'

    // Actualiza los anuncios que tienen fecha_fin menor a hoy y no están en estado 2 ni 0
    await connection.query(
      "UPDATE anuncio SET estado = '2' WHERE fecha_fin < ? AND estado != '2' AND estado != '0'",
      [hoy]
    );
    
    // Actualiza los anuncios que tienen fecha_fin mayor o igual a hoy y no están en estado 0
    await connection.query(
      "UPDATE anuncio SET estado = '1' WHERE fecha_fin >= ? AND estado != '1' AND estado != '0'",
      [formatoFechaHoy]
    );

    // Selecciona los anuncios que tienen estado 1 o 2
    const [result] = await connection.query(
      "SELECT id, titulo, miniatura, descripcion, fecha_inicio, fecha_fin, tipo, estado FROM anuncio WHERE estado = 1 OR estado = 2"
    );
    
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
    const [result] = await connection.query(
      "SELECT id, titulo, miniatura, descripcion, fecha_inicio, fecha_fin, tipo, estado FROM anuncio WHERE id = ?",
      [id]
    );
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
  const { titulo, descripcion, fecha_inicio, fecha_fin, tipo, idUsuario } = req.body;
  try {
    if (!req.files || !req.files.miniatura) {
      return res
        .status(400)
        .json({ mensaje: "Por favor, suba un archivo de imagen" });
    }

    // Guardar la imagen localmente
    const file = req.files.miniatura;

    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await file.mv(filePath);
    const imageUrl = `http://localhost:3000/uploads/anuncios/${fileName}`;

    // Verificar si el título del anuncio ya existe
    const [existente] = await connection.query(
      "SELECT * FROM anuncio WHERE titulo = ?",
      [titulo]
    );
    if (existente.length > 0) {
      return res
        .status(400)
        .json({ mensaje: "El título del anuncio ya está registrado" });
    }

    // Insertar el nuevo anuncio en la base de datos
    const [result] = await connection.query(
      "INSERT INTO anuncio (titulo, miniatura, descripcion, fecha_inicio, fecha_fin, tipo, idUsuario) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [titulo, imageUrl, descripcion, fecha_inicio, fecha_fin, tipo, idUsuario]
    ); // Asumiendo que el estado inicial es 1

    res
      .status(201)
      .json({
        mensaje: "Anuncio creado exitosamente",
        anuncioId: result.insertId,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};

// Editar un anuncio
export const editarAnuncio = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_inicio, fecha_fin, tipo, idUsuario } = req.body;

  try {
    // Obtener la URL de la miniatura actual antes de actualizar
    const [oldAnuncio] = await connection.query(
      "SELECT miniatura FROM anuncio WHERE id = ?",
      [id]
    );
    if (oldAnuncio.length === 0) {
      return res.status(404).json({ mensaje: "Anuncio no encontrado" });
    }

    const oldMiniaturaUrl = oldAnuncio[0].miniatura;
    let miniatura = oldMiniaturaUrl;

    // Si se sube una nueva imagen, eliminar la anterior y guardar la nueva
    if (req.files && req.files.miniatura) {
      const file = req.files.miniatura;
      const ext = path.extname(file.name);
      miniatura = `${uuidv4()}${ext}`;
      const filePath = path.join(UPLOAD_DIR, miniatura);
      await file.mv(filePath);
      miniatura = `http://localhost:3000/uploads/anuncios/${miniatura}`;

      // Eliminar la imagen anterior del servidor
      const oldMiniaturaPath = path.join(
        UPLOAD_DIR,
        path.basename(oldMiniaturaUrl)
      );
      if (fs.existsSync(oldMiniaturaPath)) {
        fs.removeSync(oldMiniaturaPath); // Eliminar el archivo del servidor
      }
    }

    // Actualizar el anuncio en la base de datos
    const [result] = await connection.query(
      "UPDATE anuncio SET titulo = ?, miniatura = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, tipo = ?, idUsuario = ? WHERE id = ?",
      [titulo, miniatura, descripcion, fecha_inicio, fecha_fin, tipo,idUsuario, id]
    );

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
  const { idUsuario } = req.query;
  

  try {
    const [result] = await connection.query(
      "UPDATE anuncio SET estado = 0, idUsuario = ? WHERE id = ?",
      [idUsuario, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Anuncio no encontrado" });
    }
    res.json({ mensaje: "Anuncio cambiado a estado inactivo exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};
