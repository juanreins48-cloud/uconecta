import { Router } from "express";
import pool from "../db.js";

const router = Router();

// ======================================
// GUARDAR NUEVA VERSIÓN DEL CV
// ======================================
router.post("/", async (req, res) => {
  try {
    const { studentId, fullName, email, phone, summary, experience, education, skills } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const [exists] = await pool.query(
      "SELECT id FROM estudiantes WHERE id = ?",
      [studentId]
    );

    if (exists.length === 0) {
      return res.status(400).json({ success: false, message: "Student not found" });
    }

    await pool.query(
      `INSERT INTO cv_estudiantes 
       (estudiante_id, full_name, email, phone, summary, experience, education, skills)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, fullName, email, phone, summary, experience, education, skills]
    );

    return res.json({ success: true, message: "CV saved successfully" });

  } catch (err) {
    console.error("Saving CV error:", err);
    return res.status(500).json({ success: false, message: "Error saving CV" });
  }
});

// ======================================
// OBTENER CV MÁS RECIENTE (Estudiante)
// ======================================
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const [rows] = await pool.query(
      `SELECT *
       FROM cv_estudiantes
       WHERE estudiante_id = ?
       ORDER BY actualizado_en DESC
       LIMIT 1`,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "CV not found" });
    }

    return res.json({ success: true, cv: rows[0] });

  } catch (err) {
    console.error("Fetching CV error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ======================================
// VER CV DETALLADO (Empresa/Admin)
// ======================================
router.get("/view/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const [rows] = await pool.query(
      `SELECT *
       FROM cv_estudiantes
       WHERE estudiante_id = ?
       ORDER BY actualizado_en DESC
       LIMIT 1`,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "CV not found" });
    }

    return res.json({ success: true, cv: rows[0] });

  } catch (err) {
    console.error("Fetching CV error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
