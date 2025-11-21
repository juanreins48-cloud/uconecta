// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { errorHandler } from './middleware/errorHandler.js';
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


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/ofertas", ofertasRoutes);
app.use("/api/aplicaciones", aplicacionesRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/cv/view", cvViewRoutes);

// Rutas empresa
app.use("/api/dashboard/empresa", companyRoutes);
app.use("/api/empresa", empresaRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/empresa", solicitudesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
//app.use("/api/notificaciones-legacy", notificacionesLegacyRoutes); // el viejo

// Rutas universidad
app.use("/api/universidad", universidadRoutes);
app.use("/api/universidad", universidadEstadisticasRoutes);

// Rutas usuarios
app.use("/api/usuario", usuarioRoutes);
app.use("/api/soporte", soporteRoutes);


// Archivos estáticos
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
