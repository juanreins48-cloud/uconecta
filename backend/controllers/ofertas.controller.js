import pool from "../db.js";

// =====================
// GET todas las ofertas activas (para ApplyPasantia.jsx)
// =====================
export async function getOfertas(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
          o.id,
          o.titulo,
          o.descripcion,
          o.ubicacion,
          o.modalidad,
          o.remuneracion,
          e.nombre_empresa AS company
      FROM ofertas o
      JOIN empresas e ON o.empresa_id = e.id
      WHERE o.status = 'Active'
      ORDER BY o.creada_en DESC
    `);

    res.json({ success: true, ofertas: rows });
  } catch (error) {
    console.error("ERROR getOfertas:", error);
    res.status(500).json({ success: false, message: "Error fetching offers" });
  }
}

// =====================
// POST nueva oferta (para PostOfertas.jsx)
// =====================
export async function createOffer(req, res) {
  try {
    const {
      empresaId,
      titulo,
      descripcion,
      requisitos,
      ubicacion,
      modalidad = 'presencial',
      remuneracion
    } = req.body;

    // Validación básica
    if (!empresaId || !titulo || !descripcion) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Insertar nueva oferta en la tabla 'ofertas'
    const [result] = await pool.query(
      `INSERT INTO ofertas (empresa_id, titulo, descripcion, requisitos, ubicacion, modalidad, remuneracion, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [empresaId, titulo, descripcion, requisitos, ubicacion, modalidad, remuneracion]
    );

    const ofertaId = result.insertId;

    // Registrar actividad de la empresa
    await pool.query(
      `INSERT INTO actividad_empresa (empresa_id, descripcion, tipo) 
       VALUES (?, ?, 'nueva_oferta')`,
      [empresaId, `Nueva oferta publicada: ${titulo}`]
    );

    res.json({ success: true, message: "Oferta creada correctamente", ofertaId });

  } catch (err) {
    console.error("ERROR createOffer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
