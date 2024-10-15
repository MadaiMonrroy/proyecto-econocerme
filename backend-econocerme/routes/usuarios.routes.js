import { Router } from "express";
import {
  listaUsuarios,
  listaUsuariosInscripciones,
  obtenerUsuario,
  editarUsuario,
  editarUsuariocoach,
  eliminarUsuario,
  agregarUsuario,
  agregarUsuariocoach,
  confirmarUsuario,
  cambiarContrasenia,
  obtenerUsuarioCoach,
} from "../controllers/usuarios.controllers.js";
import expressFileUpload from "express-fileupload";

const router = Router();
router.use(expressFileUpload());

router.get("/usuario/:id", listaUsuarios);
router.get("/usuarios", listaUsuariosInscripciones);
router.get("/obtenerUsuario/:id", obtenerUsuario);
router.get("/obtenerUsuarioCoach/:id", obtenerUsuarioCoach);
router.put("/editarUsuario/:id", editarUsuario);
router.put("/editarUsuariocoach/:id", editarUsuariocoach);
router.patch("/editarUsuario/:id", editarUsuario);
router.delete("/eliminarUsuario/:id", eliminarUsuario);
router.post("/agregarUsuario", agregarUsuario);
router.post("/agregarUsuariocoach", agregarUsuariocoach);
router.get("/confirmar/:token", confirmarUsuario);
router.put("/cambiarContrasenia/:id", cambiarContrasenia);

export default router;
