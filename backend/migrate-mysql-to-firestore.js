// migrate-mysql-to-firestore.js
// Uso: node migrate-mysql-to-firestore.js
import mysql from "mysql2/promise";
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("FIREBASE_SERVICE_ACCOUNT missing in env");
  process.exit(1);
}
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined
});
const db = admin.firestore();

async function main() {
  const mysqlConn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
  });

  // Helper: write doc with the old id as doc id
  async function writeCollectionFromRows(collectionName, rows, idField = "id") {
    const batch = db.batch();
    rows.forEach(row => {
      const docRef = db.collection(collectionName).doc(String(row[idField]));
      const data = { ...row };
      // convert MySQL TIMESTAMP strings to Firestore Timestamps if present
      for (const k in data) {
        if (data[k] instanceof Date) continue;
        // if it's a mysql datetime string, you might convert, but keep as-is for now
      }
      batch.set(docRef, data);
    });
    await batch.commit();
    console.log(`Wrote ${rows.length} documents to ${collectionName}`);
  }

  try {
    // 1) usuarios
    const [usuarios] = await mysqlConn.query("SELECT * FROM usuarios");
    await writeCollectionFromRows("usuarios", usuarios);

    // 2) estudiantes
    const [estudiantes] = await mysqlConn.query("SELECT * FROM estudiantes");
    await writeCollectionFromRows("estudiantes", estudiantes);

    // 3) empresas
    const [empresas] = await mysqlConn.query("SELECT * FROM empresas");
    await writeCollectionFromRows("empresas", empresas);

    // 4) universidades
    const [universidades] = await mysqlConn.query("SELECT * FROM universidades");
    await writeCollectionFromRows("universidades", universidades);

    // 5) ofertas
    const [ofertas] = await mysqlConn.query("SELECT * FROM ofertas");
    await writeCollectionFromRows("ofertas", ofertas);

    // 6) aplicaciones
    const [aplicaciones] = await mysqlConn.query("SELECT * FROM aplicaciones");
    await writeCollectionFromRows("aplicaciones", aplicaciones);

    // 7) documentos -> guardar metadata en Firestore (files deben subirse a Storage manualmente)
    const [documentos] = await mysqlConn.query("SELECT * FROM documentos");
    await writeCollectionFromRows("documentos", documentos);

    // 8) cv_estudiantes and cv_detalles -> merge into collection 'cv'
    const [cv_estudiantes] = await mysqlConn.query("SELECT * FROM cv_estudiantes");
    for (const cv of cv_estudiantes) {
      const docRef = db.collection("cv").doc(String(cv.estudiante_id));
      await docRef.set({
        ...cv,
        estudianteId: cv.estudiante_id,
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
    const [cv_detalles] = await mysqlConn.query("SELECT * FROM cv_detalles");
    for (const cv of cv_detalles) {
      const docRef = db.collection("cv").doc(String(cv.estudiante_id));
      await docRef.set({
        ...cv,
        estudianteId: cv.estudiante_id,
        creadaEn: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    // 9) actividad_estudiante
    const [actividad_estudiante] = await mysqlConn.query("SELECT * FROM actividad_estudiante");
    await writeCollectionFromRows("actividad_estudiante", actividad_estudiante);

    // 10) vistas_perfil
    const [vistas] = await mysqlConn.query("SELECT * FROM vistas_perfil");
    await writeCollectionFromRows("vistas_perfil", vistas);

    // 11) actividad_empresa
    const [actividad_empresa] = await mysqlConn.query("SELECT * FROM actividad_empresa");
    await writeCollectionFromRows("actividad_empresa", actividad_empresa);

    // 12) notificaciones_estudiante
    const [not_est] = await mysqlConn.query("SELECT * FROM notificaciones_estudiante");
    await writeCollectionFromRows("notificaciones_estudiante", not_est);

    // 13) notificaciones_universidad
    const [not_uni] = await mysqlConn.query("SELECT * FROM notificaciones_universidad");
    await writeCollectionFromRows("notificaciones_universidad", not_uni);

    // 14) notificaciones_empresa
    const [not_emp] = await mysqlConn.query("SELECT * FROM notificaciones_empresa");
    await writeCollectionFromRows("notificaciones_empresa", not_emp);

    // 15) soporte
    const [soporte] = await mysqlConn.query("SELECT * FROM soporte");
    await writeCollectionFromRows("soporte", soporte);

    console.log("Migración completa (meta). Revisa Storage y CVs por separado.");
  } catch (err) {
    console.error("Error durante migración:", err);
  } finally {
    await mysqlConn.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
