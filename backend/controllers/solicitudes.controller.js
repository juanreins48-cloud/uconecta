import pool from "../db.js";

// ---------------------------------------------
// Estudiante aplica a una oferta
// ---------------------------------------------
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

    // obtener empresa_id desde oferta
    const [offer] = await pool.query(
      "SELECT empresa_id, titulo FROM ofertas WHERE id = ?",
      [internshipId]
    );

    if (offer.length === 0) {
      return res.status(400).json({ success: false, message: "Offer not found" });
    }

    const empresaId = offer[0].empresa_id;
    const title = offer[0].titulo;

    // insertar aplicación
    await pool.query(
      "INSERT INTO aplicaciones (estudiante_id, oferta_id) VALUES (?, ?)",
      [studentId, internshipId]
    );

    // insertar actividad para la empresa
    await pool.query(
      "INSERT INTO actividad_empresa (empresa_id, descripcion, tipo) VALUES (?, ?, 'nueva_aplicacion')",
      [empresaId, `Nueva aplicación recibida para ${title}`]
    );

    res.json({ success: true, message: "Application submitted successfully" });

  } catch (error) {
    console.error("ERROR applyInternship:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ---------------------------------------------
// Obtener aplicaciones que recibió una empresa
// ---------------------------------------------
export async function getApplicationsByCompany(req, res) {
  try {
    const { empresaId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        a.id AS aplicacion_id,
        a.estado,
        a.creada_en,
        e.id AS estudiante_id,
        u.nombre AS estudiante_nombre,
        u.email AS estudiante_email,
        o.id AS oferta_id,
        o.titulo AS oferta_titulo,
        cv.full_name AS full_name,
        cv.email AS email,
        cv.phone AS phone,
        cv.summary,
        cv.experience,
        cv.education,
        cv.skills
      FROM aplicaciones a
      INNER JOIN estudiantes e ON a.estudiante_id = e.id
      INNER JOIN usuarios u ON e.usuario_id = u.id
      INNER JOIN ofertas o ON a.oferta_id = o.id
      LEFT JOIN cv_estudiantes cv
        ON cv.estudiante_id = e.id
        AND cv.actualizado_en = (
          SELECT MAX(actualizado_en)
          FROM cv_estudiantes
          WHERE estudiante_id = e.id
        )
      WHERE o.empresa_id = ?
      ORDER BY a.creada_en DESC
      `,
      [empresaId]
    );

    return res.json({ success: true, data: rows });

  } catch (error) {
    console.error("ERROR getApplicationsByCompany:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
// ---------------------------------------------
// Cambiar estado de una aplicación + notificación detallada
// ---------------------------------------------
export async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, mensaje } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Missing status" });
    }

    // 1️⃣ Obtener datos de la aplicación
    const [app] = await pool.query(
      `SELECT estudiante_id, oferta_id
       FROM aplicaciones
       WHERE id = ?`,
      [id]
    );

    if (app.length === 0) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const estudianteId = app[0].estudiante_id;
    const ofertaId = app[0].oferta_id;

    // 2️⃣ Obtener información de la oferta
    const [offer] = await pool.query(
      "SELECT titulo FROM ofertas WHERE id = ?",
      [ofertaId]
    );

    const tituloOferta = offer.length > 0 ? offer[0].titulo : "una oferta";

    // 3️⃣ Actualizar el estado
    await pool.query(
      "UPDATE aplicaciones SET estado = ? WHERE id = ?",
      [status, id]
    );

    // 4️⃣ Construir notificación
    let mensajeNotificacion = "";

    if (status === "aceptado") {
      mensajeNotificacion =
        `¡Felicidades! Has sido **ACEPTADO** en la pasantía: *${tituloOferta}*.\n\n`;

      if (mensaje && mensaje.trim() !== "") {
        mensajeNotificacion += `Mensaje de la empresa:\n"${mensaje}"`;
      } else {
        mensajeNotificacion +=
          "La empresa pronto se pondrá en contacto contigo para continuar con el proceso.";
      }
    }

    if (status === "rechazado") {
      mensajeNotificacion =
        `Tu aplicación a la pasantía **${tituloOferta}** ha sido rechazada.\n\n`;

      mensajeNotificacion += "Sigue intentándolo, ¡nuevas oportunidades vienen pronto!";
    }

    // 5️⃣ Guardar notificación
    await pool.query(
      `INSERT INTO notificaciones_estudiante (estudiante_id, mensaje)
       VALUES (?, ?)`,
      [estudianteId, mensajeNotificacion]
    );

    return res.json({
      success: true,
      message: "Status updated + notification sent",
    });

  } catch (error) {
    console.error("ERROR updateApplicationStatus:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
