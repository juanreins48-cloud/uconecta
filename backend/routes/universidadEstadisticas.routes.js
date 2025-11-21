import { Router } from "express";
import { getUniversityStatistics } from "../controllers/universidadEstadisticas.controller.js";

const router = Router();

router.get("/statistics", getUniversityStatistics);

export default router;
