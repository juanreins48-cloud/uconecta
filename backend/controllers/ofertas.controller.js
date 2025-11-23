import { db } from "../db.js";

// GET Ofertas activas
export async function getOfertas(req, res) {
  try {
    const snap = await db.collection("ofertas")
      .where("status", "==", "Active")
      .orderBy("creada_en", "desc")
      .get();

    const ofertas = [];

    for (const doc of snap.docs) {
  const oferta = doc.data();

  let empresaNombre = ""; // ✅ inicializamos por defecto
  if (oferta.empresa_id) {
    const empresaDoc = await db.collection("empresas").doc(oferta.empresa_id).get();
    empresaNombre = empresaDoc.exists ? empresaDoc.data().nombre_empresa : "";
  } else {
    console.warn(`Oferta ${doc.id} tiene empresa_id vacío`);
  }

  ofertas.push({
    id: doc.id,
    ...oferta,
    company: empresaNombre, // ✅ usamos la variable definida
  });
}

    res.json({ success: true, ofertas });

  } catch (error) {
    console.error("ERROR getOfertas:", error);
    res.status(500).json({ success: false, message: "Error fetching offers" });
  }
}

// CREA oferta
export async function createOffer(req, res) {
  try {
    const {
      empresaId,
      titulo,
      descripcion,
      requisitos,
      ubicacion,
      modalidad = "presencial",
      remuneracion
    } = req.body;

    if (!empresaId || !titulo || !descripcion) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const ofertaRef = await db.collection("ofertas").add({
      empresa_id: empresaId,
      titulo,
      descripcion,
      requisitos,
      ubicacion,
      modalidad,
      remuneracion,
      status: "Active",
      creada_en: new Date()
    });

    // actividad empresa
    await db.collection("actividad_empresa").add({
      empresa_id: empresaId,
      descripcion: `Nueva oferta publicada: ${titulo}`,
      tipo: "nueva_oferta",
      creada_en: new Date()
    });

    res.json({ success: true, message: "Oferta creada correctamente", ofertaId: ofertaRef.id });

  } catch (err) {
    console.error("ERROR createOffer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
