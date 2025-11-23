// middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, error: "Token faltante" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;  // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Token inválido" });
  }
}
