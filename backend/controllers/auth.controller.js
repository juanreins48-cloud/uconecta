// controllers/auth.controller.js
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
export async function register(req, res) {
  try {
    console.log("REQ BODY:", req.body); // DEBUG

    const { role, name, email, password } = req.body;

    if (!role || !name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Conversión roles frontend → backend
    const rolesMap = {
      "Student": "estudiante",
      "Company": "empresa",
      "University": "universidad",
    };

    const rol = rolesMap[role];
    if (!rol) return res.status(400).json({ message: "Invalid role" });

    // Encriptar contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Insertar en usuarios
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [name, email, hashed, rol]
    );

    const userId = result.insertId;

    // Insertar tabla por rol
    if (rol === "estudiante") {
      await pool.query(
        "INSERT INTO estudiantes (usuario_id) VALUES (?)",
        [userId]
      );
    }

    if (rol === "empresa") {
      await pool.query(
        "INSERT INTO empresas (usuario_id, nombre_empresa) VALUES (?, '')",
        [userId]
      );
    }

    if (rol === "universidad") {
      await pool.query(
        "INSERT INTO universidades (usuario_id) VALUES (?)",
        [userId]
      );
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

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    // Buscar usuario por email
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    // Validar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Crear token
    const token = jwt.sign(
      { id: user.id, role: user.rol },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    // ================
    // OBTENER studentId
    // ================
    let studentId = null;
    let empresaId = null;

    if (user.rol === "estudiante") {
      const [studentRows] = await pool.query(
        "SELECT id FROM estudiantes WHERE usuario_id = ?",
        [user.id]
      );

      if (studentRows.length > 0) {
        studentId = studentRows[0].id;
      }
    }

    if (user.rol === "empresa") {
  const [companyRows] = await pool.query(
    "SELECT id FROM empresas WHERE usuario_id = ?",
    [user.id]
  );
  if (companyRows.length > 0) empresaId = companyRows[0].id;
}

    // ================
    // RESPUESTA FINAL
    // ================
    return res.json({
      success: true,
      message: "Login successful",
      token,
      userId: user.id,
      role: user.rol,
      studentId,
      empresaId
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

