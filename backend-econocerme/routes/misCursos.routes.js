import { Router } from 'express';
import { obtenerMisCertificados, obtenerMisCursos,obtenerCursosNoInscritos, obtenerCursoCompleto } from '../controllers/misCursos.controllers.js';
import expressFileUpload from 'express-fileupload';

const router = Router();

router.use(expressFileUpload());

// Rutas para lecciones
router.get('/obtenerMisCertificados/:idUsuario', obtenerMisCertificados);
router.get('/obtenerMisCursos/:idUsuario', obtenerMisCursos);
router.get('/obtenerCursosNoInscritos/:idUsuario', obtenerCursosNoInscritos);
router.get('/obtenerCursoCompleto/:idCurso', obtenerCursoCompleto);


export default router;