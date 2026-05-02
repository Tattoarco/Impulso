const pool = require("../../db/pool");

// Enviar mensaje en una etapa
async function sendMessage(req, res) {
  const { application_id, step_id, message } = req.body;
  const senderId = req.user.id;

  if (!application_id || !step_id || !message?.trim()) {
    return res.status(400).json({ error: "application_id, step_id y message son obligatorios." });
  }

  try {
    // Verificar que el usuario tiene acceso a esta postulación
    const accessCheck = await pool.query(
      `SELECT a.id FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.id = $1
         AND (a.candidate_id = $2 OR c.user_id = $2)`,
      [application_id, senderId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: "No tienes acceso a esta conversación." });
    }

    const result = await pool.query(
      `INSERT INTO step_messages (application_id, step_id, sender_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [application_id, step_id, senderId, message.trim()]
    );

    // Devolver el mensaje con el nombre del remitente
    const withSender = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.role AS sender_role
       FROM step_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ message: withSender.rows[0] });
  } catch (err) {
    console.error("Error en sendMessage:", err.message);
    res.status(500).json({ error: "Error al enviar el mensaje." });
  }
}

// Obtener mensajes de una etapa específica
async function getMessages(req, res) {
  const { application_id, step_id } = req.params;
  const userId = req.user.id;

  try {
    // Verificar acceso
    const accessCheck = await pool.query(
      `SELECT a.id FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.id = $1
         AND (a.candidate_id = $2 OR c.user_id = $2)`,
      [application_id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: "No tienes acceso a esta conversación." });
    }

    const result = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.role AS sender_role
       FROM step_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.application_id = $1 AND m.step_id = $2
       ORDER BY m.created_at ASC`,
      [application_id, step_id]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    console.error("Error en getMessages:", err.message);
    res.status(500).json({ error: "Error al obtener los mensajes." });
  }
}

module.exports = { sendMessage, getMessages };