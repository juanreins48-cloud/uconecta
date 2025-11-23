// controllers/solicitudes.controller.js
import { db } from "../db.js";

/**
 * Estudiante aplica a una oferta
 */
export async function applyInternship(req, res) {
  try {
    const { studentId, internshipId } = req.body;

    if (!studentId || !internshipId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // verificar si ya aplicó
    const existsSnap = await db.collection("aplicaciones")
      .where("estudiante_id", "==", String(studentId))
      .where("oferta_id", "==", String(internshipId))
      .limit(1)
      .get();

    if (!existsSnap.empty) {
      return res.status(400).json({ success: false, message: "Already applied" });
    }

    // obtener oferta para sacar empresa_id y titulo
    const offerDoc = await db.collection("ofertas").doc(String(internshipId)).get();
    if (!offerDoc.exists) {
      return res.status(400).json({ success: false, message: "Offer not found" });
    }
    const offerData = offerDoc.data();
    const empresaId = offerData.empresa_id;
    const title = offerData.titulo || "";

    // insertar aplicación
    await db.collection("aplicaciones").add({
      estudiante_id: String(studentId),
      oferta_id: String(internshipId),
      estado: "enviado",
      creada_en: new Date()
    });

    // insertar actividad para la empresa
    await db.collection("actividad_empresa").add({
      empresa_id: String(empresaId),
      descripcion: `Nueva aplicación recibida para ${title}`,
      tipo: "nueva_aplicacion",
      creada_en: new Date()
    });
console.log(">>>> APPLY NUEVO <<<<");
    res.json({ success: true, message: "Application submitted successfully" });

  } catch (error) {
    console.error("ERROR applyInternship:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * Obtener aplicaciones que recibió una empresa
 */
export async function getApplicationsByCompany(req, res) {
  try {
    const { empresaId } = req.params;
    const empresaIdStr = String(empresaId);

    // 1) Traer todas las ofertas de la empresa
    const ofertasSnap = await db.collection("ofertas")
      .where("empresa_id", "==", empresaIdStr)
      .get();

    if (ofertasSnap.empty) {
      return res.json({ success: true, data: [] });
    }

    const ofertaIds = ofertasSnap.docs.map(d => d.id);
    const ofertaMap = new Map();
    ofertasSnap.docs.forEach(d => ofertaMap.set(d.id, d.data()));

    // 2) Traer aplicaciones relacionadas (si hay <=10 ofertas usamos 'in', si no, traemos todas y filtramos)
    let aplicaciones = [];
    if (ofertaIds.length <= 10) {
      const appsSnap = await db.collection("aplicaciones")
        .where("oferta_id", "in", ofertaIds)
        .orderBy("creada_en", "desc")
        .get();
      aplicaciones = appsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      // muchas ofertas: leer todas las aplicaciones y filtrar (evitar fallos por límite "in")
      const appsSnap = await db.collection("aplicaciones").orderBy("creada_en", "desc").get();
      aplicaciones = appsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(a => ofertaIds.includes(a.oferta_id));
    }

    if (aplicaciones.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 3) Preparar sets de ids para fetchs en lote
    const estudianteIdsSet = new Set(aplicaciones.map(a => String(a.estudiante_id)));
    const estudianteIds = Array.from(estudianteIdsSet);

    // 4) Obtener estudiantes -> usuario_id
    const estudiantesMap = new Map(); // estudianteId => estudianteData (including usuario_id)
    for (const sid of estudianteIds) {
      const sdoc = await db.collection("estudiantes").doc(String(sid)).get();
      if (sdoc.exists) estudiantesMap.set(sid, { id: sdoc.id, ...sdoc.data() });
    }

    // 5) Obtener usuarios para los estudiantes (batch)
    const usuarioIdsSet = new Set();
    for (const [, est] of estudiantesMap) {
      if (est.usuario_id) usuarioIdsSet.add(String(est.usuario_id));
    }
    const usuarioIds = Array.from(usuarioIdsSet);
    const usuariosMap = new Map();
    for (const uid of usuarioIds) {
      const udoc = await db.collection("usuarios").doc(String(uid)).get();
      if (udoc.exists) usuariosMap.set(uid, { id: udoc.id, ...udoc.data() });
    }

    // 6) Obtener CVs (último por estudiante) - si en tu migración dejaste cv_estudiantes con actualizado_en
    const cvMap = new Map(); // estudianteId => cvData
    for (const sid of estudianteIds) {
      // buscar cv_estudiantes con estudiante_id == sid, ordenando por actualizado_en desc limit 1
      const cvsnap = await db.collection("cv_estudiantes")
        .where("estudiante_id", "==", String(sid))
        .orderBy("actualizado_en", "desc")
        .limit(1)
        .get();
      if (!cvsnap.empty) {
        cvMap.set(sid, cvsnap.docs[0].data());
      }
    }

    // 7) Construir respuesta final
    const data = aplicaciones.map(a => {
      const estudiante = estudiantesMap.get(String(a.estudiante_id)) || null;
      const usuario = estudiante && estudiante.usuario_id ? usuariosMap.get(String(estudiante.usuario_id)) : null;
      const oferta = ofertaMap.get(String(a.oferta_id)) || {};
      const cv = cvMap.get(String(a.estudiante_id)) || null;

      return {
        aplicacion_id: a.id,
        estado: a.estado,
        creada_en: a.creada_en || null,
        estudiante_id: estudiante ? estudiante.id : null,
        estudiante_nombre: usuario ? usuario.nombre : null,
        estudiante_email: usuario ? usuario.email : null,
        oferta_id: a.oferta_id,
        oferta_titulo: oferta.titulo || null,
        full_name: cv ? cv.full_name : null,
        email: cv ? cv.email : null,
        phone: cv ? cv.phone : null,
        summary: cv ? cv.summary : null,
        experience: cv ? cv.experience : null,
        education: cv ? cv.education : null,
        skills: cv ? cv.skills : null
      };
    });

    return res.json({ success: true, data });

  } catch (error) {
    console.error("ERROR getApplicationsByCompany:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * Cambiar estado de una aplicación + notificación detallada
 */
export async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, mensaje } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Missing status" });
    }

    // 1) Obtener la aplicación
    const appRef = db.collection("aplicaciones").doc(String(id));
    const appDoc = await appRef.get();
    if (!appDoc.exists) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    const appData = appDoc.data();
    const estudianteId = appData.estudiante_id;
    const ofertaId = appData.oferta_id;

    // 2) Obtener info de la oferta
    const offerDoc = await db.collection("ofertas").doc(String(ofertaId)).get();
    const tituloOferta = offerDoc.exists ? (offerDoc.data().titulo || "una oferta") : "una oferta";

    // 3) Actualizar estado
    await appRef.update({ estado: status });

    // 4) Construir notificación
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
    } else if (status === "rechazado") {
      mensajeNotificacion =
        `Tu aplicación a la pasantía **${tituloOferta}** ha sido rechazada.\n\n` +
        "Sigue intentándolo, ¡nuevas oportunidades vienen pronto!";
    } else {
      // otros estados: enviar notificación genérica
      mensajeNotificacion = `El estado de tu aplicación para ${tituloOferta} cambió a: ${status}.`;
      if (mensaje && mensaje.trim() !== "") mensajeNotificacion += `\n\nMensaje de la empresa:\n"${mensaje}"`;
    }

    // 5) Guardar notificación
    await db.collection("notificaciones_estudiante").add({
      estudiante_id: String(estudianteId),
      mensaje: mensajeNotificacion,
      creada_en: new Date(),
      leida: false
    });

    return res.json({
      success: true,
      message: "Status updated + notification sent",
    });

  } catch (error) {
    console.error("ERROR updateApplicationStatus:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
