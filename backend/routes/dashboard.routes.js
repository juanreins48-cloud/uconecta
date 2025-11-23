// routes/dashboard.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listWidgets,
  createWidget,
  getWidget,
  updateWidget,
  deleteWidget,
  getStudentDashboard,
  getUniversityDashboard
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// Widgets (Firestore)
router.get("/", requireAuth, listWidgets);
router.post("/", requireAuth, createWidget);
router.get("/:id", requireAuth, getWidget);
router.put("/:id", requireAuth, updateWidget);
router.delete("/:id", requireAuth, deleteWidget);

// Dashboards
router.get("/estudiante/:userId", getStudentDashboard);
router.get("/universidad/:userId", getUniversityDashboard);

export default router;

