import connection from "../db.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; // Para enviar correos
import crypto from "crypto"; // Para generar tokens únicos
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carpeta donde se guardarán las imágenes
const UPLOAD_DIR = path.join(__dirname, "../uploads/usuarios");

// Crear carpeta si no existe
fs.ensureDirSync(UPLOAD_DIR);

// Configurar el transporte de nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: "desarrollatuesencia2810@gmail.com",
    pass: "uytfriafjzcohdgj",
  },
});
export const listaUsuariosInscripciones = async (req, res) => {
  try {
    const [result] = await connection.query(
      `SELECT id, nombres, primerApellido, segundoApellido, email, fotoPerfil, fechaNacimiento, tipoUsuario, estado FROM usuario WHERE estado = 1 OR estado = 2 AND tipoUsuario = "usuario"`
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};
// Función para enviar correo con la contraseña
async function enviarCorreoContrasenia(
  email,
  contrasenia,
  tokenConfirmacion,
  nombreCompleto
) {
  const imageURL =
    "https://res.cloudinary.com/dgzjotfzz/image/upload/v1726678334/logoec_dxrwql.png";
  const nombreUsuario = nombreCompleto;
  const mailOptions = {
    from: "desarrollatuesencia2810@gmail.com",
    to: email,
    subject: "Bienvenido a nuestra plataforma",
    html: `
           <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; color: #555; line-height: 1.6; padding: 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(to right, rgba(165, 63, 191, 0.9), rgba(33, 3, 85, 0.9)); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <img src="${imageURL}" alt="Logo de la Empresa" style="max-width: 180px; height: auto; margin-bottom: 15px;">
    </div>
    
    <!-- Main Content -->
    <div style="background-color: #fff; padding: 25px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">¡Bienvenida a Encantada de Conocerme!</h1>
        
        <p style="color: #555; margin-bottom: 15px;">Hola <strong>${nombreUsuario}</strong>,</p>
        
        <p style="color: #555; margin-bottom: 15px;">Tu cuenta ha sido creada exitosamente. A continuación, te proporcionamos tus datos de acceso:</p>
        
        <div style="background-color: rgba(165, 63, 191, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px; font-size: 16px; color: #333;">
                <strong>Email:</strong> 
                <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a>
            </p>
            <p style="margin: 0; font-size: 16px; color: #333;">
                <strong>Contraseña:</strong> ${contrasenia}
            </p>
        </div>
        
        <p style="color: #555; margin-bottom: 20px;">Para activar tu cuenta, por favor, confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
        
        <div style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:5173/confirmar/${tokenConfirmacion}" style="background: linear-gradient(to right, rgba(165, 63, 191, 0.9), rgba(33, 3, 85, 0.9)); color: white; box-shadow: 0 10px 15px rgba(33, 3, 85, 0.533); padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block; transition: all 0.3s ease;" onmouseover="this.style.boxShadow='0 15px 25px rgba(33, 3, 85, 0.6)'; this.style.transform='translateY(-3px)';" onmouseout="this.style.boxShadow='0 10px 15px rgba(33, 3, 85, 0.533)'; this.style.transform='translateY(0)';">Confirmar Cuenta</a>
        </div>
        
        <p style="color: #555; margin-top: 20px;">Si tienes algún problema con el enlace, por favor contáctanos.</p>
        
        <p style="color: #555; margin-top: 20px;">Saludos cordiales,<br>El equipo de Encantada de Conocerme</p>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(to right, rgba(165, 63, 191, 0.9), rgba(33, 3, 85, 0.9)); padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: #f2d3f8; margin: 5px 0; font-size: 14px;">Si tienes preguntas o necesitas ayuda, no dudes en contactarnos en <a href="mailto:econocerme@empresa.com" style="color: #7ebcff; text-decoration: underline;">econocerme@empresa.com</a>.</p>
        <p style="color: #f2d3f8; margin: 5px 0; font-size: 14px;">&copy; 2024 Encantada de Conocerme. Todos los derechos reservados.</p>
    </div>

</body>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
}

// Función para confirmar el usuario
export const confirmarUsuario = async (req, res) => {
  const token = req.params.token;

  try {
    const [result] = await connection.query(
      "UPDATE usuario SET estado = 1 WHERE tokenConfirmacion = ?",
      [token]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ mensaje: "Token de confirmación no válido" });
    }

    res.json({ mensaje: "Cuenta confirmada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};

// Obtener todos los usuarios
export const listaUsuarios = async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await connection.query(
      `SELECT id, nombres, primerApellido, segundoApellido, email, 
      IFNULL(fotoPerfil, '${process.env.BASE_URL}/uploads/usuarios/avatar3.png') AS fotoPerfil, 
      fechaNacimiento, tipoUsuario, estado 
      FROM usuario 
      WHERE (estado = 1 OR estado = 2) 
      AND id != ?`,
      [id]
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};

// Obtener un usuario por ID
export const obtenerUsuario = async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await connection.query(
      `SELECT id, nombres, primerApellido, segundoApellido, email, fotoPerfil, fechaNacimiento, tipoUsuario, estado FROM usuario WHERE id = ?`,
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};


// Obtener un usuario por ID
export const obtenerUsuarioCoach = async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await connection.query(
      `SELECT id, nombres, primerApellido, segundoApellido, email, fotoPerfil, biografia, especialidad,  experiencia,  fechaNacimiento, tipoUsuario, estado FROM usuario WHERE id = ?`,
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};

// Agregar un nuevo usuario
export const agregarUsuario = async (req, res) => {
  const {
    nombres,
    primerApellido,
    segundoApellido,
    email,
    contrasenia,
    fechaNacimiento,
    tipoUsuario,
    idUsuario,
    nombreCompleto,
  } = req.body;

  if (
    !nombres ||
    !primerApellido ||
    !segundoApellido ||
    !email ||
    !contrasenia ||
    !fechaNacimiento ||
    !tipoUsuario
  ) {
    return res.status(400).json({ mensaje: "Todos los campos son requeridos" });
  }

  try {
    const [existingUsuario] = await connection.query(
      "SELECT * FROM usuario WHERE email = ?",
      [email]
    );
    if (existingUsuario.length > 0) {
      return res
        .status(400)
        .json({
          mensaje:
            "Ingresa un nuevo usuario porque ya existe un usuario con este email",
        });
    }

    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    const file = req.files.fotoPerfil;

    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await file.mv(filePath);
    const fotoPerfilUrl = `http://localhost:3000/uploads/usuarios/${fileName}`;

    // Generar un token de confirmación único
    const tokenConfirmacion = crypto.randomBytes(20).toString("hex");

    const [result] = await connection.query(
      "INSERT INTO usuario (nombres, primerApellido, segundoApellido, email, contrasenia, fotoPerfil, fechaNacimiento, tipoUsuario, estado, idUsuario, tokenConfirmacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2,?, ?)",
      [
        nombres,
        primerApellido,
        segundoApellido,
        email,
        hashedPassword,
        fotoPerfilUrl,
        fechaNacimiento,
        tipoUsuario,
        idUsuario,
        tokenConfirmacion,
      ]
    );

    // Enviar la contraseña generada y el enlace de confirmación al usuario por correo
    await enviarCorreoContrasenia(
      email,
      contrasenia,
      tokenConfirmacion,
      nombreCompleto
    );

    res.json({
      id: result.insertId,
      mensaje:
        "Usuario agregado correctamente, por favor revisa tu correo para confirmar tu cuenta",
    });
  } catch (error) {
    console.error("Error al agregar el usuario:", error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};
export const agregarUsuariocoach = async (req, res) => {
  const {
    nombres,
    primerApellido,
    segundoApellido,
    email,
    contrasenia,
    fechaNacimiento,
    tipoUsuario,
    biografia,
    especialidad,
    experiencia,
    videoPresentacion,
  } = req.body;

  if (
    !nombres ||
    !primerApellido ||
    !segundoApellido ||
    !email ||
    !contrasenia ||
    !fechaNacimiento ||
    !tipoUsuario
  ) {
    return res.status(400).json({ mensaje: "Todos los campos son requeridos" });
  }

  try {
    const [existingUsuario] = await connection.query(
      "SELECT * FROM usuario WHERE email = ?",
      [email]
    );
    if (existingUsuario.length > 0) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe un usuario con este email" });
    }

    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    let fotoPerfilUrl = null;
    if (req.files && req.files.fotoPerfil) {
      const file = req.files.fotoPerfil;
      const fileTypes = ["image/jpeg", "image/png", "image/jpg"];
      const imageSize = 1024;

      if (!fileTypes.includes(file.mimetype)) {
        return res
          .status(400)
          .json({ mensaje: "Formato de imagen no soportado" });
      }
      if (file.size / 1024 > imageSize) {
        return res
          .status(400)
          .json({ mensaje: `La imagen debe ser menor de ${imageSize} KB` });
      }

      try {
        const cloudFile = await upload(file.tempFilePath, "Usuarios");
        await fs.unlink(file.tempFilePath);
        fotoPerfilUrl = cloudFile.secure_url;
      } catch (uploadError) {
        console.error("Error al subir la imagen:", uploadError);
        return res.status(500).json({ mensaje: "Error al subir la imagen" });
      }
    }

    // Generar un token de confirmación único
    const tokenConfirmacion = crypto.randomBytes(20).toString("hex");

    const [result] = await connection.query(
      `INSERT INTO usuario 
                (nombres, primerApellido, segundoApellido, email, contrasenia, fotoPerfil, fechaNacimiento, tipoUsuario, estado, tokenConfirmacion, biografia, especialidad, experiencia, videoPresentacion) 
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, 2, ?, ?, ?, ?, ?)`,
      [
        nombres,
        primerApellido,
        segundoApellido,
        email,
        hashedPassword,
        fotoPerfilUrl,
        fechaNacimiento,
        tipoUsuario,
        tokenConfirmacion,
        biografia,
        especialidad,
        experiencia,
        videoPresentacion,
      ]
    );

    // Enviar la contraseña generada y el enlace de confirmación al usuario por correo
    await enviarCorreoContrasenia(email, contrasenia, tokenConfirmacion);

    res.json({
      id: result.insertId,
      mensaje:
        "Usuario agregado correctamente, por favor revisa tu correo para confirmar tu cuenta",
    });
  } catch (error) {
    console.error("Error al agregar el usuario:", error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};

// Editar un usuario por ID
// Función para actualizar los demás campos del usuario
export const editarUsuario = async (req, res) => {
  const id = req.params.id;
  const {
    nombres,
    primerApellido,
    segundoApellido,
    email,
    fechaNacimiento,
    tipoUsuario,
    idUsuario,
  } = req.body;

  try {
    const [oldFotPerfil] = await connection.query(
      "SELECT fotoPerfil FROM usuario WHERE id = ?",
      [id]
    );

    const oldFotoPerfilUrl = oldFotPerfil[0].fotoPerfil;
    let fotoPerfil = oldFotoPerfilUrl;

    // Gestionar el cambio de imagen de perfil si se proporciona una nueva
    if (req.files && req.files.fotoPerfil) {
      const file = req.files.fotoPerfil;
      const ext = path.extname(file.name);
      fotoPerfil = `${uuidv4()}${ext}`;
      const filePath = path.join(UPLOAD_DIR, fotoPerfil);
      await file.mv(filePath);
      fotoPerfil = `http://localhost:3000/uploads/usuarios/${fotoPerfil}`;

      // Eliminar la imagen anterior si existe
      if (oldFotoPerfilUrl && oldFotoPerfilUrl !== "null") {
        const oldFotoPerfilPath = path.join(
          UPLOAD_DIR,
          path.basename(oldFotoPerfilUrl)
        );
        if (fs.existsSync(oldFotoPerfilPath)) {
          fs.unlinkSync(oldFotoPerfilPath);
        }
      }
    }

    // Actualizar los demás datos del usuario
    const [result] = await connection.query(
      `UPDATE usuario SET
                nombres = ?,
                primerApellido = ?,
                segundoApellido = ?,
                email = ?,
                fotoPerfil = ?,
                fechaNacimiento = ?,
                tipoUsuario = ?,
                idUsuario = ?
            WHERE id = ?`,
      [
        nombres,
        primerApellido,
        segundoApellido,
        email,
        fotoPerfil,
        fechaNacimiento,
        tipoUsuario,
        idUsuario,
        id,
      ]
    );

    // Realizar una nueva consulta para obtener el usuario actualizado
    const [updatedUsuario] = await connection.query(
      "SELECT * FROM usuario WHERE id = ?",
      [id]
    );

    // Devolver el usuario actualizado en la respuesta
    res.json({
      mensaje: "Usuario actualizado correctamente",
      usuario: updatedUsuario[0], // Devuelve el usuario actualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};

// Función para gestionar el cambio de contraseña
export const cambiarContrasenia = async (req, res) => {
  const id = req.params.id;
  const { idUsuario, contrasenia, email, nombreCompleto } = req.body;
  try {
    const [existingUser] = await connection.query(
      "SELECT contrasenia FROM usuario WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    let hashedPassword = existingUser[0].contrasenia; // Mantener la contraseña actual por defecto
    // Si se proporciona una nueva contraseña, actualizarla y enviar correo
    if (contrasenia && contrasenia !== hashedPassword) {
      hashedPassword = await bcrypt.hash(contrasenia, 10);
      // Actualizar la contraseña en la base de datos
      const [result] = await connection.query(
        `UPDATE usuario SET
                contrasenia = ?,
                idUsuario = ?
 
              WHERE id = ?`,
        [hashedPassword, idUsuario, id]
      );
      console.log(nombreCompleto);
      // Enviar correo con la nueva contraseña
      await enviarCorreoNuevaContrasenia(email, contrasenia, nombreCompleto);

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }
      return { mensaje: "Contraseña actualizada correctamente" };
    } else {
      return { mensaje: "No se requiere actualización de contraseña" };
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};

export const editarUsuariocoach = async (req, res) => {
  const id = req.params.id;
  const {
    nombres,
    primerApellido,
    segundoApellido,
    email,
    fechaNacimiento,
    biografia,
    experiencia,
    especialidad,
    tipoUsuario,
    idUsuario,
  } = req.body;

  try {
    const [oldFotPerfil] = await connection.query(
      "SELECT fotoPerfil FROM usuario WHERE id = ?",
      [id]
    );

    const oldFotoPerfilUrl = oldFotPerfil[0].fotoPerfil;
    let fotoPerfil = oldFotoPerfilUrl;

    // Gestionar el cambio de imagen de perfil si se proporciona una nueva
    if (req.files && req.files.fotoPerfil) {
      const file = req.files.fotoPerfil;
      const ext = path.extname(file.name);
      fotoPerfil = `${uuidv4()}${ext}`;
      const filePath = path.join(UPLOAD_DIR, fotoPerfil);
      await file.mv(filePath);
      fotoPerfil = `http://localhost:3000/uploads/usuarios/${fotoPerfil}`;

      // Eliminar la imagen anterior si existe
      if (oldFotoPerfilUrl && oldFotoPerfilUrl !== "null") {
        const oldFotoPerfilPath = path.join(
          UPLOAD_DIR,
          path.basename(oldFotoPerfilUrl)
        );
        if (fs.existsSync(oldFotoPerfilPath)) {
          fs.unlinkSync(oldFotoPerfilPath);
        }
      }
    }

    // Actualizar los demás datos del usuario
    const [result] = await connection.query(
      `UPDATE usuario SET
                nombres = ?,
                primerApellido = ?,
                segundoApellido = ?,
                email = ?,
                biografia = ?,
                experiencia = ?,
                especialidad = ?,
                fotoPerfil = ?,
                fechaNacimiento = ?,
                tipoUsuario = ?,
                idUsuario = ?
            WHERE id = ?`,
      [
        nombres,
        primerApellido,
        segundoApellido,
        email,
        biografia,
        experiencia,
        especialidad,
        fotoPerfil,
        fechaNacimiento,
        tipoUsuario,
        idUsuario,
        id,
      ]
    );

    // Realizar una nueva consulta para obtener el usuario actualizado
    const [updatedUsuario] = await connection.query(
      "SELECT * FROM usuario WHERE id = ?",
      [id]
    );

    // Devolver el usuario actualizado en la respuesta
    res.json({
      mensaje: "Usuario actualizado correctamente",
      usuario: updatedUsuario[0], // Devuelve el usuario actualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};

// Función para enviar la nueva contraseña por correo
async function enviarCorreoNuevaContrasenia(
  email,
  contrasenia,
  nombreCompleto
) {
  const imageURL = `https://res.cloudinary.com/dgzjotfzz/image/upload/v1726678334/logoec_dxrwql.png`;
  const loginURL = `http://localhost:5173/`;
  const mailOptions = {
    from: "desarrollatuesencia2810@gmail.com",
    to: email,
    subject: "Actualización de Contraseña",
    html: `
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; color: #555; line-height: 1.6; padding: 20px;"> 

    <!-- Header -->
    <div style="background: linear-gradient(to right, rgba(165, 63, 191, 0.9), rgba(33, 3, 85, 0.9)); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <img src="${imageURL}" alt="Logo de la Empresa" style="max-width: 180px; height: auto; margin-bottom: 15px;">
        <h2 style="color: #fff; font-size: 26px; margin: 0;">Actualización Exitosa de tu Contraseña</h2>
    </div>

    <!-- Main Content -->
    <div style="background-color: #fff; padding: 25px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <p style="margin: 0 0 15px; font-size: 18px; text-align: center; color: #333;">¡Hola <strong>${nombreCompleto}</strong>!</p>
        <p style="margin: 0 0 15px; font-size: 16px; color: #333;">Nos alegra informarte que tu contraseña ha sido actualizada de forma exitosa. ¡Ya puedes acceder a tu cuenta con las nuevas credenciales!</p>
        
        <div style="background-color: rgba(165, 63, 191, 0.101); padding: 20px; border-radius: 15px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0 0 10px; font-size: 16px; color: #333;">
                <strong>Email:</strong>
                <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a>
            </p>
            <p style="margin: 0; font-size: 16px; color: #333;">
                <strong>Nueva contraseña:</strong>
                <span style="font-size: 18px;">${contrasenia}</span>
            </p>
        </div>

        <p style="margin: 0 0 20px; font-size: 16px; color: #333;">Si tú no solicitaste esta actualización de contraseña, por favor comunícate con nuestro equipo de soporte lo antes posible para garantizar la seguridad de tu cuenta.</p>

        <!-- Button to log in (Centered) -->
        <div style="text-align: center; margin-top: 20px;">
            <a href="${loginURL}" style="background: linear-gradient(to right, rgba(165, 63, 191, 0.9), rgba(33, 3, 85, 0.9)); color: white; box-shadow: 0 10px 15px rgba(33, 3, 85, 0.533); padding: 10px 30px; text-align: center; text-decoration: none; border-radius: 5px; font-size: 14px; font-weight: bold; display: inline-block; transition: all 0.3s ease;" onmouseover="this.style.boxShadow='0 15px 25px rgba(33, 3, 85, 0.6)'; this.style.transform='translateY(-3px)';" onmouseout="this.style.boxShadow='0 10px 15px rgba(33, 3, 85, 0.533)'; this.style.transform='translateY(0)';">Iniciar Sesión</a>
        </div>

        <p style="margin: 20px 0 0; font-size: 16px; color: #333; text-align: center;">Agradecemos tu confianza en nosotros y nos aseguramos de que tu experiencia siga siendo segura y confiable. Si tienes cualquier duda, no dudes en contactarnos.</p>

        <p style="margin: 10px 0 0; text-align: center; font-size: 16px; color: #333;">Saludos cordiales,<br><strong>El equipo de Encantada de Conocerme</strong></p>
    </div>

    <!-- Footer within main content -->
    <div style="background: linear-gradient(to right, rgba(165, 63, 191, 0.9), rgba(33, 3, 85, 0.9)); padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: #f2d3f8; margin: 5px 0; font-size: 14px;">¿Necesitas ayuda o tienes alguna pregunta? <br>¡Estamos aquí para ti! Contáctanos en <a href="mailto:econocerme@empresa.com" style="color: #7ebcff; text-decoration: underline;">econocerme@empresa.com</a>.</p>
        <p style="color: #f2d3f8; margin: 5px 0; font-size: 14px;">&copy; 2024 Encantada de Conocerme. Todos los derechos reservados.</p>
    </div>

</body>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado con la nueva contraseña");
  } catch (error) {
    console.error("Error al enviar el correo con la nueva contraseña:", error);
  }
}

// Eliminar un usuario por ID
export const eliminarUsuario = async (req, res) => {
  const id = req.params.id;

  try {
    const [result] = await connection.query(
      "UPDATE usuario SET estado = 0 WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
  }
};
