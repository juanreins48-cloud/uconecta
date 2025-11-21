import { Router } from "express";
import { 
  applyInternship,
  getApplicationsByCompany,
  updateApplicationStatus
} from "../controllers/solicitudes.controller.js";

const router = Router();

// estudiante aplica
router.post("/apply", applyInternship);

// empresa obtiene aplicaciones
router.get("/company/:empresaId", getApplicationsByCompany);

// empresa acepta/rechaza
router.patch("/:id", updateApplicationStatus);

export default router;
