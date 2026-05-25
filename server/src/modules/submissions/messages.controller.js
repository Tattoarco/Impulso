const pool = require("../../db/pool");

// Enviar mensaje en una etapa
async function sendMessage(req, res) {
  const { application_id, step_id, message } = req.body;
  const senderId = req.user.id;

  if (!application_id || !step_id || !message?.trim()) {
    return res.status(400).json({ error: "application_id, step_id y message son obligatorios." });
  }

  try {
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

    // El mensaje lo marca como leído solo por el sender
    const result = await pool.query(
      `INSERT INTO step_messages (application_id, step_id, sender_id, message, read_by)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING *`,
      [application_id, step_id, senderId, message.trim(), JSON.stringify([senderId])]
    );

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

// Obtener mensajes de una etapa y marcarlos como leídos
async function getMessages(req, res) {
  const { application_id, step_id } = req.params;
  const userId = req.user.id;

  try {
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

    // Marcar como leídos los mensajes que no son del usuario actual
    await pool.query(
      `UPDATE step_messages
       SET read_by = (
         CASE
           WHEN read_by @> $3::jsonb THEN read_by
           ELSE read_by || $3::jsonb
         END
       )
       WHERE application_id = $1
         AND step_id = $2
         AND sender_id != $4`,
      [application_id, step_id, JSON.stringify([userId]), userId]
    );

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

// Contar mensajes no leídos del usuario actual
async function getUnreadCount(req, res) {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count
       FROM step_messages m
       JOIN applications a ON a.id = m.application_id
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE
         -- El usuario tiene acceso (es candidato o empresa del job)
         (a.candidate_id = $1 OR c.user_id = $1)
         -- El mensaje no lo envió el usuario
         AND m.sender_id != $1
         -- El usuario no lo ha leído aún
         AND NOT (m.read_by @> $2::jsonb)`,
      [userId, JSON.stringify([userId])]
    );

    res.json({ count: parseInt(result.rows[0].count) || 0 });
  } catch (err) {
    console.error("Error en getUnreadCount:", err.message);
    res.status(500).json({ error: "Error al obtener notificaciones." });
  }
}

module.exports = { sendMessage, getMessages, getUnreadCount };