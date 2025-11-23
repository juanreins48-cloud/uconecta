// routes/ofertas.routes.js
import express from "express";
import { getOfertas, createOffer } from "../controllers/ofertas.controller.js";

const router = express.Router();

router.get("/", getOfertas);
router.post("/", createOffer);

export default router;
