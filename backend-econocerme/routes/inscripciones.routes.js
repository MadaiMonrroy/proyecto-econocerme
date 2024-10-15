import { Router } from "express";
import {
  listaInscripciones,
  obtenerInscripcion,
  agregarInscripcion,
  eliminarInscripcion,
  editarInscripcion,
  agregarPreinscripcion,
  listaPreInscripciones,
} from "../controllers/inscripciones.controllers.js";
const router = Router();

router.get("/inscripcion", listaInscripciones);
router.get("/preInscripcion", listaPreInscripciones);
router.get("/obtenerInscripcion/:id", obtenerInscripcion);
router.post("/agregarInscripcion", agregarInscripcion);
router.post("/agregarPreInscripcion", agregarPreinscripcion);
router.put("/editarInscripcion/:id", editarInscripcion);
router.patch("/editarInscripcion/:id", editarInscripcion);
router.delete("/eliminarInscripcion/:id", eliminarInscripcion);

export default router;
