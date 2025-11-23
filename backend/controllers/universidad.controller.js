// controllers/universidad.controller.js
import { db } from "../db.js";

/**
 * Obtener estudiantes pendientes de validación
 */
export const estudiantesPendientes = async (req, res) => {
  try {
    const snap = await db.collection("estudiantes").where("validado", "==", false).get();
    if (snap.empty) return res.json({ success: true, estudiantes: [] });

    const estudiantes = [];
    const usuarioIds = new Set();
    snap.docs.forEach(d => {
      const data = { id: d.id, ...d.data() };
      estudiantes.push(data);
      if (data.usuario_id) usuarioIds.add(String(data.usuario_id));
    });

    // obtener usuarios
    const usuariosMap = new Map();
    for (const uid of usuarioIds) {
      const udoc = await db.collection("usuarios").doc(String(uid)).get();
      if (udoc.exists) usuariosMap.set(uid, { id: udoc.id, ...udoc.data() });
    }

    const result = estudiantes.map(e => {
      const u = usuariosMap.get(String(e.usuario_id));
      return { id: e.id, nombre: u?.nombre || null, email: u?.email || null };
    });

    res.json({ success: true, estudiantes: result });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error loading students" });
  }
};

/**
 * Validar estudiante
 */
export const validarEstudiante = async (req, res) => {
  try {
    const { studentId } = req.body;

    const ref = db.collection("estudiantes").doc(String(studentId));
    const doc = await ref.get();
    if (!doc.exists) {
      return res.json({ success: false, message: "Not found" });
    }

    await ref.update({ validado: true });

    res.json({ success: true, message: "Student validated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error validating student" });
  }
};

/**
 * Reportar estudiante (elimina)
 */
export const reportarEstudiante = async (req, res) => {
  try {
    const { studentId } = req.body;

    await db.collection("estudiantes").doc(String(studentId)).delete();

    res.json({ success: true, message: "Student reported & removed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error reporting student" });
  }
};

/**
 * Obtener empresas pendientes
 */
export const getEmpresasPendientes = async (req, res) => {
  try {
    const snap = await db.collection("empresas").where("validado", "==", false).get();
    if (snap.empty) return res.json({ success: true, empresas: [] });

    const empresas = [];
    const usuarioIds = new Set();
    snap.docs.forEach(d => {
      const data = { id: d.id, ...d.data() };
      empresas.push(data);
      if (data.usuario_id) usuarioIds.add(String(data.usuario_id));
    });

    // obtener usuarios
    const usuariosMap = new Map();
    for (const uid of usuarioIds) {
      const udoc = await db.collection("usuarios").doc(String(uid)).get();
      if (udoc.exists) usuariosMap.set(uid, { id: udoc.id, ...udoc.data() });
    }

    const result = empresas.map(e => {
      const u = usuariosMap.get(String(e.usuario_id));
      return {
        id: e.id,
        nombre: u?.nombre || null,
        email: u?.email || null,
        empresa: e.nombre_empresa || null
      };
    });

    return res.json({ success: true, empresas: result });
  } catch (error) {
    console.error("Error cargando empresas:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

/**
 * Validar empresa
 */
export const validarEmpresa = async (req, res) => {
  const { companyId } = req.body;

  try {
    // marcar validado
    await db.collection("empresas").doc(String(companyId)).update({ validado: true });

    // Notificación
    await db.collection("notificaciones_empresa").add({
      empresa_id: String(companyId),
      mensaje: "Tu empresa ha sido validada por la universidad.",
      creada_en: new Date(),
      leida: false
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error validando empresa:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

/**
 * Reportar empresa (mantener y enviar notificación)
 */
export const reportarEmpresa = async (req, res) => {
  const { companyId } = req.body;

  try {
    await db.collection("notificaciones_empresa").add({
      empresa_id: String(companyId),
      mensaje: "Tu empresa fue reportada por la universidad.",
      creada_en: new Date(),
      leida: false
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error reportando empresa:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};
