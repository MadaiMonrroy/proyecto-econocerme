import express from 'express';
import cors from 'cors';
import rutasAuth from './routes/auth.routes.js';
import rutasCursos from './routes/cursos.routes.js';
import rutasAnuncios from './routes/anuncios.routes.js';
import rutasUsuarios from './routes/usuarios.routes.js';
import rutasModulos from './routes/modulos.routes.js';
import rutasInscripciones from './routes/inscripciones.routes.js';
import rutasPagos from './routes/pagos.routes.js';
import rutasLecciones from './routes/lecciones.routes.js';
import misCursos from './routes/misCursos.routes.js';
import rutasEvaluaciones from './routes/evaluaciones.routes.js'
import rutasCuotas from './routes/cuotas.routes.js';
import rutasRecibos from './routes/recibos.routes.js';



import morgan from 'morgan';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // Importa dotenv para manejar variables de entorno
import path from 'path';
import cookieParser from 'cookie-parser';

import verificarToken from './middleware/verificarToken.js'; //

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//prueba para las imagenes
import multer from 'multer';

// Configurar dotenv
dotenv.config();

const app = express();
app.use(cookieParser(process.env.COOKIE_SECRET)); // Asegúrate de que COOKIE_SECRET está en tu archivo .env

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Cambia esto según sea necesario
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    credentials: true // Asegúrate de permitir el envío de cookies

}));
app.use(morgan('dev'))

// Servir la carpeta 'src' como un directorio estático
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
//   next();
// });

// Rutas 
app.use('/api/auth', rutasAuth); // Esta ruta no requiere verificación de token
app.use('/api/cursos', verificarToken, rutasCursos); // Protege esta ruta
app.use('/api/anuncios', verificarToken, rutasAnuncios); // Protege esta ruta
app.use('/api/usuarios', verificarToken, rutasUsuarios); // Protege esta ruta
app.use('/api/modulos', verificarToken, rutasModulos); 
app.use('/api/inscripciones', verificarToken, rutasInscripciones); // Protege esta ruta
app.use('/api/pagos', verificarToken, rutasPagos); // Protege esta ruta
app.use('/api/lecciones', verificarToken, rutasLecciones); // Protege esta ruta
app.use('/api/misCursos', verificarToken, misCursos); // Protege esta ruta
app.use('/api/evaluaciones', verificarToken, rutasEvaluaciones)
app.use('/api/cuotas', verificarToken, rutasCuotas); // Protege esta ruta
app.use('/api/recibos', verificarToken,rutasRecibos); // Protege esta ruta

// app.use('/usuarios', usuariosRoutes);


export default app;