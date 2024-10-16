import { Router } from "express";
import {
  agregarPreguntas,
  obtenerPreguntasPorCurso,
  editarPreguntas,
  eliminarPregunta,
  ingresarEvaluacion,
  generarCertificado,
} from "../controllers/evaluaciones.controllers.js";

const router = Router();

router.post("/agregarPreguntas", agregarPreguntas); // Agregar nuevas preguntas
router.post("/ingresarEvaluacion", ingresarEvaluacion); // Agregar nuevas preguntas
router.post('/generarCertificado', generarCertificado);

router.put("/editarPreguntas", editarPreguntas); // Editar preguntas existentes
router.get("/obtenerPreguntas/:cursoId", obtenerPreguntasPorCurso); // Obtener preguntas por curso
router.delete("/eliminarPregunta/:idPregunta", eliminarPregunta);

export default router;
