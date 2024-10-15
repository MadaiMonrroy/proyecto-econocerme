import { Router } from "express";
import {
  obtenerCarrito,
  agregarProductoCarrito,
  eliminarProductoCarrito,
  vaciarCarrito,
  obtenerDetalleCurso,
} from "../controllers/carritos.controllers.js";
const router = Router();

// Rutas
router.get("/carrito/:idUsuario", obtenerCarrito);
router.post("/agregarProductoCarrito", agregarProductoCarrito);
router.delete("/carrito/eliminar", eliminarProductoCarrito);
router.delete("/carrito/vaciar/:idUsuario", vaciarCarrito);
router.get('/obtenerDetalleCurso/:cursoId', obtenerDetalleCurso);


export default router;
