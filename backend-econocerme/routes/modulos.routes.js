import {Router} from 'express';
import {listaModulos, obtenerModulo, agregarModulo, editarModulo, eliminarModulo } from '../controllers/modulos.controllers.js';
import expressFileUpload from 'express-fileupload'
const router = Router();

router.use(expressFileUpload());

router.get('/modulo/:idCurso', listaModulos)
router.get('/obtenerModulo/:id', obtenerModulo)
router.put('/editarModulo/:id', editarModulo)
router.patch('/editarModulo/:id', editarModulo)
router.delete('/eliminarModulo/:id', eliminarModulo)
router.post('/agregarModulo', agregarModulo)

export default router;
