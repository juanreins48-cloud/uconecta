import { Router } from "express";
import { getApplicationsByCompany } from "../controllers/solicitudes.controller.js";

const router = Router();

// Ver aplicaciones recibidas por una empresa
router.get("/:empresaId/applications", getApplicationsByCompany);

export default router;
