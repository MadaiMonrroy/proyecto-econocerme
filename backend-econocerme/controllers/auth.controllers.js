import connection from '../db.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'; // Importa jsonwebtoken


// Configuración del transporte de correo
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

// Función para enviar el correo de confirmación
async function enviarCorreoConfirmacion(email, tokenConfirmacion) {
    
    const mailOptions = {
        from: 'desarrollatuesencia2810@gmail.com',
        to: email,
        subject: 'Confirma tu cuenta en nuestra plataforma',
        html: `
            <p>Gracias por registrarte. Por favor, confirma tu cuenta haciendo clic en el siguiente enlace:</p>
            <a href="http://localhost:5173/confirmar/${tokenConfirmacion}" style="display: inline-block; padding: 10px 20px; font-size: 16px; font-weight: bold; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Confirmar Cuenta</a>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de confirmación enviado');
    } catch (error) {
        console.error('Error al enviar el correo de confirmación:', error);
    }
}
// Función para confirmar el usuario
export const confirmarUsuario = async (req, res) => {
    console.log("estoy entrando aqui");
    const token = req.params.token;
    console.log('TOKEN', token);
    try {
        const [result] = await connection.query('UPDATE usuario SET estado = 1 WHERE tokenConfirmacion = ?', [token]);

        if (result.affectedRows === 0) {
            console.log('Token no válido'); // Log adicional

            return res.status(404).json({ mensaje: "Token de confirmación no válido" });
        }

        res.json({ mensaje: "Cuenta confirmada exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};

// Función de login
export const login = async (req, res) => {
    const { email, contrasenia } = req.body;

    try {
        // Verificar si el usuario existe
        const [result] = await connection.query('SELECT * FROM usuario WHERE email = ?', [email]);
        
        if (result.length === 0) {
            return res.status(400).json({
                mensaje: "Correo electrónico o contraseña incorrectos"
            });
        }

        const usuario = result[0];

        // Verificar la contraseña
        const contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);

        if (!contraseniaValida) {
            return res.status(400).json({
                mensaje: "Correo electrónico o contraseña incorrectos"
            });
        }

        // Verificar si el usuario está activo
        if (usuario.estado !== 1) {
            return res.status(403).json({
                mensaje: "Cuenta inactiva. Por favor, verifica tu correo electrónico para activar tu cuenta."
            });
        }

        // Crear un token JWT
        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });


        // Enviar los datos del usuario al frontend
        res.json({
            mensaje: "Login exitoso",
            token,// token,
            usuario: {
                id: usuario.id,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                email: usuario.email,
                tipoUsuario: usuario.tipoUsuario,
                fotoPerfil: usuario.fotoPerfil,
                biografia: usuario.biografia,
                especialidad: usuario.especialidad,
                experiencia: usuario.experiencia,
                videoPresentacion: usuario.videoPresentacion,
                fechaNacimiento: usuario.fechaNacimiento,
                estado: usuario.estado,
                fechaCreacion: usuario.fechaCreacion,
                fechaActualizacion: usuario.fechaActualizacion
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensaje: "Ocurrió un error en el servidor"
        });
    }
};

// Función de registro
// Función para registrar un nuevo usuario
export const registro = async (req, res) => {
    const { primerNombre, segundoNombre, primerApellido, segundoApellido, email, contrasenia, repetirContrasenia } = req.body;

    try {
        // Validar que las contraseñas coinciden
        if (contrasenia !== repetirContrasenia) {
            return res.status(400).json({ mensaje: "Las contraseñas no coinciden" });
        }

        // Verificar si el correo electrónico ya está registrado
        const [result] = await connection.query('SELECT * FROM usuario WHERE email = ?', [email]);

        if (result.length > 0) {
            return res.status(400).json({ mensaje: "El correo electrónico ya está registrado" });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        // Generar un token de confirmación único
        const tokenConfirmacion = crypto.randomBytes(20).toString('hex');

        // Insertar el nuevo usuario en la base de datos
        const [insertResult] = await connection.query(
            `INSERT INTO usuario (
                nombres, primerApellido, segundoApellido, email, contrasenia, estado, tokenConfirmacion
            ) VALUES (?, ?, ?, ?, ?, 2, ?)`,
            [primerNombre + (segundoNombre ? ' ' + segundoNombre : ''), primerApellido, segundoApellido, email, hashedPassword, tokenConfirmacion]
        );

        // Enviar el enlace de confirmación al usuario por correo
        await enviarCorreoConfirmacion(email, tokenConfirmacion);

        res.status(201).json({
            mensaje: "Registro exitoso. Por favor, revisa tu correo para confirmar tu cuenta.",
            usuarioId: insertResult.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};


export const obtenerUsuarioAutenticado = async (req, res) => {
    try {
        const userId = req.userId; // Esto se establece en el middleware
        const [result] = await connection.query('SELECT * FROM usuario WHERE id = ?', [userId]);

        if (result.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const usuario = result[0];
        res.json({
            id: usuario.id,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario,
            fotoPerfil: usuario.fotoPerfil,
            biografia: usuario.biografia,
            especialidad: usuario.especialidad,
            experiencia: usuario.experiencia,
            videoPresentacion: usuario.videoPresentacion,
            fechaNacimiento: usuario.fechaNacimiento,
            estado: usuario.estado,
            fechaCreacion: usuario.fechaCreacion,
            fechaActualizacion: usuario.fechaActualizacion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error en el servidor" });
    }
};

export const editarDatosUsuario = async (req, res) => {
    const { id, nombreCurso, descripcion, fechaInicio, fechaFin, horas, precio, imagen } = req.body;

    try {
        const [result] = await connection.query(
            'INSERT INTO cursos (id, nombreCurso, descripcion, fechaInicio, fechaFin, horas, precio, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, nombreCurso, descripcion, fechaInicio, fechaFin, horas, precio, imagen]
        );

        res.json({
            mensaje: "Curso registrado exitosamente",
            idCurso: result.insertId,
            nombreCurso,
            descripcion
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensaje: "Ocurrió un error en el servidor"
        });
    }
};
