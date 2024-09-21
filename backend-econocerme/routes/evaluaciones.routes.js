import { Router } from "express";
import {
  agregarPreguntas,
  obtenerPreguntasPorCurso,
  editarPreguntas,
} from "../controllers/evaluaciones.controllers.js";

const router = Router();

router.post("/agregarPreguntas", agregarPreguntas); // Agregar nuevas preguntas
router.put("/editarPreguntas", editarPreguntas); // Editar preguntas existentes
router.get("/obtenerPreguntas/:cursoId", obtenerPreguntasPorCurso); // Obtener preguntas por curso

export default router;