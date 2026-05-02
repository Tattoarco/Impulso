const express = require("express");
const router = express.Router();
const { applyToJob, getApplicants, getMyApplications, updateApplicationStatus, submitStep, getSubmissions, giveFeedback } = require("./submissions.controller");

const { verifyToken, soloEmpresa, soloCandidato } = require("../auth/auth.middleware");

// ── REGLA: rutas específicas SIEMPRE antes de /:id ────────────
// "mine" debe registrarse antes de /:id o Express lo captura como parámetro

// Candidato ve sus postulaciones (/mine antes que /:id)
router.get("/applications/mine", verifyToken, soloCandidato, getMyApplications);

// Empresa ve postulantes de un job
router.get("/applications", verifyToken, soloEmpresa, getApplicants);

// Candidato se postula
router.post("/applications", verifyToken, soloCandidato, applyToJob);

// Empresa aprueba o rechaza
router.patch("/applications/:id/status", verifyToken, soloEmpresa, updateApplicationStatus);

// Candidato envía entrega de una etapa
router.post("/submissions", verifyToken, soloCandidato, submitStep);

// Ver etapas + entregas de una postulación
router.get("/submissions/:application_id", verifyToken, getSubmissions);

// Empresa da feedback
router.post("/submissions/:submission_id/feedback", verifyToken, soloEmpresa, giveFeedback);

const { sendMessage, getMessages } = require("./messages.controller");

// Mensajería por etapa
router.post("/messages", verifyToken, sendMessage);
router.get("/messages/:application_id/:step_id", verifyToken, getMessages);

module.exports = router;
