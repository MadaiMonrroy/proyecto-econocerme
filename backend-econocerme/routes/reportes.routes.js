import { Router } from "express";
import {
    incripcionesCurso,

} from "../controllers/reportes.controllers.js";

const router = Router();

router.post('/incripcionesCurso', incripcionesCurso);

export default router;
