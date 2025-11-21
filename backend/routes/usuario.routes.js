import express from "express";
import { getMyAccount, updateMyAccount } from "../controllers/usuario.controller.js";
import { requireAuth } from '../middleware/auth.js'; // middleware para obtener userId

const router = express.Router();

// 🔹 Endpoint para obtener datos de la cuenta
router.get("/me", requireAuth, getMyAccount);

// Actualizar datos de la cuenta
router.patch("/update/:id", requireAuth, updateMyAccount);

export default router;
