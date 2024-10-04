import { Router } from 'express';
import { obtenerMisCursos,obtenerCursosNoInscritos, obtenerCursoCompleto } from '../controllers/misCursos.controllers.js';
import expressFileUpload from 'express-fileupload';

const router = Router();

router.use(expressFileUpload());

// Rutas para lecciones
router.get('/obtenerMisCursos/:idUsuario', obtenerMisCursos);
router.get('/obtenerCursosNoInscritos/:idUsuario', obtenerCursosNoInscritos);
router.get('/obtenerCursoCompleto/:idCurso', obtenerCursoCompleto);


export default router;