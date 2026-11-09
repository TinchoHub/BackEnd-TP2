import express from "express";
import { responderConsultaIA } from "../controllers/iaController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Endpoint POST para la consulta (protegido por JWT)
router.post("/consultar", protegerRuta, responderConsultaIA);

export default router;