// controllers/companyController.js
import { db } from "../db.js";

export const getDashboard = async (req, res) => {
  const { empresaId } = req.params;

  try {
    // 1️⃣ Ofertas activas
    const ofertasSnap = await db
      .collection("ofertas")
      .where("empresa_id", "==", empresaId)
      .get();

    const ofertas = ofertasSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const activeOffers = ofertas.filter(o => o.status === "Active").length;

    // 2️⃣ Total aplicaciones
    const aplicacionesSnap = await db
      .collection("aplicaciones")
      .get();

    const aplicaciones = aplicacionesSnap.docs.map(doc => doc.data());

    const applications = aplicaciones.filter(a =>
      ofertas.some(o => o.id === a.oferta_id)
    ).length;

    // 3️⃣ Total entrevistas
    const interviews = aplicaciones.filter(
      a => a.estado === "entrevista" && ofertas.some(o => o.id === a.oferta_id)
    ).length;

    // 4️⃣ Ofertas cerradas
    const filled = ofertas.filter(o => o.status === "Closed").length;

    // 5️⃣ Recent activity
    const recentSnap = await db
      .collection("actividad_empresa")
      .where("empresa_id", "==", empresaId)
      .orderBy("creada_en", "desc")
      .limit(5)
      .get();

    const recent = recentSnap.docs.map(doc => doc.data());

    res.json({
      stats: {
        activeOffers,
        applications,
        interviews,
        filled,
      },
      offers: ofertas,
      recent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener el dashboard de la empresa",
    });
  }
};
