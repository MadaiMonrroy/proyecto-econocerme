import {Router} from 'express';
import { obtenerPago, editarPago, eliminarPago, listaPagos } from '../controllers/pagos.controllers.js';
const router = Router();

router.get('/pagos', listaPagos)
router.get('/obtenerPago/:id', obtenerPago)
router.put('/editarPago/:id', editarPago)
router.patch('/editarPago/:id', editarPago)
router.delete('/eliminarPago/:id', eliminarPago)

export default router;
