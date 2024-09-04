import connection from '../db.js';
import bcrypt from 'bcryptjs';
import { upload, borrarImagen } from "../helpers/cloudinary.js";
import nodemailer from 'nodemailer'; // Para enviar correos
import crypto from 'crypto'; // Para generar tokens únicos
import fs from "fs-extra";

// Configurar el transporte de nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
        user: 'desarrollatuesencia2810@gmail.com',
        pass: 'uytfriafjzcohdgj'
    }
});
export const listaUsuariosInscripciones = async (req, res) => {
    try {
        const [result] = await connection.query(`SELECT id, nombres, primerApellido, segundoApellido, email, fotoPerfil, fechaNacimiento, tipoUsuario, estado FROM usuario WHERE estado = 1 OR estado = 2 AND tipoUsuario = "usuario"`);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};
// Función para enviar correo con la contraseña
async function enviarCorreoContrasenia(email, contrasenia, tokenConfirmacion) {
    const imageURL = `http://localhost:3000/src/logoec.png`;
    const mailOptions = {
        from: 'desarrollatuesencia2810@gmail.com',
        to: email,
        subject: 'Bienvenido a nuestra plataforma',
        html: `
           <body style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <!-- Header -->
    <div style="background: linear-gradient(to right, rgba(165, 63, 191, 0.855), rgba(33, 3, 85, 0.816)); padding: 20px; text-align: center;">
        <img src="${imageURL}" alt="Logo de la Empresa" style="max-width: 400px; height: auto; margin-bottom: 20px; padding: 15px; border-radius: 5px;">
    </div>
    
    <!-- Main Content -->
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
        <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">¡Bienvenida a Encantada de Conocerme!</h1>
        
        <p style="color: #555;">Hola,</p>
        
        <p style="color: #555;">Tu cuenta ha sido creada exitosamente. A continuación, te proporcionamos tus datos de acceso:</p>
        
        <p style="color: #555; margin-bottom: 10px;">
            <strong>Email:</strong> 
            <a href="mailto:${email}" style="color: #007bff; text-decoration: underline;">${email}</a>
            <br>
            <strong>Contraseña:</strong> ${contrasenia}
        </p>
        
        <p style="color: #555;">Para activar tu cuenta, por favor, confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
        
        <p style="text-align: center; margin: 20px 0;">
            <a href="http://localhost:5173/confirmar/${tokenConfirmacion}" style="display: inline-block; padding: 10px 20px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px; text-align: center; transition: background-color 0.3s ease;">Confirmar Cuenta</a>
        </p>
        
        <p style="color: #555; margin-bottom: 10px;">Si tienes algún problema con el enlace, por favor contáctanos.</p>
        
        <p style="color: #555; margin-bottom: 0;">Saludos cordiales,</p>
        <p style="color: #555; margin-top: 0;">El equipo de Encantada de Conocerme</p>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(to right, rgba(165, 63, 191, 0.855), rgba(33, 3, 85, 0.816)); padding: 20px; text-align: center;">
        <p style="color: #f2d3f8;">Si tienes preguntas o necesitas ayuda, no dudes en contactarnos en <a href="mailto:econocerme@empresa.com" style="color: #7ebcff; text-decoration: underline;">econocerme@empresa.com</a>.</p>
        <p style="color: #f2d3f8;">&copy; 2024 Encantada de Conocerme. Todos los derechos reservados.</p>
    </div>
</body>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
}


// Función para confirmar el usuario
export const confirmarUsuario = async (req, res) => {
    const token = req.params.token;

    try {
        const [result] = await connection.query('UPDATE usuario SET estado = 1 WHERE tokenConfirmacion = ?', [token]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Token de confirmación no válido" });
        }

        res.json({ mensaje: "Cuenta confirmada exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};


// Obtener todos los usuarios
export const listaUsuarios = async (req, res) => {
    try {
        const [result] = await connection.query('SELECT id, nombres, primerApellido, segundoApellido, email, fotoPerfil, fechaNacimiento, tipoUsuario, estado FROM usuario WHERE estado = 1 OR estado = 2');
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
        const [result] = await connection.query('SELECT id, nombres, primerApellido, segundoApellido, email, fotoPerfil, fechaNacimiento, tipoUsuario, estado FROM usuario WHERE id = ?', [id]);
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
    const { nombres, primerApellido, segundoApellido, email, contrasenia, fechaNacimiento, tipoUsuario , idUsuario} = req.body;

    if (!nombres || !primerApellido || !segundoApellido || !email || !contrasenia || !fechaNacimiento || !tipoUsuario) {
        return res.status(400).json({ mensaje: "Todos los campos son requeridos" });
    }

    try {
        const [existingUsuario] = await connection.query('SELECT * FROM usuario WHERE email = ?', [email]);
        if (existingUsuario.length > 0) {
            return res.status(400).json({ mensaje: "Ya existe un usuario con este email" });
        }

        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        let fotoPerfilUrl = null;
        if (req.files && req.files.fotoPerfil) {
            const file = req.files.fotoPerfil;
            const fileTypes = ["image/jpeg", "image/png", "image/jpg"];
            const imageSize = 1024;

            if (!fileTypes.includes(file.mimetype)) {
                return res.status(400).json({ mensaje: "Formato de imagen no soportado" });
            }
            if (file.size / 1024 > imageSize) {
                return res.status(400).json({ mensaje: `La imagen debe ser menor de ${imageSize} KB` });
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
        const tokenConfirmacion = crypto.randomBytes(20).toString('hex');

        const [result] = await connection.query(
            'INSERT INTO usuario (nombres, primerApellido, segundoApellido, email, contrasenia, fotoPerfil, fechaNacimiento, tipoUsuario, estado, idUsuario, tokenConfirmacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2,?, ?)',
            [nombres, primerApellido, segundoApellido, email, hashedPassword, fotoPerfilUrl, fechaNacimiento, tipoUsuario,idUsuario, tokenConfirmacion]
        );

        // Enviar la contraseña generada y el enlace de confirmación al usuario por correo
        await enviarCorreoContrasenia(email, contrasenia, tokenConfirmacion);

        res.json({ id: result.insertId, mensaje: "Usuario agregado correctamente, por favor revisa tu correo para confirmar tu cuenta" });
    } catch (error) {
        console.error("Error al agregar el usuario:", error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};
export const agregarUsuariocoach = async (req, res) => {
    const { nombres, primerApellido, segundoApellido, email, contrasenia, fechaNacimiento, tipoUsuario, biografia, especialidad, experiencia, videoPresentacion } = req.body;

    if (!nombres || !primerApellido || !segundoApellido || !email || !contrasenia || !fechaNacimiento || !tipoUsuario) {
        return res.status(400).json({ mensaje: "Todos los campos son requeridos" });
    }

    try {
        const [existingUsuario] = await connection.query('SELECT * FROM usuario WHERE email = ?', [email]);
        if (existingUsuario.length > 0) {
            return res.status(400).json({ mensaje: "Ya existe un usuario con este email" });
        }

        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        let fotoPerfilUrl = null;
        if (req.files && req.files.fotoPerfil) {
            const file = req.files.fotoPerfil;
            const fileTypes = ["image/jpeg", "image/png", "image/jpg"];
            const imageSize = 1024;

            if (!fileTypes.includes(file.mimetype)) {
                return res.status(400).json({ mensaje: "Formato de imagen no soportado" });
            }
            if (file.size / 1024 > imageSize) {
                return res.status(400).json({ mensaje: `La imagen debe ser menor de ${imageSize} KB` });
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
        const tokenConfirmacion = crypto.randomBytes(20).toString('hex');

        const [result] = await connection.query(
            `INSERT INTO usuario 
                (nombres, primerApellido, segundoApellido, email, contrasenia, fotoPerfil, fechaNacimiento, tipoUsuario, estado, tokenConfirmacion, biografia, especialidad, experiencia, videoPresentacion) 
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, 2, ?, ?, ?, ?, ?)`,
            [nombres, primerApellido, segundoApellido, email, hashedPassword, fotoPerfilUrl, fechaNacimiento, tipoUsuario, tokenConfirmacion, biografia, especialidad, experiencia, videoPresentacion]
        );

        // Enviar la contraseña generada y el enlace de confirmación al usuario por correo
        await enviarCorreoContrasenia(email, contrasenia, tokenConfirmacion);

        res.json({ id: result.insertId, mensaje: "Usuario agregado correctamente, por favor revisa tu correo para confirmar tu cuenta" });
    } catch (error) {
        console.error("Error al agregar el usuario:", error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};

// Editar un usuario por ID
// Editar un usuario por ID
export const editarUsuario = async (req, res) => {
    const id = req.params.id;
    const { nombres, primerApellido, segundoApellido, email, contrasenia, fechaNacimiento, tipoUsuario, idUsuario} = req.body;
    console.log(idUsuario)
    try {
        // Obtener el usuario existente
        const [existingUser] = await connection.query('SELECT contrasenia FROM usuario WHERE id = ?', [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        let hashedPassword = existingUser[0].contrasenia; // Mantener la contraseña actual por defecto

        // Si se proporciona una nueva contraseña, actualizarla y enviar correo
        if (contrasenia && contrasenia !== hashedPassword) {
            hashedPassword = await bcrypt.hash(contrasenia, 10);
            // Enviar correo con la nueva contraseña
            await enviarCorreoNuevaContrasenia(email, contrasenia);
        }

        let fotoPerfilUrl = null;
        if (req.files && req.files.fotoPerfil) {
            const file = req.files.fotoPerfil;
            const fileTypes = ["image/jpeg", "image/png", "image/jpg"];
            const imageSize = 1024;

            if (!fileTypes.includes(file.mimetype)) {
                return res.status(400).json({ mensaje: "Formato de imagen no soportado" });
            }
            if (file.size / 1024 > imageSize) {
                return res.status(400).json({ mensaje: `La imagen debe ser menor de ${imageSize} KB` });
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

        const [result] = await connection.query(
            `UPDATE usuario SET
                nombres = ?,
                primerApellido = ?,
                segundoApellido = ?,
                email = ?,
                contrasenia = ?,
                fotoPerfil = ?,
                fechaNacimiento = ?,
                tipoUsuario = ?,
                idUsuario = ?
            WHERE id = ?`,
            [nombres, primerApellido, segundoApellido, email, hashedPassword, fotoPerfilUrl, fechaNacimiento, tipoUsuario, idUsuario, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
        res.json({ mensaje: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};
export const editarUsuariocoach = async (req, res) => {
    const id = req.params.id;
    const { nombres, primerApellido, segundoApellido, email, contrasenia, fechaNacimiento, tipoUsuario, biografia, especialidad, experiencia, videoPresentacion } = req.body;

    try {
        // Obtener el usuario existente
        const [existingUser] = await connection.query('SELECT contrasenia FROM usuario WHERE id = ?', [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        let hashedPassword = existingUser[0].contrasenia; // Mantener la contraseña actual por defecto

        // Si se proporciona una nueva contraseña, actualizarla y enviar correo
        if (contrasenia && contrasenia !== hashedPassword) {
            hashedPassword = await bcrypt.hash(contrasenia, 10);
            // Enviar correo con la nueva contraseña
            await enviarCorreoNuevaContrasenia(email, contrasenia);
        }

        let fotoPerfilUrl = null;
        if (req.files && req.files.fotoPerfil) {
            const file = req.files.fotoPerfil;
            const fileTypes = ["image/jpeg", "image/png", "image/jpg"];
            const imageSize = 1024;

            if (!fileTypes.includes(file.mimetype)) {
                return res.status(400).json({ mensaje: "Formato de imagen no soportado" });
            }
            if (file.size / 1024 > imageSize) {
                return res.status(400).json({ mensaje: `La imagen debe ser menor de ${imageSize} KB` });
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

        const [result] = await connection.query(
            `UPDATE usuario SET
                nombres = ?,
                primerApellido = ?,
                segundoApellido = ?,
                email = ?,
                contrasenia = ?,
                fotoPerfil = ?,
                fechaNacimiento = ?,
                tipoUsuario = ?,
                biografia = ?,
                especialidad = ?,
                experiencia = ?,
                videoPresentacion = ?
            WHERE id = ?`,
            [nombres, primerApellido, segundoApellido, email, hashedPassword, fotoPerfilUrl, fechaNacimiento, tipoUsuario, biografia, especialidad, experiencia, videoPresentacion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
        res.json({ mensaje: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};


// Función para enviar la nueva contraseña por correo
async function enviarCorreoNuevaContrasenia(email, contrasenia) {
    const imageURL = `http://localhost:3000/src/logoec.png`;
    const mailOptions = {
        from: 'desarrollatuesencia2810@gmail.com',
        to: email,
        subject: 'Actualización de Contraseña',
        html: `
            <body style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <!-- Header -->
                <div style="background: linear-gradient(to right, rgba(165, 63, 191, 0.855), rgba(33, 3, 85, 0.816)); padding: 20px; text-align: center;">
                    <img src="${imageURL}" alt="Logo de la Empresa" style="max-width: 400px; height: auto; margin-bottom: 20px; padding: 15px; border-radius: 5px;">
                </div>
                
                <!-- Main Content -->
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                    <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">Actualización de Contraseña</h1>
                    
                    <p style="color: #555;">Hola,</p>
                    
                    <p style="color: #555;">Tu contraseña ha sido actualizada exitosamente. A continuación, te proporcionamos tu nueva contraseña:</p>
                    
                    <p style="color: #555; margin-bottom: 10px;">
                        <strong>Email:</strong> 
                        <a href="mailto:${email}" style="color: #007bff; text-decoration: underline;">${email}</a>
                        <br>
                        <strong>Nueva Contraseña:</strong> ${contrasenia}
                    </p>
                    
                    <p style="color: #555;">Si no has solicitado este cambio, por favor contacta a soporte de inmediato.</p>
                    
                    <p style="color: #555; margin-bottom: 0;">Saludos cordiales,</p>
                    <p style="color: #555; margin-top: 0;">El equipo de Encantada de Conocerme</p>
                </div>
                
                <!-- Footer -->
                <div style="background: linear-gradient(to right, rgba(165, 63, 191, 0.855), rgba(33, 3, 85, 0.816)); padding: 20px; text-align: center;">
                    <p style="color: #f2d3f8;">Si tienes preguntas o necesitas ayuda, no dudes en contactarnos en <a href="mailto:econocerme@empresa.com" style="color: #7ebcff; text-decoration: underline;">econocerme@empresa.com</a>.</p>
                    <p style="color: #f2d3f8;">&copy; 2024 Encantada de Conocerme. Todos los derechos reservados.</p>
                </div>
            </body>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado con la nueva contraseña');
    } catch (error) {
        console.error('Error al enviar el correo con la nueva contraseña:', error);
    }
}


// Eliminar un usuario por ID
export const eliminarUsuario = async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await connection.query('UPDATE usuario SET estado = 0 WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};
