import {Router} from 'express';
import {listaAnuncios, obtenerAnuncio, editarAnuncio, eliminarAnuncio, agregarAnuncio, listaAnunciosCoach } from '../controllers/anuncios.controllers.js';
import expressFileUpload from 'express-fileupload'

const router = Router();
router.use(expressFileUpload());


router.get('/anuncio', listaAnuncios)
router.get('/anuncioCoach/:idUsuario', listaAnunciosCoach)
router.get('/obtenerAnuncio/:id', obtenerAnuncio)
router.put('/editarAnuncio/:id', editarAnuncio)
router.patch('/editarAnuncio/:id', editarAnuncio)
router.delete('/eliminarAnuncio/:id', eliminarAnuncio)
router.post('/agregarAnuncio', agregarAnuncio)

export default router;