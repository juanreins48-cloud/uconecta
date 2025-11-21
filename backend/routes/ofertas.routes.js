import express from "express";
import { getOfertas, createOffer } from "../controllers/ofertas.controller.js";

const router = express.Router();

router.get("/", getOfertas);
router.post("/", createOffer); // <-- Agregamos el POST

export default router;
