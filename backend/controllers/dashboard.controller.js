// controllers/dashboard.controller.js
import pool from '../db.js';

export async function createWidget(req, res, next) {
  try {
    const { title, config, data } = req.body;
    const owner_id = req.user.id;
    const [result] = await pool.query(
      'INSERT INTO widgets (title, config, data, owner_id) VALUES (?, ?, ?, ?)',
      [title, JSON.stringify(config || null), JSON.stringify(data || null), owner_id]
    );
    res.status(201).json({ id: result.insertId, title });
  } catch (err) { next(err); }
}

export async function listWidgets(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, title, config, data, owner_id, created_at FROM widgets');
    // parse JSON fields
    const parsed = rows.map(r => ({ ...r, config: r.config ? JSON.parse(r.config) : null, data: r.data ? JSON.parse(r.data) : null }));
    res.json(parsed);
  } catch (err) { next(err); }
}

export async function getWidget(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM widgets WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    const r = rows[0];
    r.config = r.config ? JSON.parse(r.config) : null;
    r.data = r.data ? JSON.parse(r.data) : null;
    res.json(r);
  } catch (err) { next(err); }
}

export async function updateWidget(req, res, next) {
  try {
    const { title, config, data } = req.body;
    await pool.query('UPDATE widgets SET title = ?, config = ?, data = ? WHERE id = ?',
      [title, JSON.stringify(config||null), JSON.stringify(data||null), req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function deleteWidget(req, res, next) {
  try {
    await pool.query('DELETE FROM widgets WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function getStudentDashboard(req, res) {
  const { userId } = req.params;

  try {
    // 1. Buscar el ID del estudiante asociado al usuario
    const [[student]] = await pool.query(
      "SELECT id FROM estudiantes WHERE usuario_id = ?",
      [userId]
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = student.id;

    // 2. Total aplicaciones enviadas
    const [[{ applications }]] = await pool.query(
      "SELECT COUNT(*) AS applications FROM aplicaciones WHERE estudiante_id = ?",
      [studentId]
    );

    // 3. Entrevistas programadas
    const [[{ interviews }]] = await pool.query(
      "SELECT COUNT(*) AS interviews FROM aplicaciones WHERE estudiante_id = ? AND estado = 'entrevista'",
      [studentId]
    );

    // 4. Recomendaciones / ofertas aceptadas
    const [[{ recommendations }]] = await pool.query(
      "SELECT COUNT(*) AS recommendations FROM aplicaciones WHERE estudiante_id = ? AND estado = 'aceptado'",
      [studentId]
    );

    // 5. Vistas al perfil
    const [[{ views }]] = await pool.query(
      "SELECT COUNT(*) AS views FROM vistas_perfil WHERE estudiante_id = ?",
      [studentId]
    );

    // 6. Actividad reciente (máx 5)
    const [recent] = await pool.query(
      `SELECT titulo AS title, tiempo AS time
       FROM actividad_estudiante
       WHERE estudiante_id = ?
       ORDER BY creada_en DESC
       LIMIT 5`,
      [studentId]
    );

    return res.json({
      stats: {
        applications,
        interviews,
        recommendations,
        views
      },
      recent
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// =======================================
// 🔵  DASHBOARD UNIVERSIDAD
// =======================================
export async function getUniversityDashboard(req, res) {
  try {
    const { userId } = req.params;

    // obtener el id de universidad
    const [uni] = await pool.query(
      "SELECT id FROM universidades WHERE usuario_id = ?",
      [userId]
    );

    if (uni.length === 0) {
      return res.status(400).json({ success: false, message: "University not found" });
    }

    // total estudiantes
    const [students] = await pool.query("SELECT COUNT(*) AS total FROM estudiantes");

    // total empresas
    const [companies] = await pool.query("SELECT COUNT(*) AS total FROM empresas");

    // ofertas activas
    const [internships] = await pool.query(
      "SELECT COUNT(*) AS total FROM ofertas WHERE status = 'Active'"
    );

    // success rate → % aceptados
    const [[{ totalApps }]] = await pool.query(
      "SELECT COUNT(*) AS totalApps FROM aplicaciones"
    );
    const [[{ accepted }]] = await pool.query(
      "SELECT COUNT(*) AS accepted FROM aplicaciones WHERE estado = 'aceptado'"
    );

    const successRate = totalApps > 0 ? Math.round((accepted / totalApps) * 100) : 0;

    // actividad reciente → últimas 5 ofertas o aplicaciones
    const [recent] = await pool.query(`
        SELECT descripcion, creada_en
        FROM actividad_empresa
        ORDER BY creada_en DESC
        LIMIT 5
    `);

    return res.json({
      success: true,
      stats: {
        students: students[0].total,
        companies: companies[0].total,
        internships: internships[0].total,
        successRate,
      },
      recent,
    });

  } catch (error) {
    console.error("ERROR getUniversityDashboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}