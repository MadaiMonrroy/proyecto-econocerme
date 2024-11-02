import { Router } from "express";
import {
    incripcionesCurso,
    resumenGeneralAdmin,

} from "../controllers/reportes.controllers.js";

const router = Router();

router.post('/incripcionesCurso', incripcionesCurso);
router.get('/resumenGeneralAdmin', resumenGeneralAdmin);


export default router;
