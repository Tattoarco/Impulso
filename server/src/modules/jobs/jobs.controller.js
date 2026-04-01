const pool = require('../../db/pool');

// ── Generar timeline con IA ───────────────────────────────────
async function generateWithAI(req, res) {
  const { title, area, duration, level, description, messages } = req.body;

  if (!title || !area || !duration) {
    return res.status(400).json({ error: 'Título, área y duración son obligatorios.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: messages || [
          {
            role: 'user',
            content: `Genera un proceso de selección en JSON para: título="${title}", área="${area}", duración="${duration}", nivel="${level}", descripción="${description}". 
            
Responde SOLO con JSON válido:
{
  "summary": "descripción del proyecto",
  "steps": [
    {
      "title": "nombre etapa",
      "duration": "X días",
      "description": "qué hace el candidato",
      "tasks": ["tarea 1", "tarea 2"],
      "criteria": ["criterio 1", "criterio 2"]
    }
  ]
}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json({ generated: parsed });
  } catch (err) {
    console.error('Error en generateWithAI:', err.message);
    res.status(500).json({ error: 'Error al generar con IA.' });
  }
}

// ── Crear oferta y guardar en BD ──────────────────────────────
async function createJob(req, res) {
  const { title, summary, profile_area, duration, status, steps } = req.body;
  const userId = req.user.id;

  if (!title || !summary) {
    return res.status(400).json({ error: 'Título y resumen son obligatorios.' });
  }

  try {
    // Obtener company_id del usuario
    const companyResult = await pool.query(
      'SELECT id FROM companies WHERE user_id = $1',
      [userId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(403).json({ error: 'Solo las empresas pueden crear proyectos.' });
    }

    const companyId = companyResult.rows[0].id;

    // Crear el job
    const jobResult = await pool.query(
      `INSERT INTO jobs (company_id, title, summary, profile_area, duration, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [companyId, title, summary, profile_area, duration, status || 'draft']
    );

    const job = jobResult.rows[0];

    // Guardar etapas si vienen
    if (steps && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await pool.query(
          `INSERT INTO job_steps (job_id, step_order, title, description, duration, tasks, criteria)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            job.id, i + 1, step.title, step.description,
            step.duration, JSON.stringify(step.tasks || []),
            JSON.stringify(step.criteria || []),
          ]
        );
      }
    }

    res.status(201).json({ message: 'Proyecto creado exitosamente.', job });
  } catch (err) {
    console.error('Error en createJob:', err.message);
    res.status(500).json({ error: 'Error al crear el proyecto.' });
  }
}

// ── Proyectos de la empresa autenticada ──────────────────────
async function getMyJobs(req, res) {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT j.*, 
              COUNT(a.id) AS applications_count
       FROM jobs j
       JOIN companies c ON c.id = j.company_id
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE c.user_id = $1
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [userId]
    );

    res.json({ jobs: result.rows });
  } catch (err) {
    console.error('Error en getMyJobs:', err.message);
    res.status(500).json({ error: 'Error al obtener proyectos.' });
  }
}

// ── Listado público de ofertas ────────────────────────────────
async function getAllJobs(req, res) {
  try {
    const result = await pool.query(
      `SELECT j.*, c.company_name,
              COUNT(a.id) AS applications_count
       FROM jobs j
       JOIN companies c ON c.id = j.company_id
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.status = 'published'
       GROUP BY j.id, c.company_name
       ORDER BY j.created_at DESC`
    );

    res.json({ jobs: result.rows });
  } catch (err) {
    console.error('Error en getAllJobs:', err.message);
    res.status(500).json({ error: 'Error al obtener ofertas.' });
  }
}

// ── Detalle de una oferta con sus etapas ─────────────────────
async function getJobById(req, res) {
  const { id } = req.params;

  try {
    const jobResult = await pool.query(
      `SELECT j.*, c.company_name
       FROM jobs j
       JOIN companies c ON c.id = j.company_id
       WHERE j.id = $1`,
      [id]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    const stepsResult = await pool.query(
      `SELECT * FROM job_steps WHERE job_id = $1 ORDER BY step_order`,
      [id]
    );

    res.json({
      job: jobResult.rows[0],
      steps: stepsResult.rows,
    });
  } catch (err) {
    console.error('Error en getJobById:', err.message);
    res.status(500).json({ error: 'Error al obtener el proyecto.' });
  }
}

// ── Actualizar estado de una oferta ──────────────────────────
async function updateJobStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!['published', 'draft', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido.' });
  }

  try {
    const result = await pool.query(
      `UPDATE jobs SET status = $1
       WHERE id = $2
         AND company_id = (SELECT id FROM companies WHERE user_id = $3)
       RETURNING *`,
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado o sin permisos.' });
    }

    res.json({ message: 'Estado actualizado.', job: result.rows[0] });
  } catch (err) {
    console.error('Error en updateJobStatus:', err.message);
    res.status(500).json({ error: 'Error al actualizar el proyecto.' });
  }
}

module.exports = {
  generateWithAI,
  createJob,
  getMyJobs,
  getAllJobs,
  getJobById,
  updateJobStatus,
};