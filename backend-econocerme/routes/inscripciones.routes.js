import {Router} from 'express';
import {listaInscripciones, obtenerInscripcion, agregarInscripcion, eliminarInscripcion, editarInscripcion } from '../controllers/inscripciones.controllers.js';
const router = Router();

router.get('/inscripcion', listaInscripciones)
router.get('/obtenerInscripcion/:id', obtenerInscripcion)
router.post('/agregarInscripcion', agregarInscripcion)
router.put('/editarInscripcion/:id', editarInscripcion)
router.patch('/editarInscripcion/:id', editarInscripcion)
router.delete('/eliminarInscripcion/:id', eliminarInscripcion)

export default router;