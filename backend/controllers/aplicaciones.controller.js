import pool from "../db.js";

export async function applyInternship(req, res) {
  try {
    const { studentId, internshipId } = req.body;

    if (!studentId || !internshipId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // verificar si ya aplicó
    const [exists] = await pool.query(
      "SELECT * FROM aplicaciones WHERE estudiante_id = ? AND oferta_id = ?",
      [studentId, internshipId]
    );

    if (exists.length > 0) {
      return res.status(400).json({ success: false, message: "Already applied" });
    }

    await pool.query(
      "INSERT INTO aplicaciones (estudiante_id, oferta_id) VALUES (?, ?)",
      [studentId, internshipId]
    );

    res.json({ success: true, message: "Application submitted successfully" });

  } catch (error) {
    console.error("ERROR applyInternship:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}


