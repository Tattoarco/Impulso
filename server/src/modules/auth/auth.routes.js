const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile, getCandidateProfile } = require("./auth.controller");
const { verifyToken, soloEmpresa, soloCandidato } = require("./auth.middleware");

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Rutas privadas (requieren token)
router.get("/empresa", verifyToken, soloEmpresa, getMe);
router.get("/empresa/crear-proyecto", verifyToken, soloEmpresa, getMe);
router.get("/candidato", verifyToken, soloCandidato, getMe);
router.get("/candidato/:id", verifyToken, soloEmpresa, getCandidateProfile);



router.put("/me/profile", verifyToken, updateProfile)

module.exports = router;
