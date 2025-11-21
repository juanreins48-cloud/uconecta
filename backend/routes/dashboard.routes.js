// routes/dashboard.routes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getStudentDashboard,getUniversityDashboard } from "../controllers/dashboard.controller.js";
import {
  createWidget,
  listWidgets,
  getWidget,
  updateWidget,
  deleteWidget
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/', requireAuth, listWidgets);
router.post('/', requireAuth, createWidget);
router.get('/:id', requireAuth, getWidget);
router.put('/:id', requireAuth, updateWidget);
router.delete('/:id', requireAuth, deleteWidget);
router.get("/estudiante/:userId", getStudentDashboard);
router.get("/universidad/:userId", getUniversityDashboard);

export default router;
