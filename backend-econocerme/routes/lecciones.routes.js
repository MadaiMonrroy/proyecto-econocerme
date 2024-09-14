import { Router } from 'express';
import { listaLecciones, obtenerLeccion, agregarLeccion, editarLeccion, eliminarLeccion } from '../controllers/lecciones.controllers.js';
import expressFileUpload from 'express-fileupload';

const router = Router();

router.use(expressFileUpload());

// Rutas para lecciones
router.get('/leccion/:idModulo', listaLecciones);
router.get('/obtenerLeccion/:id', obtenerLeccion);
router.put('/editarLeccion/:id', editarLeccion);
router.patch('/editarLeccion/:id', editarLeccion);
router.delete('/eliminarLeccion/:id', eliminarLeccion);
router.post('/agregarLeccion', agregarLeccion);

export default router;
