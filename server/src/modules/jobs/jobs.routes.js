const express = require("express");
const router = express.Router();
const { generateWithAI, createJob, getMyJobs, getAllJobs, getJobById, updateJobStatus } = require("./jobs.controller");

const { verifyToken, soloEmpresa } = require("../auth/auth.middleware");

// ── Rutas privadas — solo empresa ─────────────────────────────
router.get("/mine", verifyToken, soloEmpresa, getMyJobs); // mis proyectos
router.post("/generate", verifyToken, soloEmpresa, generateWithAI); // generar con IA
router.post("/", verifyToken, soloEmpresa, createJob); // crear y guardar
router.patch("/:id/status", verifyToken, soloEmpresa, updateJobStatus); // cambiar estado

// ── Rutas públicas ────────────────────────────────────────────
router.get("/", getAllJobs); // listado de ofertas publicadas (para candidatos)
router.get("/:id", getJobById); // detalle de una oferta
module.exports = router;
