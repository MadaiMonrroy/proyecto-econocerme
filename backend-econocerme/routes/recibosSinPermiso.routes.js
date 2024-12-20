import { Router } from "express";
import {
  detalleInscripcionPago,
  detallesCertificado,
  listaCursos,
  detalleInscripcionCurso,
  listaCursosSeleccionados,
  desencriptarDatos,
  detallePagos,
} from "../controllers/recibosSinPermiso.controllers.js";
const router = Router();
router.get("/listaCursos", listaCursos);
router.get("/listaCursosSeleccionados", listaCursosSeleccionados);

router.get("/detalleInscripcionCurso", detalleInscripcionCurso);
router.get("/detallePagos", detallePagos);

router.get("/desencriptar/:encryptedData", desencriptarDatos);

router.get("/detalleInscripcionPago/:idInscripcion", detalleInscripcionPago);
router.get("/detallesCertificado/:idUsuario", detallesCertificado);

export default router;
