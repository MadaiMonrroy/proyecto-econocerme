import { Router } from 'express';
import { obtenerMisCursos } from '../controllers/misCursos.controllers.js';
import expressFileUpload from 'express-fileupload';

const router = Router();

router.use(expressFileUpload());

// Rutas para lecciones
router.get('/obtenerMisCursos/:idUsuario', obtenerMisCursos);

export default router;