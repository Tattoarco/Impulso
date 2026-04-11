const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../db/pool");

async function register(req, res) {
  const { name, email, password, role, company_name, sector } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: "Nombre, email, contraseña y rol son obligatorios." });
  if (!["empresa", "candidato"].includes(role)) return res.status(400).json({ error: 'El rol debe ser "empresa" o "candidato".' });
  if (role === "empresa" && !company_name) return res.status(400).json({ error: "El nombre de la empresa es obligatorio." });
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Ya existe una cuenta con ese email." });
    const password_hash = await bcrypt.hash(password, 10);
    const userResult = await pool.query(`INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`, [name, email, password_hash, role]);
    const user = userResult.rows[0];
    if (role === "empresa") {
      await pool.query(`INSERT INTO companies (user_id, company_name, sector) VALUES ($1, $2, $3)`, [user.id, company_name, sector || null]);
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "Cuenta creada exitosamente.", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Error en register:", err.message);
    res.status(500).json({ error: "Error interno al crear la cuenta." });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email y contraseña son obligatorios." });
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas." });
    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) return res.status(401).json({ error: "Credenciales incorrectas." });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Sesión iniciada correctamente.", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Error en login:", err.message);
    res.status(500).json({ error: "Error interno al iniciar sesión." });
  }
}

// Incluye todos los campos de perfil
async function getMe(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              u.bio, u.universidad, u.carrera, u.año_graduacion,
              u.habilidades, u.linkedin, u.portafolio, u.ciudad,
              c.company_name, c.sector
       FROM users u
       LEFT JOIN companies c ON c.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id],
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
    res.json({ user });
  } catch (err) {
    console.error("Error en getMe:", err.message);
    res.status(500).json({ error: "Error interno al obtener el perfil." });
  }
}

// Candidato actualiza su propio perfil
async function updateProfile(req, res) {
  const { name, bio, universidad, carrera, año_graduacion, habilidades, linkedin, portafolio, ciudad } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET
         name           = COALESCE($1, name),
         bio            = $2,
         universidad    = $3,
         carrera        = $4,
         año_graduacion = $5,
         habilidades    = $6,
         linkedin       = $7,
         portafolio     = $8,
         ciudad         = $9
       WHERE id = $10
       RETURNING id, name, email, role, bio, universidad, carrera, año_graduacion, habilidades, linkedin, portafolio, ciudad`,
      [name || null, bio || null, universidad || null, carrera || null, año_graduacion || null, JSON.stringify(habilidades || []), linkedin || null, portafolio || null, ciudad || null, req.user.id],
    );
    res.json({ message: "Perfil actualizado correctamente.", user: result.rows[0] });
  } catch (err) {
    console.error("Error en updateProfile:", err.message);
    res.status(500).json({ error: "Error al actualizar el perfil." });
  }
}

// Empresa ve el perfil público de un candidato
async function getCandidateProfile(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, name, email, bio, universidad, carrera,
              año_graduacion, habilidades, linkedin, portafolio, ciudad, created_at
       FROM users WHERE id = $1 AND role = 'candidato'`,
      [id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Candidato no encontrado." });
    res.json({ candidate: result.rows[0] });
  } catch (err) {
    console.error("Error en getCandidateProfile:", err.message);
    res.status(500).json({ error: "Error al obtener el perfil." });
  }
}

module.exports = { register, login, getMe, updateProfile, getCandidateProfile };
