const express = require("express");
const router = express.Router();

const {
  getMyPortfolio,
  savePortfolio,
  getPortfolioById,
  getMyRealJobs,
} = require("../controllers/portfolio.controller");

const auth = require("../auth/auth.middleware");

// 🔒 privados
router.get("/me", auth, getMyPortfolio);
router.post("/", auth, savePortfolio);
router.get("/me/jobs", auth, getMyRealJobs);

// 🔥 trabajos reales (CLAVE)
router.get("/me/jobs", auth, getMyRealJobs);

// 🌍 público
router.get("/:id", auth, getPortfolioById);

module.exports = router;