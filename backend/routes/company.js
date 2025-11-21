import express from "express";
import { getDashboard } from "../controllers/companyController.js";
// import { requireAuth } from '../middleware/auth.js'; // opcional

const router = express.Router();

// Si quieres probar sin autenticación primero:
// router.get("/:empresaId", getDashboard);

// Más adelante puedes agregar requireAuth:
router.get("/:empresaId", /*requireAuth,*/ getDashboard);

export default router;
