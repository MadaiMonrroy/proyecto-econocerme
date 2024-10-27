import { Router } from "express";
import {
  listaInscripciones,
  obtenerInscripcion,
  agregarInscripcion,
  eliminarPreInscripcion,
  agregarPreinscripcion,
  listaPreInscripciones,
  completarInscripcion,
  listaInscritosCoach,
} from "../controllers/inscripciones.controllers.js";
const router = Router();

router.get("/inscripcion", listaInscripciones);
router.get("/preInscripcion", listaPreInscripciones);
router.get("/obtenerInscripcion/:id", obtenerInscripcion);
router.get("/listaInscritosCoach/:idCreador", listaInscritosCoach);
router.post("/agregarInscripcion", agregarInscripcion);
router.post("/agregarPreInscripcion", agregarPreinscripcion);
router.post("/completarInscripcion", completarInscripcion);
router.delete("/eliminarPreInscripcion/:idInscripcion", eliminarPreInscripcion);

export default router;
