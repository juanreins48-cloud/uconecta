// routes/empresa.routes.js
import { Router } from "express";
import { getApplicationsByCompany } from "../controllers/solicitudes.controller.js";

const router = Router();

router.get("/:empresaId/applications", getApplicationsByCompany);

export default router;
