import { Router } from 'express';
import { detalleInscripcionPago, detallesCertificado } from '../controllers/recibosSinPermiso.controllers.js';
const router = Router();
router.get('/detalleInscripcionPago/:idInscripcion', detalleInscripcionPago);
router.get('/detallesCertificado/:idUsuario', detallesCertificado);


export default router;
