const pool = require("../../db/pool");

// Candidato se postula a una oferta
async function applyToJob(req, res) {
  const { job_id } = req.body;
  const candidateId = req.user.id;

  if (!job_id) {
    return res.status(400).json({ error: "El ID del proyecto es obligatorio." });
  }

  try {
    const jobResult = await pool.query(`SELECT id, status FROM jobs WHERE id = $1`, [job_id]);

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado." });
    }
    if (jobResult.rows[0].status !== "published") {
      return res.status(400).json({ error: "Este proyecto no está disponible." });
    }

    const existing = await pool.query(`SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2`, [job_id, candidateId]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Ya te postulaste a este proyecto." });
    }

    const result = await pool.query(
      `INSERT INTO applications (job_id, candidate_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [job_id, candidateId],
    );

    res.status(201).json({
      message: "Postulación enviada. La empresa revisará tu perfil.",
      application: result.rows[0],
    });
  } catch (err) {
    console.error("Error en applyToJob:", err.message);
    res.status(500).json({ error: "Error al enviar la postulación." });
  }
}

// Empresa ve todos los postulantes de un proyecto
async function getApplicants(req, res) {
  const { job_id } = req.query;
  const userId = req.user.id;

  if (!job_id) {
    return res.status(400).json({ error: "job_id es obligatorio." });
  }

  try {
    const ownerCheck = await pool.query(
      `SELECT j.id FROM jobs j
       JOIN companies c ON c.id = j.company_id
       WHERE j.id = $1 AND c.user_id = $2`,
      [job_id, userId],
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: "No tienes permisos para ver este proyecto." });
    }

    const result = await pool.query(
      `SELECT
         a.id,
         a.status,
         a.created_at,

         -- Identificación del candidato
         u.id              AS candidate_id,
         u.name            AS candidate_name,
         u.email           AS candidate_email,

         -- Campos del perfil (hoja de vida)
         u.bio,
         u.universidad,
         u.carrera,
         u.año_graduacion,
         u.habilidades,
         u.linkedin,
         u.portafolio,
         u.ciudad,
         u.nivel_impulso,
         u.puntos_totales,

         -- Progreso en el proyecto
         COUNT(s.id)                                             AS steps_completed,
         (SELECT COUNT(*) FROM job_steps WHERE job_id = $1)     AS total_steps

       FROM applications a
       JOIN users u ON u.id = a.candidate_id
       LEFT JOIN submissions s ON s.application_id = a.id
       WHERE a.job_id = $1
       GROUP BY
         a.id,
         u.id, u.name, u.email,
         u.bio, u.universidad, u.carrera, u.año_graduacion,
         u.habilidades, u.linkedin, u.portafolio, u.ciudad,
         u.nivel_impulso, u.puntos_totales
       ORDER BY a.created_at DESC`,
      [job_id],
    );

    res.json({ applicants: result.rows });
  } catch (err) {
    console.error("Error en getApplicants:", err.message);
    res.status(500).json({ error: "Error al obtener postulantes." });
  }
}

// Candidato ve sus propias postulaciones
async function getMyApplications(req, res) {
  const candidateId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 
         a.id, a.status, a.created_at,
         j.id AS job_id,
         j.title, j.summary, j.duration, j.profile_area,
         c.company_name,
         COUNT(s.id) AS steps_completed,
         (SELECT COUNT(*) FROM job_steps WHERE job_id = j.id) AS total_steps
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       LEFT JOIN submissions s ON s.application_id = a.id
       WHERE a.candidate_id = $1
       GROUP BY a.id, j.id, c.company_name
       ORDER BY a.created_at DESC`,
      [candidateId],
    );

    res.json({ applications: result.rows });
  } catch (err) {
    console.error("Error en getMyApplications:", err.message);
    res.status(500).json({ error: "Error al obtener tus postulaciones." });
  }
}

// Empresa aprueba o rechaza un candidato
async function updateApplicationStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido. Usa "approved" o "rejected".' });
  }

  try {
    const ownerCheck = await pool.query(
      `SELECT a.id FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.id = $1 AND c.user_id = $2`,
      [id, userId],
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: "No tienes permisos para esta acción." });
    }

    const result = await pool.query(`UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`, [status, id]);

    res.json({
      message: status === "approved" ? "Candidato aprobado." : "Candidato rechazado.",
      application: result.rows[0],
    });
  } catch (err) {
    console.error("Error en updateApplicationStatus:", err.message);
    res.status(500).json({ error: "Error al actualizar el estado." });
  }
}

// ══════════════════════════════════════════════
//  SUBMISSIONS — Entregas por etapa
// ══════════════════════════════════════════════

async function submitStep(req, res) {
  const { application_id, step_id, answer_text } = req.body;
  const candidateId = req.user.id;

  if (!application_id || !step_id || !answer_text?.trim()) {
    return res.status(400).json({ error: "application_id, step_id y answer_text son obligatorios." });
  }

  try {
    const appCheck = await pool.query(
      `SELECT a.id, a.status FROM applications a
       WHERE a.id = $1 AND a.candidate_id = $2`,
      [application_id, candidateId],
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({ error: "Postulación no encontrada." });
    }
    if (appCheck.rows[0].status !== "approved") {
      return res.status(403).json({ error: "Tu postulación aún no ha sido aprobada." });
    }

    const existing = await pool.query(`SELECT id FROM submissions WHERE application_id = $1 AND step_id = $2`, [application_id, step_id]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Ya enviaste una respuesta para esta etapa." });
    }

    const stepOrder = await pool.query(`SELECT step_order, job_id FROM job_steps WHERE id = $1`, [step_id]);

    if (stepOrder.rows.length === 0) {
      return res.status(404).json({ error: "Etapa no encontrada." });
    }

    const currentOrder = stepOrder.rows[0].step_order;

    if (currentOrder > 1) {
      const prevStepResult = await pool.query(
        `SELECT js.id FROM job_steps js
         WHERE js.job_id = $1 AND js.step_order = $2`,
        [stepOrder.rows[0].job_id, currentOrder - 1],
      );

      if (prevStepResult.rows.length > 0) {
        const prevDone = await pool.query(
          `SELECT id FROM submissions
           WHERE application_id = $1 AND step_id = $2`,
          [application_id, prevStepResult.rows[0].id],
        );

        if (prevDone.rows.length === 0) {
          return res.status(400).json({ error: "Debes completar la etapa anterior primero." });
        }
      }
    }

    const result = await pool.query(
      `INSERT INTO submissions (application_id, step_id, answer_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [application_id, step_id, answer_text.trim()],
    );

    res.status(201).json({
      message: "Entrega enviada correctamente.",
      submission: result.rows[0],
    });
  } catch (err) {
    console.error("Error en submitStep:", err.message);
    res.status(500).json({ error: "Error al enviar la entrega." });
  }
}

async function getSubmissions(req, res) {
  const { application_id } = req.params;
  const userId = req.user.id;

  try {
    const accessCheck = await pool.query(
      `SELECT a.id FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.id = $1
         AND (a.candidate_id = $2 OR c.user_id = $2)`,
      [application_id, userId],
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: "No tienes acceso a estas entregas." });
    }

    const result = await pool.query(
      `SELECT 
         js.id AS step_id,
         js.step_order,
         js.title AS step_title,
         js.description AS step_description,
         js.tasks,
         js.criteria,
         js.duration AS step_duration,
         s.id AS submission_id,
         s.answer_text,
         s.submitted_at,
         f.id AS feedback_id,
         f.feedback_text,
         f.score,
         f.created_at AS feedback_at
       FROM job_steps js
       JOIN applications a ON a.job_id = js.job_id
       LEFT JOIN submissions s ON s.step_id = js.id AND s.application_id = $1
       LEFT JOIN feedbacks f ON f.submission_id = s.id
       WHERE a.id = $1
       ORDER BY js.step_order ASC`,
      [application_id],
    );

    res.json({ steps: result.rows });
  } catch (err) {
    console.error("Error en getSubmissions:", err.message);
    res.status(500).json({ error: "Error al obtener las entregas." });
  }
}

// ══════════════════════════════════════════════
//  FEEDBACKS — Feedback de la empresa por etapa
// ══════════════════════════════════════════════

async function giveFeedback(req, res) {
  const { submission_id } = req.params;
  const { feedback_text, score } = req.body;
  const userId = req.user.id;

  if (!feedback_text?.trim()) {
    return res.status(400).json({ error: "El feedback no puede estar vacío." });
  }
  if (score && (score < 1 || score > 5)) {
    return res.status(400).json({ error: "El puntaje debe estar entre 1 y 5." });
  }

  try {
    const ownerCheck = await pool.query(
      `SELECT s.id, c.id AS company_id FROM submissions s
       JOIN applications a ON a.id = s.application_id
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE s.id = $1 AND c.user_id = $2`,
      [submission_id, userId],
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: "No tienes permisos para dar feedback aquí." });
    }

    const existing = await pool.query(`SELECT id FROM feedbacks WHERE submission_id = $1`, [submission_id]);

    if (existing.rows.length > 0) {
      const updated = await pool.query(
        `UPDATE feedbacks SET feedback_text = $1, score = $2
         WHERE submission_id = $3
         RETURNING *`,
        [feedback_text.trim(), score || null, submission_id],
      );
      return res.json({ message: "Feedback actualizado.", feedback: updated.rows[0] });
    }

    const result = await pool.query(
      `INSERT INTO feedbacks (submission_id, company_id, feedback_text, score)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [submission_id, ownerCheck.rows[0].company_id, feedback_text.trim(), score || null],
    );

    res.status(201).json({
      message: "Feedback enviado al candidato.",
      feedback: result.rows[0],
    });
  } catch (err) {
    console.error("Error en giveFeedback:", err.message);
    res.status(500).json({ error: "Error al guardar el feedback." });
  }
}

module.exports = {
  applyToJob,
  getApplicants,
  getMyApplications,
  updateApplicationStatus,
  submitStep,
  getSubmissions,
  giveFeedback,
};
