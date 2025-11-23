// controllers/auth.controller.js
import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
export async function register(req, res) {
  try {
    const { role, name, email, password } = req.body;

    if (!role || !name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const rolesMap = {
      Student: "estudiante",
      Company: "empresa",
      University: "universidad",
    };

    const rol = rolesMap[role];
    if (!rol) return res.status(400).json({ message: "Invalid role" });

    // 1️⃣ Validar email único
    const existing = await db
      .collection("usuarios")
      .where("email", "==", email)
      .get();

    if (!existing.empty)
      return res
        .status(400)
        .json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    // 2️⃣ Crear usuario
    const userRef = await db.collection("usuarios").add({
      nombre: name,
      email,
      password: hashed,
      rol,
      created_at: new Date(),
    });

    const userId = userRef.id;

    // 3️⃣ Crear subtabla según rol
    if (rol === "estudiante") {
      await db.collection("estudiantes").add({
        usuario_id: userId,
        validado: false,
      });
    }

    if (rol === "empresa") {
      await db.collection("empresas").add({
        usuario_id: userId,
        nombre_empresa: "",
        validado: false,
      });
    }

    if (rol === "universidad") {
      await db.collection("universidades").add({
        usuario_id: userId,
        nombre_universidad: "",
      });
    }

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// LOGIN
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    // 1️⃣ Buscar usuario
    const snapshot = await db
      .collection("usuarios")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    // 2️⃣ Validar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 3️⃣ Crear token
    const token = jwt.sign(
      { id: user.id, role: user.rol },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    // 4️⃣ Obtener IDs por rol
    let studentId = null;
    let empresaId = null;

    if (user.rol === "estudiante") {
      const s = await db
        .collection("estudiantes")
        .where("usuario_id", "==", user.id)
        .limit(1)
        .get();
      if (!s.empty) studentId = s.docs[0].id;
    }

    if (user.rol === "empresa") {
      const e = await db
        .collection("empresas")
        .where("usuario_id", "==", user.id)
        .limit(1)
        .get();
      if (!e.empty) empresaId = e.docs[0].id;
    }

    return res.json({
      success: true,
      message: "Login successful",
      token,
      userId: user.id,
      role: user.rol,
      studentId,
      empresaId,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
