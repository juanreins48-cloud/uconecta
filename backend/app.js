// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// No más MySQL
// ❌ import pool from "./db.js";

// Middlewares
import { errorHandler } from './middleware/errorHandler.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import filesRoutes from './routes/files.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import ofertasRoutes from "./routes/ofertas.routes.js";
import aplicacionesRoutes from "./routes/aplicaciones.routes.js";
import cvRoutes from "./routes/cv.routes.js";
import cvViewRoutes from "./routes/cv.view.routes.js";
import companyRoutes from "./routes/company.js";
import empresaRoutes from "./routes/empresa.routes.js";
import solicitudesRoutes from "./routes/solicitudes.routes.js";
import notificacionesRoutes from "./routes/notificaciones.routes.js";
import universidadRoutes from "./routes/universidad.routes.js";
import universidadEstadisticasRoutes from "./routes/universidadEstadisticas.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import soporteRoutes from "./routes/soporte.routes.js";

// Ya no se usa: test-db MySQL
// ❌ import testDB from "./routes/testdb.js";


const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/ofertas", ofertasRoutes);
app.use("/api/aplicaciones", aplicacionesRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/cv/view", cvViewRoutes);

// Empresa
app.use("/api/dashboard/empresa", companyRoutes);
app.use("/api/empresa", empresaRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/empresa", solicitudesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);

// Universidad
app.use("/api/universidad", universidadRoutes);
app.use("/api/universidad", universidadEstadisticasRoutes);

// Usuarios
app.use("/api/usuario", usuarioRoutes);
app.use("/api/soporte", soporteRoutes);

// Archivos estáticos (aunque ya no uses PDFs)
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

// Error handler
app.use(errorHandler);

// Esto ya no sirve porque usaba MySQL
// ❌ app.get("/test-db", ... );

app.listen(PORT, () => {
  console.log(`🔥 Server listening on port ${PORT} (FIRESTORE MODE)`);
});
