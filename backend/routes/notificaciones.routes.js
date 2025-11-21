import { Router } from "express";
import { getStudentNotifications } from "../controllers/notificaciones.controller.js";
import { getUniversityNotifications } from "../controllers/notificaciones.controller.js";

const router = Router();

router.get("/:studentId", getStudentNotifications);
router.get("/universidad/:userId", getUniversityNotifications);


export default router;
