import {Router} from 'express';
import {listaAnuncios, obtenerAnuncio, editarAnuncio, eliminarAnuncio, agregarAnuncio } from '../controllers/anuncios.controllers.js';
import expressFileUpload from 'express-fileupload'

const router = Router();
router.use(expressFileUpload(
    {
        limits: {fileSize: 1000000},
        useTempFiles: true,
    }
))

router.get('/anuncio', listaAnuncios)
router.get('/obtenerAnuncio/:id', obtenerAnuncio)
router.put('/editarAnuncio/:id', editarAnuncio)
router.patch('/editarAnuncio/:id', editarAnuncio)
router.delete('/eliminarAnuncio/:id', eliminarAnuncio)
router.post('/agregarAnuncio', agregarAnuncio)

export default router;