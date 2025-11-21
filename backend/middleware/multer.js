// middleware/multer.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`;
    cb(null, name);
  }
});

export const upload = multer({ storage });
