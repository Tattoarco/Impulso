// server/src/modules/submissions/submissions.routes.js
// AGREGA estas rutas a las existentes

const express = require("express");
const router = express.Router();
const { verifyToken, soloEmpresa, soloCandidato } = require("../auth/auth.middleware");
const pool = require("../../db/pool");

// ── Feedback final del proyecto (empresa → candidato) ────────
router.post("/project-feedback/:applicationId", verifyToken, soloEmpresa, async (req, res) => {
  const { applicationId } = req.params;
  const { feedback_text, score_calidad, score_puntualidad, score_comunicacion, score_creatividad } = req.body;
  try {
    // Verificar que sea empresa dueña del job
    const check = await pool.query(
      `SELECT a.id FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.id = $1 AND c.user_id = $2`,
      [applicationId, req.user.id],
    );
    if (check.rows.length === 0) return res.status(403).json({ error: "No autorizado" });

    // Upsert feedback
    const result = await pool.query(
      `INSERT INTO project_feedback
         (application_id, company_id, feedback_text, score_calidad, score_puntualidad, score_comunicacion, score_creatividad)
       SELECT $1, c.id, $2, $3, $4, $5, $6
       FROM companies c WHERE c.user_id = $7
       ON CONFLICT (application_id) DO UPDATE SET
         feedback_text = EXCLUDED.feedback_text,
         score_calidad = EXCLUDED.score_calidad,
         score_puntualidad = EXCLUDED.score_puntualidad,
         score_comunicacion = EXCLUDED.score_comunicacion,
         score_creatividad = EXCLUDED.score_creatividad
       RETURNING *`,
      [applicationId, feedback_text, score_calidad, score_puntualidad, score_comunicacion, score_creatividad, req.user.id],
    );

    // Recalcular nivel del candidato
    const candidateQ = await pool.query(`SELECT a.candidate_id FROM applications a WHERE a.id = $1`, [applicationId]);
    const candidateId = candidateQ.rows[0]?.candidate_id;
    if (candidateId) await recalcularNivel(candidateId);

    res.json({ feedback: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar feedback" });
  }
});

// ── GET feedback final de una application ────────────────────
router.get("/project-feedback/:applicationId", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pf.*, c.company_name
       FROM project_feedback pf
       JOIN companies c ON c.id = pf.company_id
       WHERE pf.application_id = $1`,
      [req.params.applicationId],
    );
    res.json({ feedback: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener feedback" });
  }
});

// ── Recalcular nivel (función interna) ───────────────────────
async function recalcularNivel(candidateId) {
  const result = await pool.query(
    `SELECT AVG(pf.score_total) as promedio
     FROM project_feedback pf
     JOIN applications a ON a.id = pf.application_id
     WHERE a.candidate_id = $1 AND pf.score_total IS NOT NULL`,
    [candidateId],
  );
  const promedio = parseFloat(result.rows[0]?.promedio) || 0;
  // Nivel del 1 al 10 basado en el promedio de scores (que son del 1 al 10)
  const nivel = Math.min(10, Math.max(1, Math.round(promedio)));
  const puntos = Math.round(promedio * 10); // 0-100 puntos
  await pool.query(`UPDATE users SET nivel_impulso = $1, puntos_totales = $2 WHERE id = $3`, [nivel, puntos, candidateId]);
}

module.exports = router;
