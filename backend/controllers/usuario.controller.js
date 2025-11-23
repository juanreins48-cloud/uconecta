import { db } from "../firebase.js";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import bcrypt from "bcrypt";

// GET /api/usuario/me
export const getMyAccount = async (req, res) => {
  try {
    const userId = req.user?.id;

    const userRef = doc(db, "usuarios", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const usuario = userSnap.data();
    let accountInfo = {
      id: userId,
      name: usuario.nombre,
      email: usuario.email,
      role: usuario.rol,
    };

    if (usuario.rol === "estudiante") {
      const q = query(collection(db, "estudiantes"), where("usuario_id", "==", userId));
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        accountInfo = {
          ...accountInfo,
          estudiante_id: docSnap.id,
          validado: docSnap.data().validado,
          joined: usuario.created_at,
        };
      });
    }

    if (usuario.rol === "empresa") {
      const q = query(collection(db, "empresas"), where("usuario_id", "==", userId));
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        accountInfo = {
          ...accountInfo,
          empresa_id: docSnap.id,
          nombre_empresa: docSnap.data().nombre_empresa,
          validado: docSnap.data().validado,
          joined: usuario.created_at,
        };
      });
    }

    if (usuario.rol === "universidad") {
      const q = query(collection(db, "universidades"), where("usuario_id", "==", userId));
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        accountInfo = {
          ...accountInfo,
          universidad_id: docSnap.id,
          nombre_universidad: docSnap.data().nombre_universidad,
          joined: usuario.created_at,
        };
      });
    }

    res.json({ success: true, user: accountInfo });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// PATCH /api/usuario/update/:id
export const updateMyAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { email, password } = req.body;

    if (id !== userId) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const updates = {};

    if (email) updates.email = email;

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "Nada que actualizar" });
    }

    await updateDoc(doc(db, "usuarios", id), updates);

    res.json({ success: true, message: "Cuenta actualizada correctamente" });

  } catch (err) {
    console.error("Error updating account:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};
