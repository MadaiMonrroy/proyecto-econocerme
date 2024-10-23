import { Router } from "express";
import {
  listaInscripciones,
  obtenerInscripcion,
  agregarInscripcion,
  eliminarPreInscripcion,
  editarInscripcion,
  agregarPreinscripcion,
  listaPreInscripciones,
  completarInscripcion,
} from "../controllers/inscripciones.controllers.js";
const router = Router();

router.get("/inscripcion", listaInscripciones);
router.get("/preInscripcion", listaPreInscripciones);
router.get("/obtenerInscripcion/:id", obtenerInscripcion);
router.post("/agregarInscripcion", agregarInscripcion);
router.post("/agregarPreInscripcion", agregarPreinscripcion);
router.post("/completarInscripcion", completarInscripcion);

router.put("/editarInscripcion/:id", editarInscripcion);
router.patch("/editarInscripcion/:id", editarInscripcion);
router.delete("/eliminarPreInscripcion/:idInscripcion", eliminarPreInscripcion);

export default router;
