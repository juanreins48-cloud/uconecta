import pool from "../db.js";
import bcrypt from "bcrypt";

// GET /api/usuario/me
export const getMyAccount = async (req, res) => {
  try {
    // 🔹 Obtenemos el usuario logueado por su ID (supongamos que lo guardas en el token o en la sesión)
    const userId = req.user?.id; // Debes establecerlo desde tu middleware de autenticación

    // 🔹 Primero obtenemos los datos generales de usuario
    const [usuarios] = await pool.query(
      "SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?",
      [userId]
    );

    if (!usuarios.length) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const usuario = usuarios[0];
    let accountInfo = { id: usuario.id, name: usuario.nombre, email: usuario.email, role: usuario.rol };

    // 🔹 Según el rol, agregamos info adicional
    if (usuario.rol === "estudiante") {
      const [estudiantes] = await pool.query(
        "SELECT id AS estudiante_id, validado FROM estudiantes WHERE usuario_id = ?",
        [usuario.id]
      );
      if (estudiantes.length) {
        accountInfo = { ...accountInfo, joined: usuario.created_at, validado: estudiantes[0].validado };
      }
    } else if (usuario.rol === "empresa") {
      const [empresas] = await pool.query(
        "SELECT id AS empresa_id, nombre_empresa, validado FROM empresas WHERE usuario_id = ?",
        [usuario.id]
      );
      if (empresas.length) {
        accountInfo = { ...accountInfo, joined: usuario.created_at, nombre_empresa: empresas[0].nombre_empresa, validado: empresas[0].validado };
      }
    } else if (usuario.rol === "universidad") {
      const [universidades] = await pool.query(
        "SELECT id AS universidad_id, nombre_universidad FROM universidades WHERE usuario_id = ?",
        [usuario.id]
      );
      if (universidades.length) {
        accountInfo = { ...accountInfo, joined: usuario.created_at, nombre_universidad: universidades[0].nombre_universidad };
      }
    }

    res.json({ success: true, user: accountInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/// PATCH /api/usuario/update/:id
export const updateMyAccount = async (req, res) => {
  try {
    const { id } = req.params; // id del usuario a actualizar
    const userId = req.user.id || req.userId; // desde JWT middleware
    const { email, password, notifications } = req.body;

    // 🔹 Verificamos que el usuario solo pueda actualizar su propia cuenta
    if (parseInt(id) !== userId) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    // 🔹 Construimos la query de actualización dinámicamente
    const fields = [];
    const values = [];

    if (email) {
      fields.push("email = ?");
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No hay datos para actualizar" });
    }

    values.push(id); // para WHERE id=?

    const sql = `UPDATE usuarios SET ${fields.join(", ")} WHERE id = ?`;

    await pool.query(sql, values);

    return res.json({ success: true, message: "Cuenta actualizada correctamente" });
  } catch (err) {
    console.error("Error updating account:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};