const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── Middlewares ──────────────────────────────────────
app.use(
  cors({
    origin: "http://localhost:5173", // puerto de React + Vite
    credentials: true,
  }),
);
app.use(express.json());

// ── Rutas (se irán agregando módulo a módulo) ────────
app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/jobs", require("./modules/jobs/jobs.routes"));
app.use("/api/ai", require("./Routes/ai"));
// app.use('/api/submissions', require('./modules/submissions/submissions.routes'));

// ── Ruta de prueba ───────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "IMPULSO API funcionando" });
});

// ── Manejo de rutas no encontradas ───────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ── Manejo de errores globales ───────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ── Iniciar servidor ─────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor IMPULSO corriendo en http://localhost:${PORT}`);
});
