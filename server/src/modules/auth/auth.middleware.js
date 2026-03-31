const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // El token viene en el header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role } disponible en el controller
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
}

// Middleware para rutas exclusivas de empresa
function soloEmpresa(req, res, next) {
  if (req.user.role !== 'empresa') {
    return res.status(403).json({ error: 'Solo las empresas pueden realizar esta acción.' });
  }
  next();
}

// Middleware para rutas exclusivas de candidato
function soloCandidato(req, res, next) {
  if (req.user.role !== 'candidato') {
    return res.status(403).json({ error: 'Solo los candidatos pueden realizar esta acción.' });
  }
  next();
}

module.exports = { verifyToken, soloEmpresa, soloCandidato };