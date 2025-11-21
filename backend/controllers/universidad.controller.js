import pool from "../db.js";

export const estudiantesPendientes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, u.nombre, u.email 
       FROM estudiantes e
       INNER JOIN usuarios u ON u.id = e.usuario_id
       WHERE e.validado = FALSE`
    );

    res.json({ success: true, estudiantes: rows });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error loading students" });
  }
};

export const validarEstudiante = async (req, res) => {
  try {
    const { studentId } = req.body;

    const [result] = await pool.query(
      `UPDATE estudiantes SET validado = TRUE WHERE id = ?`,
      [studentId]
    );

    if (result.affectedRows === 0)
      return res.json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Student validated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error validating student" });
  }
};
export const reportarEstudiante = async (req, res) => {
  try {
    const { studentId } = req.body;

    await pool.query("DELETE FROM estudiantes WHERE id = ?", [studentId]);

    res.json({ success: true, message: "Student reported & removed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error reporting student" });
  }
};


// ----------------------------------------------
// 🔵 Obtener empresas NO validadas
// ----------------------------------------------
export const getEmpresasPendientes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, u.nombre AS nombre, u.email, e.nombre_empresa AS empresa
       FROM empresas e
       INNER JOIN usuarios u ON e.usuario_id = u.id
       WHERE e.validado = FALSE`
    );

    return res.json({
      success: true,
      empresas: rows
    });
  } catch (error) {
    console.error("Error cargando empresas:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

// ----------------------------------------------
// 🔵 VALIDAR EMPRESA
// ----------------------------------------------
export const validarEmpresa = async (req, res) => {
  const { companyId } = req.body;

  try {
    // Validar
    await pool.query(
      `UPDATE empresas SET validado = TRUE WHERE id = ?`,
      [companyId]
    );

    // Notificación
    await pool.query(
      `INSERT INTO notificaciones_empresa (empresa_id, mensaje)
       VALUES (?, "Tu empresa ha sido validada por la universidad.")`,
      [companyId]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error validando empresa:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

// ----------------------------------------------
// 🔵 REPORTAR EMPRESA
// ----------------------------------------------
export const reportarEmpresa = async (req, res) => {
  const { companyId } = req.body;

  try {
    // Puedes marcar como validado=0 o mantener igual
    await pool.query(
      `INSERT INTO notificaciones_empresa (empresa_id, mensaje)
       VALUES (?, "Tu empresa fue reportada por la universidad.")`,
      [companyId]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error reportando empresa:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};