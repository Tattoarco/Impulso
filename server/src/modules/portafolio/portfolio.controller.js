const pool = require("../../db/pool");

/* ── GET /api/portfolio/me ─────────────────────────── */
async function getMyPortfolio(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM portfolios WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ portfolio: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener portafolio" });
  }
}

/* ── POST /api/portfolio ────────────────────────────── */
async function savePortfolio(req, res) {
  const {
    name, role, description, bg_color, avatar,
    skills, links, customprojects,
  } = req.body;

  try {
    // Upsert — crea o actualiza
    const result = await pool.query(
      `INSERT INTO portfolios (user_id, name, role, description, bg_color, avatar, skills, links, customprojects, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         name           = EXCLUDED.name,
         role           = EXCLUDED.role,
         description    = EXCLUDED.description,
         bg_color       = EXCLUDED.bg_color,
         avatar         = EXCLUDED.avatar,
         skills         = EXCLUDED.skills,
         links          = EXCLUDED.links,
         customprojects = EXCLUDED.customprojects,
         updated_at     = NOW()
       RETURNING *`,
      [
        req.user.id, name, role, description, bg_color || "#F26419", avatar,
        JSON.stringify(skills || []),
        JSON.stringify(links  || []),
        JSON.stringify(customprojects || []),
      ]
    );
    res.json({ portfolio: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar portafolio" });
  }
}

/* ── GET /api/portfolio/:id ─────────────────────────── */
async function getPortfolioById(req, res) {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as user_name, u.email
       FROM portfolios p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Portafolio no encontrado" });
    res.json({ portfolio: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener portafolio" });
  }
}

/* ── GET /api/portfolio/me/jobs ─────────────────────── */
async function getMyRealJobs(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         a.id, a.status, a.created_at,
         j.title  AS job_title,
         j.summary, j.profile_area, j.duration,
         c.company_name,
         COUNT(s.id) AS steps_completed,
         COUNT(js.id) AS total_steps
       FROM applications a
       JOIN jobs j       ON j.id  = a.job_id
       JOIN companies c  ON c.id  = j.company_id
       LEFT JOIN submissions s  ON s.application_id = a.id
       LEFT JOIN job_steps  js  ON js.job_id = j.id
       WHERE a.candidate_id = $1
       GROUP BY a.id, j.title, j.summary, j.profile_area, j.duration, c.company_name`,
      [req.user.id]
    );
    res.json({ applications: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
}

module.exports = { getMyPortfolio, savePortfolio, getPortfolioById, getMyRealJobs };