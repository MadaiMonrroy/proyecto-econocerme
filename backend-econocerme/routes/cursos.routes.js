import {Router} from 'express';
import  {listaCursos,cursosLibresporUsuario, obtenerCurso, editarCurso, eliminarCurso, agregarCurso }  from '../controllers/cursos.controllers.js';
import expressFileUpload from 'express-fileupload'
const router = Router();

router.use(expressFileUpload());

router.get('/curso', listaCursos)
router.get('/disponibles/:usuarioId', cursosLibresporUsuario);
router.get('/obtenerCurso/:id', obtenerCurso)
router.put('/editarCurso/:id', editarCurso)
router.patch('/editarCurso/:id', editarCurso)
router.delete('/eliminarCurso/:id', eliminarCurso)
router.post('/agregarCurso', agregarCurso)

export default router;
