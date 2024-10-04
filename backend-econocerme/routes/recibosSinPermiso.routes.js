import { Router } from 'express';
import { detalleInscripcionPago } from '../controllers/recibos.controllers.js';
const router = Router();
router.get('/detalleInscripcionPago/:idInscripcion', detalleInscripcionPago);

export default router;
