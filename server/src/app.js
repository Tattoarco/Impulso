const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://impulso-seven.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" })); // necesario para base64 de archivos

// ── Rutas ────────────────────────────────────────────
app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/jobs", require("./modules/jobs/jobs.routes"));
app.use("/api", require("./modules/submissions/submissions.routes"));
app.use("/api", require("./modules/submissions/ProjectFeedback.routes"));
app.use("/api/portfolio", require("./modules/portafolio/portfolio.routes"));
app.use("/api/ai", require("./Routes/ai"));

// ── Health ───────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ── 404 ──────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// ── Error global ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`IMPULSO API en puerto ${PORT}`));
