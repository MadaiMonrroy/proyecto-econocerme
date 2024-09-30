import { Router } from 'express';
import { detalleInscripcionPago, obtenerScreenshotRecibo, generarPdf } from '../controllers/recibos.controllers.js';
const router = Router();
router.post('/generarPdf', generarPdf);
router.get('/detalleInscripcionPago/:idInscripcion', detalleInscripcionPago);
router.get('/obtenerScreenshotRecibo/:id', obtenerScreenshotRecibo); // Ruta para screenshot

export default router;
