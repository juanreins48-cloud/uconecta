import { db } from "../db.js";

// =============================
// 1. Listado de estudiantes
// =============================
export const getAllStudents = async (req, res) => {
  try {
    const studentsSnap = await getDocs(collection(db, "estudiantes"));
    const vistasSnap = await getDocs(collection(db, "vistas_perfil"));
    const aplicacionesSnap = await getDocs(collection(db, "aplicaciones"));
    const usersSnap = await getDocs(collection(db, "usuarios"));

    const users = {};
    usersSnap.forEach((u) => (users[u.id] = u.data()));

    const vistasCount = {};
    vistasSnap.forEach((v) => {
      const id = v.data().estudiante_id;
      vistasCount[id] = (vistasCount[id] || 0) + 1;
    });

    const appsCount = {};
    aplicacionesSnap.forEach((a) => {
      const id = a.data().estudiante_id;
      appsCount[id] = (appsCount[id] || 0) + 1;
    });

    const result = studentsSnap.docs.map((s) => ({
      estudiante_id: s.id,
      nombre: users[s.data().usuario_id]?.nombre || "",
      email: users[s.data().usuario_id]?.email || "",
      created_at: users[s.data().usuario_id]?.created_at || "",
      validado: s.data().validado,
      aplicaciones: appsCount[s.id] || 0,
      vistas_perfil: vistasCount[s.id] || 0,
    }));

    res.json({ success: true, estudiantes: result });

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
    const empresasSnap = await getDocs(collection(db, "empresas"));
    const ofertasSnap = await getDocs(collection(db, "ofertas"));
    const aplicacionesSnap = await getDocs(collection(db, "aplicaciones"));
    const usersSnap = await getDocs(collection(db, "usuarios"));

    const users = {};
    usersSnap.forEach((u) => (users[u.id] = u.data()));

    const ofertasCount = {};
    ofertasSnap.forEach((o) => {
      const id = o.data().empresa_id;
      ofertasCount[id] = (ofertasCount[id] || 0) + 1;
    });

    const postulaciones = {};
    aplicacionesSnap.forEach((a) => {
      const oferta = ofertasSnap.docs.find((o) => o.id === a.data().oferta_id);
      if (!oferta) return;
      const empresa = oferta.data().empresa_id;
      postulaciones[empresa] = (postulaciones[empresa] || 0) + 1;
    });

    const result = empresasSnap.docs.map((e) => {
      const data = e.data();
      return {
        empresa_id: e.id,
        nombre_usuario: users[data.usuario_id]?.nombre || "",
        email: users[data.usuario_id]?.email || "",
        nombre_empresa: data.nombre_empresa,
        validado: data.validado,
        total_ofertas: ofertasCount[e.id] || 0,
        total_postulaciones: postulaciones[e.id] || 0,
      };
    });

    res.json({ success: true, empresas: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// =============================
// 3. Ofertas
// =============================
export const getAllOffers = async (req, res) => {
  try {
    const offersSnap = await getDocs(collection(db, "ofertas"));
    const empresasSnap = await getDocs(collection(db, "empresas"));

    const empresas = {};
    empresasSnap.forEach((e) => (empresas[e.id] = e.data()));

    const ofertas = offersSnap.docs.map((o) => ({
      oferta_id: o.id,
      titulo: o.data().titulo,
      descripcion: o.data().descripcion,
      status: o.data().status,
      creada_en: o.data().creada_en,
      nombre_empresa: empresas[o.data().empresa_id]?.nombre_empresa || "",
    }));

    res.json({ success: true, ofertas });

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
    const appsSnap = await getDocs(collection(db, "aplicaciones"));
    const usersSnap = await getDocs(collection(db, "usuarios"));
    const studentsSnap = await getDocs(collection(db, "estudiantes"));
    const offersSnap = await getDocs(collection(db, "ofertas"));
    const empresasSnap = await getDocs(collection(db, "empresas"));

    const users = {};
    usersSnap.forEach((u) => (users[u.id] = u.data()));

    const students = {};
    studentsSnap.forEach((s) => (students[s.id] = s.data()));

    const offers = {};
    offersSnap.forEach((o) => (offers[o.id] = o.data()));

    const empresas = {};
    empresasSnap.forEach((e) => (empresas[e.id] = e.data()));

    const aplicaciones = appsSnap.docs.map((a) => {
      const data = a.data();
      const oferta = offers[data.oferta_id];
      const empresa = empresas[oferta?.empresa_id];

      return {
        aplicacion_id: a.id,
        estado: data.estado,
        creada_en: data.creada_en,
        estudiante_nombre: users[students[data.estudiante_id]?.usuario_id]?.nombre || "",
        estudiante_email: users[students[data.estudiante_id]?.usuario_id]?.email || "",
        oferta: oferta?.titulo || "",
        empresa: users[empresa?.usuario_id]?.nombre || "",
      };
    });

    res.json({ success: true, aplicaciones });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// =============================
// 5. Aceptados
// =============================
export const getAcceptedApplications = async (req, res) => {
  try {
    const appsSnap = await getDocs(
      query(collection(db, "aplicaciones"), where("estado", "==", "aceptado"))
    );

    const usersSnap = await getDocs(collection(db, "usuarios"));
    const studentsSnap = await getDocs(collection(db, "estudiantes"));
    const offersSnap = await getDocs(collection(db, "ofertas"));
    const empresasSnap = await getDocs(collection(db, "empresas"));

    const users = {};
    usersSnap.forEach((u) => (users[u.id] = u.data()));
    const students = {};
    studentsSnap.forEach((s) => (students[s.id] = s.data()));
    const ofertas = {};
    offersSnap.forEach((o) => (ofertas[o.id] = o.data()));
    const empresas = {};
    empresasSnap.forEach((e) => (empresas[e.id] = e.data()));

    const aceptados = appsSnap.docs.map((a) => {
      const data = a.data();
      const oferta = ofertas[data.oferta_id];
      const empresa = empresas[oferta?.empresa_id];

      return {
        aplicacion_id: a.id,
        oferta: oferta?.titulo,
        empresa: users[empresa?.usuario_id]?.nombre || "",
        estudiante: users[students[data.estudiante_id]?.usuario_id]?.nombre || "",
        creada_en: data.creada_en,
      };
    });

    res.json({ success: true, aceptados });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ===============================================
// 6. TODAS LAS ESTADÍSTICAS
// ===============================================
export const getUniversityStatistics = async (req, res) => {
  try {
    const [studentsSnap, companiesSnap, offersSnap, appsSnap] = await Promise.all([
      getDocs(collection(db, "estudiantes")),
      getDocs(collection(db, "empresas")),
      getDocs(collection(db, "ofertas")),
      getDocs(collection(db, "aplicaciones")),
    ]);

    res.json({
      success: true,
      data: {
        students: studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        companies: companiesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        offers: offersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        applications: appsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        accepted: appsSnap.docs
          .filter((d) => d.data().estado === "aceptado")
          .map((d) => ({ id: d.id, ...d.data() })),
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
