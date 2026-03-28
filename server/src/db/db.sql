-- ══════════════════════════════════════════════════════
--  IMPULSO — Schema de base de datos
--  Ejecutar cuando PostgreSQL esté listo:
--  psql -U postgres -d impulso_db -f src/db/schema.sql
-- ══════════════════════════════════════════════════════

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tipos de usuario ─────────────────────────────────
CREATE TYPE user_role AS ENUM ('empresa', 'candidato');

-- ── Usuarios ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── Empresas (extiende users con rol 'empresa') ──────
CREATE TABLE IF NOT EXISTS companies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  description TEXT,
  sector      VARCHAR(100),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ── Ofertas de trabajo (microexperiencias) ───────────
CREATE TABLE IF NOT EXISTS jobs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  summary      TEXT NOT NULL,
  profile_area VARCHAR(100),
  duration     VARCHAR(50),
  status       VARCHAR(20) DEFAULT 'draft', -- draft | published | closed
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ── Etapas del timeline de cada oferta ──────────────
CREATE TABLE IF NOT EXISTS job_steps (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  step_order  INTEGER NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  duration    VARCHAR(50),
  tasks       JSONB,    -- array de strings con las tareas
  criteria    JSONB,    -- array de strings con los criterios
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ── Postulaciones ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       VARCHAR(30) DEFAULT 'in_progress', -- in_progress | completed | reviewed
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- ── Respuestas del candidato por etapa ───────────────
CREATE TABLE IF NOT EXISTS submissions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  step_id        UUID NOT NULL REFERENCES job_steps(id) ON DELETE CASCADE,
  answer_text    TEXT NOT NULL,
  submitted_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(application_id, step_id)
);

-- ── Feedback de la empresa por etapa ─────────────────
CREATE TABLE IF NOT EXISTS feedbacks (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id  UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  company_id     UUID NOT NULL REFERENCES companies(id),
  feedback_text  TEXT NOT NULL,
  score          INTEGER CHECK (score BETWEEN 1 AND 5),
  created_at     TIMESTAMP DEFAULT NOW()
);