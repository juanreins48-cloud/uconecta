// controllers/files.controller.js
import pool from '../db.js';

export async function uploadFile(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const { originalname, filename, mimetype, size, path } = req.file;
    const uploaded_by = req.user?.id || null;
    const [result] = await pool.query(
      'INSERT INTO files (original_name, filename, mime_type, size, path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [originalname, filename, mimetype, size, path, uploaded_by]
    );
    res.status(201).json({ id: result.insertId, originalname, filename });
  } catch (err) {
    next(err);
  }
}

export async function listFiles(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, original_name, filename, mime_type, size, uploaded_at, uploaded_by FROM files ORDER BY uploaded_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function serveFile(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    const file = rows[0];
    res.sendFile(file.path, { root: '.' }); // path guard: asegurarse que sea seguro
  } catch (err) {
    next(err);
  }
}
