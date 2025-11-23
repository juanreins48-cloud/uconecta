// controllers/soporte.controller.js
import { db } from "../db.js";

/**
 * POST /api/soporte
 */
export const sendSupportMessage = async (req, res) => {
  try {
    const userId = req.user.id; // viene del middleware requireAuth
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Faltan campos" });
    }

    await db.collection("soporte").add({
      usuario_id: String(userId),
      subject,
      message,
      enviada_en: new Date()
    });

    res.json({ success: true, message: "Mensaje enviado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

/**
 * GET /api/soporte  -> lista de mensajes (solo para rol 'universidad' o admin)
 */
export const listSupportMessages = async (req, res) => {
  try {
    const user = req.user || {};
    // solo universidades (DashboardAdmin) deberían ver los mensajes
    if (user.role !== "universidad") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    // Traer mensajes
    const snap = await db.collection("soporte").orderBy("enviada_en", "desc").get();
    if (snap.empty) return res.json({ success: true, data: [] });

    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Obtener usuarios senders (batch)
    const userIds = [...new Set(msgs.map(m => m.usuario_id).filter(Boolean))];
    const usuariosMap = new Map();
    for (const uid of userIds) {
      const udoc = await db.collection("usuarios").doc(String(uid)).get();
      if (udoc.exists) usuariosMap.set(uid, { id: udoc.id, ...udoc.data() });
    }

    const data = msgs.map(m => ({
      id: m.id,
      usuario_id: m.usuario_id,
      subject: m.subject,
      message: m.message,
      enviada_en: m.enviada_en,
      sender_name: usuariosMap.get(m.usuario_id)?.nombre || null,
      sender_email: usuariosMap.get(m.usuario_id)?.email || null
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Error listing support messages:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

/**
 * GET /api/soporte/:id -> detalle de un mensaje (solo universidad)
 */
export const getSupportMessage = async (req, res) => {
  try {
    const user = req.user || {};
    if (user.role !== "universidad") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const { id } = req.params;
    const doc = await db.collection("soporte").doc(String(id)).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Mensaje no encontrado" });
    }

    const m = doc.data();
    const senderDoc = m.usuario_id ? await db.collection("usuarios").doc(String(m.usuario_id)).get() : null;
    const sender = senderDoc && senderDoc.exists ? senderDoc.data() : null;

    return res.json({
      success: true,
      data: {
        id: doc.id,
        usuario_id: m.usuario_id,
        subject: m.subject,
        message: m.message,
        enviada_en: m.enviada_en,
        sender_name: sender?.nombre || null,
        sender_email: sender?.email || null
      }
    });
  } catch (err) {
    console.error("Error getting support message:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
};
