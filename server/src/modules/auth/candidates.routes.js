// Agregar en auth.routes.js (o crear archivo separado)
// GET /api/auth/candidates — lista todos los candidatos con su nivel
// (solo para empresas autenticadas)

const express = require('express');
const router  = express.Router();
const pool    = require('../../db/pool');
const { verifyToken, soloEmpresa } = require('./auth.middleware');

router.get('/candidates', verifyToken, soloEmpresa, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.bio, u.carrera, u.universidad,
         u.habilidades, u.ciudad, u.linkedin, u.portafolio,
         u.nivel_impulso, u.puntos_totales, u.created_at,
         p.id AS portfolio_id,
         COUNT(DISTINCT a.id) AS proyectos_count
       FROM users u
       LEFT JOIN portfolios p ON p.user_id = u.id
       LEFT JOIN applications a ON a.candidate_id = u.id AND a.status = 'approved'
       WHERE u.role = 'candidato'
       GROUP BY u.id, p.id
       ORDER BY u.nivel_impulso DESC, u.created_at DESC`
    );
    res.json({ candidates: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener candidatos" });
  }
});

module.exports = router;