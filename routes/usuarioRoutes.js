import express from "express";
import { 
  listarUsuarios, 
  renderNuevoUsuario, 
  crearUsuario,
  eliminarUsuario
} from "../controllers/usuarioController.js";
import { protegerRuta, esAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas protegidas: primero valida sesión y luego que sea admin
router.get("/", protegerRuta, esAdmin, listarUsuarios);
router.get("/nuevo", protegerRuta, esAdmin, renderNuevoUsuario);
router.post("/", protegerRuta, esAdmin, crearUsuario);
router.post('/:id/eliminar', protegerRuta, esAdmin, eliminarUsuario);

export default router;