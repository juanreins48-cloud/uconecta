// db.js — Firestore solamente (sin MySQL)
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// Evitar doble inicialización en desarrollo y producción
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

// Exportar Firestore y Auth
export const db = admin.firestore();
export const auth = admin.auth();
export const bucket = admin.storage().bucket();

// Para compatibilidad con importaciones antiguas
export default db;
