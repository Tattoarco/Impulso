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


router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM portfolios WHERE user_id = $1',
      [req.params.userId]
    );
    res.json({ portfolio: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener portafolio" });
  }
});


router.get("/:id", getPortfolioById);

module.exports = router;