import express from "express";
import { applyInternship } from "../controllers/aplicaciones.controller.js";

const router = express.Router();

router.post("/", applyInternship);

export default router;
