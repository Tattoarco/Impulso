const express = require("express");
const router = express.Router();
const multer = require("multer");

const { applyToJob, getApplicants, getMyApplications, updateApplicationStatus, submitStep, getSubmissions, giveFeedback } = require("./submissions.controller");

const { verifyToken, soloEmpresa, soloCandidato } = require("../auth/auth.middleware");

// Multer en memoria — solo para parsear multipart/form-data
// No guarda archivos en disco, los nombres se adjuntan al texto
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB por archivo
});

// ── Applications ─────────────────────────────────────────────────────────
// "mine" SIEMPRE antes de /:id
router.get("/applications/mine", verifyToken, soloCandidato, getMyApplications);
router.get("/applications", verifyToken, soloEmpresa, getApplicants);
router.post("/applications", verifyToken, soloCandidato, applyToJob);
router.patch("/applications/:id/status", verifyToken, soloEmpresa, updateApplicationStatus);

// ── Submissions ───────────────────────────────────────────────────────────
// upload.array("files") parsea multipart Y JSON (si no hay archivos pasa igual)
router.post("/submissions", verifyToken, soloCandidato, upload.array("files", 10), submitStep);
router.get("/submissions/:application_id", verifyToken, getSubmissions);
router.post("/submissions/:submission_id/feedback", verifyToken, soloEmpresa, giveFeedback);

// ── Mensajería ────────────────────────────────────────────────────────────
const { sendMessage, getMessages } = require("./messages.controller");
router.post("/messages", verifyToken, sendMessage);
router.get("/messages/:application_id/:step_id", verifyToken, getMessages);

module.exports = router;
