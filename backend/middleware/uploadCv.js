import multer from "multer";
import path from "path";
import fs from "fs";

const cvDir = "./uploads/cv";

if (!fs.existsSync(cvDir)) {
  fs.mkdirSync(cvDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cvDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cv-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only PDF is allowed"), false);
  }
  cb(null, true);
};

export const uploadCv = multer({ storage, fileFilter });
