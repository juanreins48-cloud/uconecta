import pool from "../db.js";

// Obtener notificaciones por estudiante
export async function getStudentNotifications(req, res) {
  try {
    const { studentId } = req.params;

    const [rows] = await pool.query(
      `SELECT id, mensaje, creada_en, leida
       FROM notificaciones_estudiante
       WHERE estudiante_id = ?
       ORDER BY creada_en DESC`,
      [studentId]
    );

    // 🔥 DEVOLVER SOLO EL ARRAY (como tu frontend espera)
    return res.json(rows);

  } catch (error) {
    console.error("ERROR getStudentNotifications:", error);
    res.status(500).json({ error: "Server error" });
  }
}

export const getUniversityNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `SELECT id FROM universidades WHERE usuario_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Universidad no encontrada" });
    }

    const universidadId = rows[0].id;

    const [notificaciones] = await pool.query(
      `SELECT id, mensaje, creada_en, leida 
       FROM notificaciones_universidad
       WHERE universidad_id = ?
       ORDER BY creada_en DESC`,
      [universidadId]
    );

    res.json({ notificaciones });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notificaciones" });
  }
};
