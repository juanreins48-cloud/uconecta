// routes/usuario.routes.js
import express from "express";
import {
  getMyAccount,
  updateMyAccount
} from "../controllers/usuario.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", requireAuth, getMyAccount);
router.patch("/update/:id", requireAuth, updateMyAccount);

export default router;