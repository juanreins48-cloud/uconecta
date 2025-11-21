// controllers/companyController.js
import pool from "../db.js";

// GET Dashboard Empresa
export const getDashboard = async (req, res) => {
  const { empresaId } = req.params;

  try {
    // 1️⃣ Estadísticas

    // Total ofertas activas
    const [activeOffersResult] = await pool.query(
      "SELECT COUNT(*) AS activeOffers FROM ofertas WHERE empresa_id = ?",
      [empresaId]
    );
    const activeOffers = activeOffersResult[0].activeOffers;

    // Total aplicaciones
    const [applicationsResult] = await pool.query(
      `SELECT COUNT(*) AS totalApplications
       FROM aplicaciones a
       JOIN ofertas o ON a.oferta_id = o.id
       WHERE o.empresa_id = ?`,
      [empresaId]
    );
    const applications = applicationsResult[0].totalApplications;

    // Total entrevistas
    const [interviewsResult] = await pool.query(
      `SELECT COUNT(*) AS totalInterviews
       FROM aplicaciones a
       JOIN ofertas o ON a.oferta_id = o.id
       WHERE o.empresa_id = ? AND a.estado = 'entrevista'`,
      [empresaId]
    );
    const interviews = interviewsResult[0].totalInterviews;

    // Ofertas cerradas (status 'Closed')
    const [filledResult] = await pool.query(
      `SELECT COUNT(*) AS filled
       FROM ofertas
       WHERE empresa_id = ? AND status = 'Closed'`,
      [empresaId]
    );
    const filled = filledResult[0].filled;

    // 2️⃣ Ofertas con número de applicants y status
    const [offersResult] = await pool.query(
      `SELECT o.id, o.titulo AS title, 
              (SELECT COUNT(*) FROM aplicaciones a WHERE a.oferta_id = o.id) AS applicants,
              o.status
       FROM ofertas o
       WHERE o.empresa_id = ?`,
      [empresaId]
    );

    // 3️⃣ Recent Activity (últimas 5 actividades)
    const [recentResult] = await pool.query(
      `SELECT descripcion AS message, tipo, creada_en AS timestamp
       FROM actividad_empresa
       WHERE empresa_id = ?
       ORDER BY creada_en DESC
       LIMIT 5`,
      [empresaId]
    );

    res.json({
      stats: {
        activeOffers,
        applications,
        interviews,
        filled
      },
      offers: offersResult,
      recent: recentResult
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el dashboard de la empresa" });
  }
};
