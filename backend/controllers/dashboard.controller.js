import { db } from "../firebase.js";

// CREATE widget
export async function createWidget(req, res, next) {
  try {
    const { title, config, data } = req.body;
    const owner_id = req.user.id;

    const docRef = await db.collection("widgets").add({
      title,
      config: config || null,
      data: data || null,
      owner_id,
      created_at: new Date()
    });

    res.status(201).json({ id: docRef.id, title });
  } catch (err) { next(err); }
}

// LIST widgets
export async function listWidgets(req, res, next) {
  try {
    const snap = await db.collection("widgets").get();
    const widgets = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(widgets);
  } catch (err) { next(err); }
}

// GET widget by ID
export async function getWidget(req, res, next) {
  try {
    const doc = await db.collection("widgets").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "No encontrado" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) { next(err); }
}

// UPDATE widget
export async function updateWidget(req, res, next) {
  try {
    const { title, config, data } = req.body;

    await db.collection("widgets").doc(req.params.id).update({
      title,
      config: config || null,
      data: data || null
    });

    res.json({ ok: true });
  } catch (err) { next(err); }
}

// DELETE widget
export async function deleteWidget(req, res, next) {
  try {
    await db.collection("widgets").doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (err) { next(err); }
}
export async function getStudentDashboard(req, res) {
  const { userId } = req.params;

  try {
    // obtener estudiante vinculado
    const snap = await db.collection("estudiantes")
      .where("usuario_id", "==", userId)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = snap.docs[0].id;

    // aplicaciones
    const appsSnap = await db.collection("aplicaciones")
      .where("estudiante_id", "==", studentId)
      .get();

    const applications = appsSnap.size;

    // entrevistas
    const interviewsSnap = await db.collection("aplicaciones")
      .where("estudiante_id", "==", studentId)
      .where("estado", "==", "entrevista")
      .get();

    const interviews = interviewsSnap.size;

    // aceptado
    const recSnap = await db.collection("aplicaciones")
      .where("estudiante_id", "==", studentId)
      .where("estado", "==", "aceptado")
      .get();

    const recommendations = recSnap.size;

    // vistas perfil
    const viewsSnap = await db.collection("vistas_perfil")
      .where("estudiante_id", "==", studentId)
      .get();

    const views = viewsSnap.size;

    // actividad reciente
    const recentSnap = await db.collection("actividad_estudiante")
      .where("estudiante_id", "==", studentId)
      .orderBy("creada_en", "desc")
      .limit(5)
      .get();

    const recent = recentSnap.docs.map(d => d.data());

    return res.json({
      stats: { applications, interviews, recommendations, views },
      recent
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
export async function getUniversityDashboard(req, res) {
  try {
    const { userId } = req.params;

    // obtener universidad
    const uniSnap = await db.collection("universidades")
      .where("usuario_id", "==", userId)
      .limit(1)
      .get();

    if (uniSnap.empty) {
      return res.status(404).json({ error: "Universidad no encontrada" });
    }

    // total estudiantes
    const studentsSnap = await db.collection("estudiantes").get();
    const students = studentsSnap.size;

    // total empresas
    const companiesSnap = await db.collection("empresas").get();
    const companies = companiesSnap.size;

    // ofertas activas
    const intSnap = await db.collection("ofertas")
      .where("status", "==", "Active")
      .get();

    const internships = intSnap.size;

    // success rate
    const totalAppsSnap = await db.collection("aplicaciones").get();
    const totalApps = totalAppsSnap.size;

    const acceptedSnap = await db.collection("aplicaciones")
      .where("estado", "==", "aceptado")
      .get();

    const accepted = acceptedSnap.size;

    const successRate =
      totalApps > 0 ? Math.round((accepted / totalApps) * 100) : 0;

    // actividad reciente
    const recentSnap = await db.collection("actividad_empresa")
      .orderBy("creada_en", "desc")
      .limit(5)
      .get();

    const recent = recentSnap.docs.map(d => d.data());

    res.json({
      success: true,
      stats: { students, companies, internships, successRate },
      recent
    });

  } catch (error) {
    console.error("ERROR getUniversityDashboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
