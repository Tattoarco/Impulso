const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../db/pool');

// ── Registro ──────────────────────────────────────────────────
async function register(req, res) {
  const { name, email, password, role, company_name, sector } = req.body;

  // Validaciones básicas
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Nombre, email, contraseña y rol son obligatorios.' });
  }
  if (!['empresa', 'candidato'].includes(role)) {
    return res.status(400).json({ error: 'El rol debe ser "empresa" o "candidato".' });
  }
  if (role === 'empresa' && !company_name) {
    return res.status(400).json({ error: 'El nombre de la empresa es obligatorio.' });
  }

  try {
    // Verificar si el email ya existe
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });
    }

    // Encriptar contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, password_hash, role]
    );
    const user = userResult.rows[0];

    // Si es empresa, crear registro en tabla companies
    if (role === 'empresa') {
      await pool.query(
        `INSERT INTO companies (user_id, company_name, sector)
         VALUES ($1, $2, $3)`,
        [user.id, company_name, sector || null]
      );
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Cuenta creada exitosamente.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('Error en register:', err.message);
    res.status(500).json({ error: 'Error interno al crear la cuenta.' });
  }
}

// ── Login ─────────────────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  try {
    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    // Verificar contraseña
    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Sesión iniciada correctamente.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
}

// ── Perfil del usuario actual ─────────────────────────────────
async function getMe(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              c.company_name, c.sector
       FROM users u
       LEFT JOIN companies c ON c.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json({ user });

  } catch (err) {
    console.error('Error en getMe:', err.message);
    res.status(500).json({ error: 'Error interno al obtener el perfil.' });
  }
}

module.exports = { register, login, getMe };