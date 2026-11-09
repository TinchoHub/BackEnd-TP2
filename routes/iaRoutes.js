import express from "express";
import { responderConsultaIA } from "../controllers/iaController.js";
import { protegerApi } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Endpoint POST para la consulta (protegido por JWT)
router.post("/consultar", protegerApi, responderConsultaIA);

export default router;