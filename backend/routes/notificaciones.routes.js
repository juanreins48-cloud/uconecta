// routes/notificaciones.routes.js
import { Router } from "express";
import {
  getStudentNotifications,
  getUniversityNotifications
} from "../controllers/notificaciones.controller.js";

const router = Router();

// ✔ Primero la ruta más específica
router.get("/universidad/:userId", getUniversityNotifications);

// ✔ Luego la genérica
router.get("/:studentId", getStudentNotifications);

export default router;
