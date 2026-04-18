const express = require("express");
const router  = express.Router();
const {
  getMyPortfolio,
  savePortfolio,
  getPortfolioById,
  getMyRealJobs,
} = require("./portfolio.controller");
const { verifyToken } = require("../auth/auth.middleware");

// Privadas
router.get("/me",      verifyToken, getMyPortfolio);
router.post("/",       verifyToken, savePortfolio);
router.get("/me/jobs", verifyToken, getMyRealJobs);

// Pública — debe ir al final porque /:id captura todo
router.get("/:id", getPortfolioById);

module.exports = router;