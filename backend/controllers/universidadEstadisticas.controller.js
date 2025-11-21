import pool from "../db.js";

// =============================
// 1. Listado de estudiantes
// =============================
export const getAllStudents = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id AS estudiante_id,
        u.nombre,
        u.email,
        u.created_at,
        e.validado,
        (SELECT COUNT(*) FROM aplicaciones a WHERE a.estudiante_id = e.id) AS aplicaciones,
        (SELECT COUNT(*) FROM vistas_perfil vp WHERE vp.estudiante_id = e.id) AS vistas_perfil
      FROM estudiantes e
      INNER JOIN usuarios u ON u.id = e.usuario_id
    `);

    res.json({ success: true, estudiantes: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// =============================
// 2. Listado de empresas
// =============================
export const getAllCompanies = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id AS empresa_id,
        u.nombre AS nombre_usuario,
        u.email,
        empresas.nombre_empresa,
        empresas.validado,
        (SELECT COUNT(*) FROM ofertas o WHERE o.empresa_id = e.id) AS total_ofertas,
        (SELECT COUNT(*) 
         FROM ofertas o 
         JOIN aplicaciones a ON a.oferta_id = o.id 
         WHERE o.empresa_id = e.id) AS total_postulaciones
      FROM empresas e
      INNER JOIN usuarios u ON u.id = e.usuario_id
      INNER JOIN empresas ON empresas.id = e.id
    `);

    res.json({ success: true, empresas: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// =============================
// 3. Ofertas creadas por empresas
// =============================
export const getAllOffers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        o.id AS oferta_id,
        o.titulo,
        o.descripcion,
        o.status,
        o.creada_en,
        emp.nombre_empresa
      FROM ofertas o
      INNER JOIN empresas emp ON emp.id = o.empresa_id
    `);

    res.json({ success: true, ofertas: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// =============================
// 4. Detalle de aplicaciones
// =============================
export const getApplicationsDetail = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.id AS aplicacion_id,
        a.estado,
        a.creada_en,
        u.nombre AS estudiante_nombre,
        u.email AS estudiante_email,
        o.titulo AS oferta,
        u_emp.nombre AS empresa
      FROM aplicaciones a
      INNER JOIN estudiantes s ON s.id = a.estudiante_id
      INNER JOIN usuarios u ON u.id = s.usuario_id
      INNER JOIN ofertas o ON o.id = a.oferta_id
      INNER JOIN empresas emp ON emp.id = o.empresa_id
      INNER JOIN usuarios u_emp ON u_emp.id = emp.usuario_id
    `);

    res.json({ success: true, aplicaciones: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// =============================
// 5. Empresas que aceptaron estudiantes
// =============================
export const getAcceptedApplications = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.id AS aplicacion_id,
        u.nombre AS estudiante_nombre,
        u.email AS estudiante_email,
        o.titulo AS oferta,
        u_emp.nombre AS empresa,
        a.creada_en
      FROM aplicaciones a
      INNER JOIN estudiantes s ON s.id = a.estudiante_id
      INNER JOIN usuarios u ON u.id = s.usuario_id
      INNER JOIN ofertas o ON o.id = a.oferta_id
      INNER JOIN empresas emp ON emp.id = o.empresa_id
      INNER JOIN usuarios u_emp ON u_emp.id = emp.usuario_id
      WHERE a.estado = 'aceptado'
    `);

    res.json({ success: true, aceptados: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


// ===============================================
// ⭐ 6. FUNCIÓN PRINCIPAL → ENVÍA TODAS LAS ESTADÍSTICAS
// ===============================================
export const getUniversityStatistics = async (req, res) => {
  try {
    // Estudiantes
    const [students] = await pool.query(`
      SELECT 
        e.id AS estudiante_id,
        u.nombre,
        u.email,
        e.validado
      FROM estudiantes e
      INNER JOIN usuarios u ON u.id = e.usuario_id
    `);

    // Empresas
    const [companies] = await pool.query(`
      SELECT 
        emp.id AS empresa_id,
        u.nombre AS nombre_usuario,
        u.email,
        emp.nombre_empresa,
        emp.validado
      FROM empresas emp
      INNER JOIN usuarios u ON u.id = emp.usuario_id
    `);

    // Ofertas
    const [offers] = await pool.query(`
      SELECT 
        o.id AS oferta_id,
        o.titulo,
        o.status,
        emp.nombre_empresa,
        u.nombre AS empresa
      FROM ofertas o
      INNER JOIN empresas emp ON emp.id = o.empresa_id
      INNER JOIN usuarios u ON u.id = emp.usuario_id
      ORDER BY o.creada_en DESC
    `);

    // Aplicaciones
    const [applications] = await pool.query(`
      SELECT 
        a.id AS aplicacion_id,
        a.estado,
        o.titulo AS oferta,
        u_emp.nombre AS empresa,
        u.nombre AS estudiante
      FROM aplicaciones a
      INNER JOIN ofertas o ON o.id = a.oferta_id
      INNER JOIN empresas emp ON emp.id = o.empresa_id
      INNER JOIN usuarios u_emp ON u_emp.id = emp.usuario_id
      INNER JOIN estudiantes s ON s.id = a.estudiante_id
      INNER JOIN usuarios u ON u.id = s.usuario_id
      ORDER BY a.creada_en DESC
    `);

    // Aceptados
    const [accepted] = await pool.query(`
      SELECT 
        a.id AS aplicacion_id,
        o.titulo AS oferta,
        u_emp.nombre AS empresa,
        u.nombre AS estudiante
      FROM aplicaciones a
      INNER JOIN ofertas o ON o.id = a.oferta_id
      INNER JOIN empresas emp ON emp.id = o.empresa_id
      INNER JOIN usuarios u_emp ON u_emp.id = emp.usuario_id
      INNER JOIN estudiantes s ON s.id = a.estudiante_id
      INNER JOIN usuarios u ON u.id = s.usuario_id
      WHERE a.estado = 'aceptado'
    `);

    res.json({
      success: true,
      data: { students, companies, offers, applications, accepted }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
