import express from "express";
import { sendSupportMessage, listSupportMessages, getSupportMessage } from "../controllers/soporte.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Ruta protegida para enviar mensaje de soporte
router.post("/", requireAuth, sendSupportMessage);

// listar mensajes (solo universidad/admin)
router.get("/", requireAuth, listSupportMessages);

// detalle de mensaje
router.get("/:id", requireAuth, getSupportMessage);

export default router;
