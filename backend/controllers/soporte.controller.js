import pool from "../db.js";

// POST /api/soporte
export const sendSupportMessage = async (req, res) => {
  try {
    const userId = req.user.id; // viene del middleware requireAuth
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Faltan campos" });
    }

    await pool.query(
      "INSERT INTO soporte (usuario_id, subject, message) VALUES (?, ?, ?)",
      [userId, subject, message]
    );

    res.json({ success: true, message: "Mensaje enviado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};
// GET /api/soporte  -> lista de mensajes (solo para rol 'universidad' o admin)
export const listSupportMessages = async (req, res) => {
  try {
    const user = req.user || {};
    // solo universidades (DashboardAdmin) deberían ver los mensajes
    if (user.role !== "universidad") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const [rows] = await pool.query(
      `SELECT s.id, s.usuario_id, s.subject, s.message, s.enviada_en,
              u.nombre AS sender_name, u.email AS sender_email
       FROM soporte s
       LEFT JOIN usuarios u ON s.usuario_id = u.id
       ORDER BY s.enviada_en DESC`
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error listing support messages:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// GET /api/soporte/:id -> detalle de un mensaje (solo universidad)
export const getSupportMessage = async (req, res) => {
  try {
    const user = req.user || {};
    if (user.role !== "universidad") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT s.id, s.usuario_id, s.subject, s.message, s.enviada_en,
              u.nombre AS sender_name, u.email AS sender_email
       FROM soporte s
       LEFT JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Mensaje no encontrado" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error getting support message:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
};