import {Router} from 'express';
import {listaCuotas,obtenerCuota, editarCuota,obtenerIdPagoPorInscripcion} from '../controllers/cuotas.controllers.js';
const router = Router();

router.get('/cuota/:id', listaCuotas)
router.get('/obtenerIdPagoPorInscripcion/:id', obtenerIdPagoPorInscripcion)
router.get('/obtenerCuota/:id', obtenerCuota)
router.put('/editarCuota/:id', editarCuota)
router.patch('/editarCuota/:id', editarCuota)

export default router;







