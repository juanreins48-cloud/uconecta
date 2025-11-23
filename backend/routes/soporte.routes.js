// routes/soporte.routes.js
import express from "express";
import {
  sendSupportMessage,
  listSupportMessages,
  getSupportMessage
} from "../controllers/soporte.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Enviar mensaje
router.post("/", requireAuth, sendSupportMessage);

// Listar mensajes (universidad/admin)
router.get("/", requireAuth, listSupportMessages);

// Ver un mensaje
router.get("/:id", requireAuth, getSupportMessage);

export default router;
