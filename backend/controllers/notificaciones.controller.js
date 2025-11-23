import { db } from "../firebase.js";

export async function getStudentNotifications(req, res) {
  try {
    const { studentId } = req.params;

    const snap = await db.collection("notificaciones_estudiante")
      .where("estudiante_id", "==", studentId)
      .orderBy("creada_en", "desc")
      .get();

    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(data);

  } catch (error) {
    console.error("ERROR getStudentNotifications:", error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getUniversityNotifications(req, res) {
  try {
    const { userId } = req.params;

    const uniSnap = await db.collection("universidades")
      .where("usuario_id", "==", userId)
      .limit(1)
      .get();

    if (uniSnap.empty) {
      return res.status(404).json({ error: "Universidad no encontrada" });
    }

    const universidadId = uniSnap.docs[0].id;

    const notifSnap = await db.collection("notificaciones_universidad")
      .where("universidad_id", "==", universidadId)
      .orderBy("creada_en", "desc")
      .get();

    const notificaciones = notifSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ notificaciones });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notificaciones" });
  }
}
