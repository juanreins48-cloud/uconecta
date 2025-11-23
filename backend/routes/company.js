// routes/company.js
import express from "express";
import { getDashboard } from "../controllers/companyController.js";

const router = express.Router();

router.get("/:empresaId", getDashboard);

export default router;
