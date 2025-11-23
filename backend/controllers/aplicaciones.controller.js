// controllers/aplicaciones.controller.js
import { db } from "../db.js";

export async function applyInternship(req, res) {
  try {
    const { studentId, internshipId } = req.body;

    if (!studentId || !internshipId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // 1️⃣ Verificar si ya existe una aplicación
    const exists = await db
      .collection("aplicaciones")
      .where("estudiante_id", "==", studentId)
      .where("oferta_id", "==", internshipId)
      .get();

    if (!exists.empty) {
      return res
        .status(400)
        .json({ success: false, message: "Already applied" });
    }

    // 2️⃣ Crear nueva aplicación
    await db.collection("aplicaciones").add({
      estudiante_id: studentId,
      oferta_id: internshipId,
      estado: "enviado",
      creada_en: new Date(),
    });

    res.json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("ERROR applyInternship:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
