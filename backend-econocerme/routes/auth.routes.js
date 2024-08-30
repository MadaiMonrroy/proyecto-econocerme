import { Router } from 'express';
import {
    login,
    registro,
    editarDatosUsuario,
    confirmarUsuario,
    obtenerUsuarioAutenticado
} from '../controllers/auth.controllers.js';
import verificarToken from '../middleware/verificarToken.js'; // Asegúrate de importar verificarToken

const router = Router();

router.post('/login', login);
router.post('/registro', registro);
router.post('/editarDatosUsuario', editarDatosUsuario);
router.get('/confirmar/:token', confirmarUsuario);
router.get('/usuario', verificarToken, obtenerUsuarioAutenticado); // Nueva ruta

export default router;
