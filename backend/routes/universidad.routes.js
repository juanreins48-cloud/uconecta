// routes/universidad.routes.js
import { Router } from "express";
import {
  estudiantesPendientes,
  validarEstudiante,
  reportarEstudiante,
  getEmpresasPendientes,
  validarEmpresa,
  reportarEmpresa
} from "../controllers/universidad.controller.js";

import {
  getAllStudents,
  getAllCompanies,
  getAllOffers,
  getApplicationsDetail,
  getAcceptedApplications
} from "../controllers/universidadEstadisticas.controller.js";

const router = Router();

// Estudiantes
router.get("/estudiantes-pendientes", estudiantesPendientes);
router.post("/validar-estudiante", validarEstudiante);
router.post("/reportar-estudiante", reportarEstudiante);

// Empresas
router.get("/empresas-pendientes", getEmpresasPendientes);
router.post("/validar-empresa", validarEmpresa);
router.post("/reportar-empresa", reportarEmpresa);

// Estadísticas
router.get("/estadisticas/estudiantes", getAllStudents);
router.get("/estadisticas/empresas", getAllCompanies);
router.get("/estadisticas/ofertas", getAllOffers);
router.get("/estadisticas/aplicaciones", getApplicationsDetail);
router.get("/estadisticas/aceptados", getAcceptedApplications);

export default router;
