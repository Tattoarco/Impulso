import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   ESTILOS
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400..700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --orange:      #F26419;
  --orange-dark: #C94E0D;
  --orange-soft: #FEF0E8;
  --gray-900:    #1C1C1E;
  --gray-700:    #3A3A3C;
  --gray-500:    #6B6B6E;
  --gray-300:    #C7C7CC;
  --gray-200:    #E5E5EA;
  --gray-100:    #F5F5F7;
  --white:       #FFFFFF;
  --error:       #FF3B30;
  --green:       #34C759;
  --r:           12px;
  --ease:        0.22s cubic-bezier(.4,0,.2,1);
  --font:        'AR One Sans', sans-serif;
}

body { margin:0; font-family:var(--font); background:var(--gray-100); color:var(--gray-900); }

/* ── LAYOUT ── */
.cp-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── TOPBAR ── */
.cp-topbar {
  position: sticky; top:0; z-index:50;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--gray-200);
  padding: 0 5%;
  height: 60px;
  display: flex; align-items: center; justify-content: space-between;
}
.cp-topbar-logo { display:flex; align-items:center; gap:9px; cursor:pointer; text-decoration:none; }
.cp-logo-mark {
  width:30px; height:30px; background:var(--orange);
  border-radius:8px; display:flex; align-items:center; justify-content:center;
}
.cp-logo-mark svg { width:16px; height:16px; }
.cp-logo-name { font-weight:700; font-size:18px; color:var(--gray-900); }
.cp-back-btn {
  display:flex; align-items:center; gap:6px;
  font-size:13px; font-weight:500; color:var(--gray-500);
  background:none; border:none; cursor:pointer; font-family:var(--font);
  padding:6px 12px; border-radius:8px; transition:all var(--ease);
}
.cp-back-btn:hover { background:var(--gray-100); color:var(--gray-900); }

/* ── STEPPER ── */
.cp-stepper {
  background:var(--white);
  border-bottom: 1px solid var(--gray-200);
  padding: 0 5%;
  display:flex; align-items:center; gap:0;
}
.cp-step {
  display:flex; align-items:center; gap:10px;
  padding:16px 24px 16px 0;
  position:relative;
}
.cp-step:not(:last-child)::after {
  content:'›';
  color:var(--gray-300);
  font-size:18px;
  margin-right:16px;
}
.cp-step-num {
  width:26px; height:26px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:700;
  background:var(--gray-200); color:var(--gray-500);
  transition:all var(--ease); flex-shrink:0;
}
.cp-step.active .cp-step-num { background:var(--orange); color:var(--white); }
.cp-step.done .cp-step-num { background:var(--green); color:var(--white); }
.cp-step-label { font-size:13px; font-weight:500; color:var(--gray-500); }
.cp-step.active .cp-step-label { color:var(--gray-900); font-weight:600; }
.cp-step.done .cp-step-label { color:var(--green); }

/* ── MAIN AREA ── */
.cp-main {
  flex:1; padding:40px 5%;
  max-width:1000px; margin:0 auto; width:100%;
}

/* ── PASO 1: INFO BÁSICA ── */
.cp-card {
  background:var(--white); border-radius:20px;
  border:1px solid var(--gray-200);
  padding:36px 40px;
  box-shadow:0 2px 12px rgba(0,0,0,.04);
}
.cp-card-title { font-size:22px; font-weight:700; letter-spacing:-.4px; margin-bottom:6px; }
.cp-card-sub { font-size:14px; color:var(--gray-500); margin-bottom:32px; line-height:1.6; }

.cp-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.cp-form-full { grid-column:1/-1; }

.cp-fg { display:flex; flex-direction:column; gap:7px; }
.cp-fg label { font-size:13px; font-weight:600; color:var(--gray-700); }
.cp-fg label span { color:var(--orange); }

.cp-input, .cp-select, .cp-textarea {
  width:100%; padding:11px 14px;
  border:1.5px solid var(--gray-200); border-radius:var(--r);
  background:var(--gray-100);
  font-family:var(--font); font-size:14px; color:var(--gray-900);
  outline:none; transition:all var(--ease);
}
.cp-input:focus, .cp-select:focus, .cp-textarea:focus {
  border-color:var(--orange); background:var(--white);
  box-shadow:0 0 0 3px rgba(242,100,25,.1);
}
.cp-input.err, .cp-select.err, .cp-textarea.err { border-color:var(--error); }
.cp-textarea { resize:vertical; min-height:90px; line-height:1.6; }
.cp-select { appearance:none; cursor:pointer; }

.cp-level-group { display:flex; gap:10px; flex-wrap:wrap; }
.cp-level-btn {
  flex:1; min-width:120px; padding:12px 16px;
  border:1.5px solid var(--gray-200); border-radius:var(--r);
  background:var(--gray-100);
  font-family:var(--font); font-size:13px; font-weight:500;
  color:var(--gray-600); cursor:pointer; text-align:center;
  transition:all var(--ease);
}
.cp-level-btn:hover { border-color:var(--orange); background:var(--orange-soft); color:var(--orange); }
.cp-level-btn.selected { border-color:var(--orange); background:var(--orange-soft); color:var(--orange); font-weight:700; }

.cp-form-actions { display:flex; justify-content:flex-end; margin-top:32px; }

/* ── PASO 2: CHAT IA ── */
.cp-chat-layout { display:grid; grid-template-columns:1fr 340px; gap:20px; }

.cp-chat-card {
  background:var(--white); border-radius:20px;
  border:1px solid var(--gray-200);
  display:flex; flex-direction:column;
  height:600px;
  box-shadow:0 2px 12px rgba(0,0,0,.04);
  overflow:hidden;
}
.cp-chat-header {
  padding:20px 24px;
  border-bottom:1px solid var(--gray-200);
  display:flex; align-items:center; gap:12px;
}
.cp-ai-avatar {
  width:38px; height:38px; border-radius:50%;
  background: linear-gradient(135deg, var(--orange) 0%, var(--orange-dark) 100%);
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; font-size:18px;
}
.cp-chat-header-info h4 { font-size:15px; font-weight:700; }
.cp-chat-header-info p { font-size:12px; color:var(--gray-500); }
.cp-ai-status {
  margin-left:auto;
  display:flex; align-items:center; gap:5px;
  font-size:12px; color:var(--green); font-weight:500;
}
.cp-ai-status::before { content:''; width:6px; height:6px; background:var(--green); border-radius:50%; }

.cp-chat-messages {
  flex:1; overflow-y:auto; padding:20px 24px;
  display:flex; flex-direction:column; gap:16px;
  scroll-behavior:smooth;
}
.cp-chat-messages::-webkit-scrollbar { width:4px; }
.cp-chat-messages::-webkit-scrollbar-track { background:transparent; }
.cp-chat-messages::-webkit-scrollbar-thumb { background:var(--gray-200); border-radius:4px; }

.cp-msg { display:flex; gap:10px; animation:msgIn .25s ease; }
@keyframes msgIn {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0); }
}
.cp-msg.user { flex-direction:row-reverse; }

.cp-msg-avatar {
  width:32px; height:32px; border-radius:50%;
  background:var(--gray-200); display:flex; align-items:center; justify-content:center;
  font-size:14px; flex-shrink:0; margin-top:2px;
}
.cp-msg.ai .cp-msg-avatar {
  background: linear-gradient(135deg,var(--orange),var(--orange-dark));
}

.cp-msg-bubble {
  max-width:80%; padding:12px 16px;
  border-radius:16px; font-size:14px; line-height:1.65;
}
.cp-msg.ai .cp-msg-bubble {
  background:var(--gray-100); color:var(--gray-900);
  border-bottom-left-radius:4px;
}
.cp-msg.user .cp-msg-bubble {
  background:var(--orange); color:var(--white);
  border-bottom-right-radius:4px;
}

.cp-typing {
  display:flex; gap:4px; align-items:center; padding:4px 2px;
}
.cp-typing span {
  width:7px; height:7px; border-radius:50%;
  background:var(--gray-400);
  animation:typingDot 1.2s infinite ease;
}
.cp-typing span:nth-child(2) { animation-delay:.2s; }
.cp-typing span:nth-child(3) { animation-delay:.4s; }
@keyframes typingDot {
  0%,60%,100% { transform:translateY(0); opacity:.4; }
  30%          { transform:translateY(-5px); opacity:1; }
}

.cp-chat-input-area {
  padding:16px 20px;
  border-top:1px solid var(--gray-200);
  display:flex; gap:10px;
}
.cp-chat-input {
  flex:1; padding:10px 14px;
  border:1.5px solid var(--gray-200); border-radius:100px;
  background:var(--gray-100);
  font-family:var(--font); font-size:14px; color:var(--gray-900);
  outline:none; transition:all var(--ease);
}
.cp-chat-input:focus { border-color:var(--orange); background:var(--white); }
.cp-chat-input:disabled { opacity:.5; cursor:not-allowed; }
.cp-send-btn {
  width:40px; height:40px; border-radius:50%;
  background:var(--orange); border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:all var(--ease); flex-shrink:0;
}
.cp-send-btn:hover { background:var(--orange-dark); transform:scale(1.05); }
.cp-send-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }
.cp-send-btn svg { width:16px; height:16px; }

/* sidebar del chat */
.cp-chat-sidebar { display:flex; flex-direction:column; gap:16px; }

.cp-progress-card {
  background:var(--white); border-radius:16px;
  border:1px solid var(--gray-200); padding:20px;
}
.cp-progress-title { font-size:13px; font-weight:700; color:var(--gray-900); margin-bottom:14px; }
.cp-progress-item {
  display:flex; align-items:center; gap:10px;
  margin-bottom:10px; font-size:13px; color:var(--gray-500);
}
.cp-progress-dot {
  width:20px; height:20px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; font-size:11px;
  background:var(--gray-200); color:var(--gray-500);
  transition:all var(--ease);
}
.cp-progress-dot.done { background:var(--green); color:var(--white); }
.cp-progress-dot.active { background:var(--orange); color:var(--white); animation:pulse 1.5s infinite; }
@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(242,100,25,.4)} 50%{box-shadow:0 0 0 6px rgba(242,100,25,0)} }

.cp-tip-card {
  background:var(--orange-soft); border-radius:16px;
  border:1px solid rgba(242,100,25,.15); padding:18px;
}
.cp-tip-label { font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:var(--orange); margin-bottom:8px; }
.cp-tip-text { font-size:13px; color:var(--gray-700); line-height:1.6; }

/* ── PASO 3: PREVIEW ── */
.cp-preview-grid { display:grid; grid-template-columns:1fr 320px; gap:20px; }

.cp-preview-card {
  background:var(--white); border-radius:20px;
  border:1px solid var(--gray-200); padding:36px;
  box-shadow:0 2px 12px rgba(0,0,0,.04);
}
.cp-preview-badge {
  display:inline-flex; align-items:center; gap:6px;
  background:var(--orange-soft); color:var(--orange);
  font-size:11px; font-weight:700; letter-spacing:.6px; text-transform:uppercase;
  padding:4px 12px; border-radius:100px; margin-bottom:16px;
}
.cp-preview-title { font-size:26px; font-weight:700; letter-spacing:-.5px; margin-bottom:8px; }
.cp-preview-meta { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px; }
.cp-preview-meta-item {
  display:flex; align-items:center; gap:5px;
  font-size:13px; color:var(--gray-500);
}
.cp-preview-meta-item svg { width:14px; height:14px; color:var(--orange); }

.cp-preview-section { margin-bottom:24px; }
.cp-preview-section h4 { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--gray-500); margin-bottom:10px; }
.cp-preview-section p { font-size:15px; color:var(--gray-700); line-height:1.75; }
.cp-preview-section ul { list-style:none; display:flex; flex-direction:column; gap:8px; }
.cp-preview-section ul li { font-size:14px; color:var(--gray-700); display:flex; align-items:flex-start; gap:8px; }
.cp-preview-section ul li::before { content:'→'; color:var(--orange); font-weight:700; flex-shrink:0; margin-top:1px; }

.cp-preview-aside { display:flex; flex-direction:column; gap:16px; }
.cp-aside-card {
  background:var(--white); border-radius:16px;
  border:1px solid var(--gray-200); padding:20px;
}
.cp-aside-title { font-size:13px; font-weight:700; margin-bottom:14px; }
.cp-aside-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.cp-aside-label { font-size:13px; color:var(--gray-500); }
.cp-aside-value { font-size:13px; font-weight:600; color:var(--gray-900); }
.cp-level-badge {
  padding:4px 12px; border-radius:100px;
  font-size:12px; font-weight:700;
  background:var(--orange-soft); color:var(--orange);
}

.cp-publish-btn {
  width:100%; padding:15px;
  background:var(--orange); color:var(--white);
  border:none; border-radius:100px;
  font-family:var(--font); font-weight:700; font-size:15px;
  cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
  transition:all var(--ease);
}
.cp-publish-btn:hover { background:var(--orange-dark); transform:translateY(-1px); box-shadow:0 6px 20px rgba(242,100,25,.3); }
.cp-publish-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
.cp-draft-btn {
  width:100%; padding:12px;
  background:transparent; color:var(--gray-600);
  border:1.5px solid var(--gray-200); border-radius:100px;
  font-family:var(--font); font-weight:500; font-size:14px;
  cursor:pointer; transition:all var(--ease); margin-top:10px;
}
.cp-draft-btn:hover { background:var(--gray-100); }

/* ── BOTONES ── */
.btn-orange {
  padding:12px 28px;
  background:var(--orange); color:var(--white);
  border:none; border-radius:100px;
  font-family:var(--font); font-size:14px; font-weight:700;
  cursor:pointer; display:flex; align-items:center; gap:8px;
  transition:all var(--ease);
}
.btn-orange:hover { background:var(--orange-dark); transform:translateY(-1px); box-shadow:0 5px 16px rgba(242,100,25,.28); }
.btn-orange:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
.btn-ghost {
  padding:12px 24px;
  background:transparent; color:var(--gray-600);
  border:1.5px solid var(--gray-200); border-radius:100px;
  font-family:var(--font); font-size:14px; font-weight:500;
  cursor:pointer; transition:all var(--ease);
}
.btn-ghost:hover { background:var(--gray-100); }

/* ── TOAST ── */
.cp-toast {
  position:fixed; bottom:28px; right:28px;
  padding:14px 22px; border-radius:var(--r);
  font-size:14px; font-weight:500;
  display:flex; align-items:center; gap:10px;
  box-shadow:0 8px 32px rgba(0,0,0,.15);
  animation:slideUp .3s ease forwards; z-index:9999;
  background:var(--gray-900); color:var(--white);
}
.cp-toast.success { background:var(--green); }
.cp-toast.error   { background:var(--error); }
@keyframes slideUp {
  from { opacity:0; transform:translateY(12px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ── FERR ── */
.cp-ferr { font-size:12px; color:var(--error); }

@media (max-width:900px) {
  .cp-chat-layout { grid-template-columns:1fr; }
  .cp-preview-grid { grid-template-columns:1fr; }
  .cp-form-grid { grid-template-columns:1fr; }
  .cp-chat-sidebar { display:none; }
}
`;

/* ─── Icons ─── */
const BoltIcon = () => (
  <svg viewBox="0 0 20 20" fill="none">
    <path d="M10 2L3 11h7l-1 7 8-10h-7l1-8z" fill="white" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4 20-7z" />
    <path d="M22 2 11 13" />
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/* ─── Áreas y niveles ─── */
const AREAS = ["Marketing y Comunicación", "Diseño Gráfico / UX", "Desarrollo de Software", "Administración", "Derecho", "Ingeniería", "Psicología", "Contabilidad / Finanzas", "Educación", "Otro"];
const LEVELS = ["Explorador", "Practicante", "Junior Validado"];
const DURATIONS = ["1 semana", "2 semanas", "3 semanas", "1 mes", "6 semanas", "2 meses"];

/* ─── Sistema de preguntas para la IA ─── */
const SYSTEM_PROMPT = (info) => `Eres un asistente especializado en ayudar a empresas y organizaciones a crear proyectos profesionales claros y atractivos para jóvenes sin experiencia laboral en la plataforma Impulso.

La empresa ya proporcionó esta información básica:
- Título del proyecto: "${info.title}"
- Área: "${info.area}"
- Duración: "${info.duration}"
- Nivel requerido: "${info.level}"
- Descripción inicial: "${info.description}"

Tu objetivo es hacer exactamente 4 preguntas estratégicas (una por mensaje) para obtener la información necesaria y construir un brief completo y realista. Las preguntas deben ser:

1. ¿Cuál es el entregable principal que esperas recibir al final del proyecto? (Ej: informe PDF, prototipo, base de datos, plan de contenidos...)
2. ¿Qué herramientas o conocimientos específicos debería tener el candidato?
3. ¿Cuál es el problema o necesidad concreta que este proyecto resuelve para tu organización?
4. ¿Tienes algún ejemplo, referencia o material de apoyo que puedas compartir con el candidato para orientarlo?

Después de recibir las 4 respuestas, termina con: "¡Perfecto! Ya tengo toda la información necesaria. Voy a generar el brief completo de tu proyecto. [GENERAR_BRIEF]"

Sé conciso, amable y profesional. Nunca hagas más de una pregunta a la vez. Responde siempre en español.`;

const BRIEF_PROMPT = (info, history) => `Con base en la siguiente información sobre el proyecto, genera un brief estructurado en JSON con este formato exacto (sin markdown, solo JSON puro):

Información básica:
${JSON.stringify(info, null, 2)}

Conversación con la empresa:
${history.map((m) => `${m.role === "user" ? "Empresa" : "Asistente"}: ${m.content}`).join("\n")}

Genera el JSON con esta estructura exacta:
{
  "summary": "Descripción completa del proyecto en 3-4 oraciones profesionales",
  "objective": "Objetivo principal claro y medible",
  "deliverables": ["entregable 1", "entregable 2", "entregable 3"],
  "skills": ["habilidad 1", "habilidad 2", "habilidad 3"],
  "context": "Contexto de la organización y por qué este proyecto es relevante",
  "support": "Recursos o apoyo que recibirá el candidato durante el proyecto"
}

Responde SOLO con el JSON, sin texto adicional.`;

/* ─────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────── */
export default function CrearProyecto() {
  const navigate = useNavigate();

  // Pasos: 1=info básica | 2=chat IA | 3=preview
  const [step, setStep] = useState(1);

  // Info básica
  const [info, setInfo] = useState({ title: "", area: "", duration: "", level: "", description: "" });
  const [infoErrors, setInfoErrors] = useState({});

  // Chat
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatDone, setChatDone] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Brief generado
  const [brief, setBrief] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Publicar
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState(null);

  // Tip index
  const [tipIdx, setTipIdx] = useState(0);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  // Initialize random tip on mount
  useEffect(() => {
    const tips = ["Sé específico en los entregables — esto ayuda a los candidatos a entender exactamente qué deben producir.", "Proyectos de 2-3 semanas suelen atraer más postulantes que proyectos más largos.", "Mencionar herramientas concretas (Canva, Excel, Figma...) ayuda a filtrar mejores candidatos."];
    setTipIdx(Math.floor(Math.random() * tips.length));
  }, []);

  /* ── Validar paso 1 ── */
  const validateInfo = () => {
    const e = {};
    if (!info.title.trim()) e.title = "Requerido";
    if (!info.area) e.area = "Selecciona un área";
    if (!info.duration) e.duration = "Selecciona la duración";
    if (!info.level) e.level = "Selecciona el nivel";
    if (!info.description.trim()) e.description = "Describe brevemente el proyecto";
    setInfoErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Iniciar chat con IA ── */
  const startChat = async () => {
    if (!validateInfo()) return;
    setStep(2);
    setAiLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT(info),
          messages: [{ role: "user", content: "Hola, quiero crear un proyecto para publicar en Impulso." }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "¿Cuál es el entregable principal que esperas recibir?";
      setMessages([{ role: "ai", content: `¡Hola! Soy tu asistente de Impulso 👋 Voy a ayudarte a crear un proyecto completo para que los mejores candidatos puedan postularse. Solo necesito hacerte algunas preguntas rápidas.\n\n${text}` }]);
      setQuestionCount(1);
    } catch {
      setMessages([{ role: "ai", content: "¡Hola! Comencemos. ¿Cuál es el entregable principal que esperas recibir al final del proyecto? Por ejemplo: informe, prototipo, plan de contenidos..." }]);
      setQuestionCount(1);
    }
    setAiLoading(false);
  };

  /* ── Enviar mensaje ── */
  const sendMessage = async () => {
    if (!userInput.trim() || aiLoading) return;
    const userMsg = userInput.trim();
    setUserInput("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setAiLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT(info),
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const aiText = data.content?.[0]?.text || "";

      if (aiText.includes("[GENERAR_BRIEF]")) {
        const cleanText = aiText.replace("[GENERAR_BRIEF]", "").trim();
        setMessages((prev) => [...prev, { role: "ai", content: cleanText }]);
        setChatDone(true);
        setTimeout(() => generateBrief([...newMessages, { role: "ai", content: cleanText }]), 800);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: aiText }]);
        setQuestionCount((prev) => prev + 1);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Entendido. " + (questionCount < 4 ? "Una pregunta más: ¿tienes algún ejemplo o material de apoyo que puedas compartir con el candidato?" : "¡Perfecto! Ya tengo suficiente información para generar el brief. [GENERAR_BRIEF]"),
        },
      ]);
      if (questionCount >= 4) setChatDone(true);
      setQuestionCount((prev) => prev + 1);
    }
    setAiLoading(false);
  };

  /* ── Generar brief estructurado ── */
  const generateBrief = async (history) => {
    setGenerating(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: BRIEF_PROMPT(info, history) }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setBrief(parsed);
      setStep(3);
    } catch {
      // Fallback brief si falla la API
      setBrief({
        summary: info.description,
        objective: `Desarrollar ${info.title} de manera efectiva para la organización.`,
        deliverables: ["Entregable principal del proyecto", "Documentación del proceso", "Presentación de resultados"],
        skills: [info.area, "Comunicación escrita", "Gestión del tiempo"],
        context: "Este proyecto surge de una necesidad real de la organización.",
        support: "El candidato contará con acompañamiento y materiales de referencia.",
      });
      setStep(3);
    }
    setGenerating(false);
  };

  /* ── Publicar proyecto ── */
  const publishJob = async (status) => {
    setPublishing(true);
    try {
      // 👉 Aquí va tu endpoint real: POST /api/jobs
      const payload = {
        title: info.title,
        summary: brief.summary,
        profile_area: info.area,
        duration: info.duration,
        status, // 'published' o 'draft'
        // company_id viene del token de sesión en el backend
      };

      // Simulación — reemplaza con fetch real:
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });

      await new Promise((r) => setTimeout(r, 1000));
      setToast({ type: "success", msg: status === "published" ? "¡Proyecto publicado con éxito! 🎉" : "Guardado como borrador" });
      setTimeout(() => {
        setToast(null);
        navigate("/empresa");
      }, 2500);
    } catch {
      setToast({ type: "error", msg: "Error al guardar. Intenta de nuevo." });
      setTimeout(() => setToast(null), 3000);
    }
    setPublishing(false);
  };

  /* ── Sidebar de progreso ── */
  const progressItems = [
    { label: "Objetivo del proyecto", done: questionCount > 0 },
    { label: "Entregables esperados", done: questionCount > 1 },
    { label: "Habilidades requeridas", done: questionCount > 2 },
    { label: "Contexto y recursos", done: questionCount > 3 },
  ];

  const tips = ["Sé específico en los entregables — esto ayuda a los candidatos a entender exactamente qué deben producir.", "Proyectos de 2-3 semanas suelen atraer más postulantes que proyectos más largos.", "Mencionar herramientas concretas (Canva, Excel, Figma...) ayuda a filtrar mejores candidatos."];

  /* ─── RENDER ─── */
  return (
    <>
      <style>{CSS}</style>

      {/* TOPBAR */}
      <div className="cp-topbar">
        <a href="/empresa" className="cp-topbar-logo">
          <div className="cp-logo-mark">
            <BoltIcon />
          </div>
          <span className="cp-logo-name">Impulso</span>
        </a>
        <button className="cp-back-btn" onClick={() => (step > 1 ? setStep((s) => s - 1) : navigate("/empresa"))}>
          <ChevronLeft /> {step > 1 ? "Paso anterior" : "Volver al dashboard"}
        </button>
      </div>

      {/* STEPPER */}
      <div className="cp-stepper">
        {[
          { n: 1, label: "Información básica" },
          { n: 2, label: "Construir con IA" },
          { n: 3, label: "Revisar y publicar" },
        ].map((s) => (
          <div key={s.n} className={`cp-step ${step === s.n ? "active" : step > s.n ? "done" : ""}`}>
            <div className="cp-step-num">{step > s.n ? <CheckIcon /> : s.n}</div>
            <span className="cp-step-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="cp-main">
        {/* ── PASO 1 ── */}
        {step === 1 && (
          <div className="cp-card">
            <h2 className="cp-card-title">Cuéntanos sobre tu proyecto</h2>
            <p className="cp-card-sub">Con esta información, nuestra IA te ayudará a construir un brief completo que atraiga a los mejores candidatos.</p>

            <div className="cp-form-grid">
              {/* Título */}
              <div className="cp-fg cp-form-full">
                <label>
                  Título del proyecto <span>*</span>
                </label>
                <input className={`cp-input ${infoErrors.title ? "err" : ""}`} placeholder="Ej: Diagnóstico de redes sociales para startup local" value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} />
                {infoErrors.title && <span className="cp-ferr">{infoErrors.title}</span>}
              </div>

              {/* Área */}
              <div className="cp-fg">
                <label>
                  Área profesional <span>*</span>
                </label>
                <select className={`cp-select ${infoErrors.area ? "err" : ""}`} value={info.area} onChange={(e) => setInfo({ ...info, area: e.target.value })}>
                  <option value="">Selecciona el área</option>
                  {AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
                {infoErrors.area && <span className="cp-ferr">{infoErrors.area}</span>}
              </div>

              {/* Duración */}
              <div className="cp-fg">
                <label>
                  Duración estimada <span>*</span>
                </label>
                <select className={`cp-select ${infoErrors.duration ? "err" : ""}`} value={info.duration} onChange={(e) => setInfo({ ...info, duration: e.target.value })}>
                  <option value="">Selecciona la duración</option>
                  {DURATIONS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                {infoErrors.duration && <span className="cp-ferr">{infoErrors.duration}</span>}
              </div>

              {/* Nivel */}
              <div className="cp-fg cp-form-full">
                <label>
                  Nivel del candidato requerido <span>*</span>
                </label>
                <div className="cp-level-group">
                  {LEVELS.map((l) => (
                    <button key={l} type="button" className={`cp-level-btn ${info.level === l ? "selected" : ""}`} onClick={() => setInfo({ ...info, level: l })}>
                      {l === "Explorador" && "🌱 "}
                      {l === "Practicante" && "🚀 "}
                      {l === "Junior Validado" && "⭐ "}
                      {l}
                    </button>
                  ))}
                </div>
                {infoErrors.level && <span className="cp-ferr">{infoErrors.level}</span>}
              </div>

              {/* Descripción inicial */}
              <div className="cp-fg cp-form-full">
                <label>
                  Descripción breve inicial <span>*</span>
                </label>
                <textarea className={`cp-textarea ${infoErrors.description ? "err" : ""}`} placeholder="En 2-3 líneas, ¿de qué trata el proyecto? Nuestra IA te ayudará a completar el resto..." value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} />
                {infoErrors.description && <span className="cp-ferr">{infoErrors.description}</span>}
              </div>
            </div>

            <div className="cp-form-actions">
              <button className="btn-orange" onClick={startChat}>
                Continuar con IA <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 2: CHAT IA ── */}
        {step === 2 && (
          <div className="cp-chat-layout">
            {/* Chat principal */}
            <div className="cp-chat-card">
              <div className="cp-chat-header">
                <div className="cp-ai-avatar">🤖</div>
                <div className="cp-chat-header-info">
                  <h4>Asistente Impulso</h4>
                  <p>Te ayuda a crear el mejor brief</p>
                </div>
                <div className="cp-ai-status">En línea</div>
              </div>

              <div className="cp-chat-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`cp-msg ${m.role === "ai" ? "ai" : "user"}`}>
                    <div className="cp-msg-avatar">{m.role === "ai" ? "🤖" : "👤"}</div>
                    <div className="cp-msg-bubble">{m.content}</div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="cp-msg ai">
                    <div className="cp-msg-avatar">🤖</div>
                    <div className="cp-msg-bubble">
                      <div className="cp-typing">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}
                {generating && (
                  <div className="cp-msg ai">
                    <div className="cp-msg-avatar">🤖</div>
                    <div className="cp-msg-bubble">✨ Generando el brief completo de tu proyecto...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="cp-chat-input-area">
                <input className="cp-chat-input" placeholder={chatDone ? "Chat completado" : "Escribe tu respuesta..."} value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} disabled={aiLoading || chatDone} />
                <button className="cp-send-btn" onClick={sendMessage} disabled={aiLoading || chatDone || !userInput.trim()}>
                  <SendIcon />
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="cp-chat-sidebar">
              <div className="cp-progress-card">
                <div className="cp-progress-title">Progreso del brief</div>
                {progressItems.map((item, i) => (
                  <div key={i} className="cp-progress-item">
                    <div className={`cp-progress-dot ${item.done ? "done" : questionCount === i + 1 ? "active" : ""}`}>{item.done ? <CheckIcon /> : i + 1}</div>
                    <span style={{ color: item.done ? "var(--green)" : questionCount === i + 1 ? "var(--gray-900)" : "var(--gray-400)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="cp-tip-card">
                <div className="cp-tip-label">💡 Consejo</div>
                <p className="cp-tip-text">{tips[tipIdx]}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── PASO 3: PREVIEW ── */}
        {step === 3 && brief && (
          <div className="cp-preview-grid">
            <div className="cp-preview-card">
              <div className="cp-preview-badge">✨ Generado por IA</div>
              <h1 className="cp-preview-title">{info.title}</h1>
              <div className="cp-preview-meta">
                <span className="cp-preview-meta-item">
                  <ClockIcon />
                  {info.duration}
                </span>
                <span className="cp-preview-meta-item">
                  <TagIcon />
                  {info.area}
                </span>
                <span className="cp-preview-meta-item">
                  <UserIcon />
                  {info.level}
                </span>
              </div>

              <div className="cp-preview-section">
                <h4>Descripción del proyecto</h4>
                <p>{brief.summary}</p>
              </div>

              <div className="cp-preview-section">
                <h4>Objetivo</h4>
                <p>{brief.objective}</p>
              </div>

              <div className="cp-preview-section">
                <h4>Entregables</h4>
                <ul>
                  {brief.deliverables?.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="cp-preview-section">
                <h4>Habilidades requeridas</h4>
                <ul>
                  {brief.skills?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="cp-preview-section">
                <h4>Contexto</h4>
                <p>{brief.context}</p>
              </div>

              <div className="cp-preview-section">
                <h4>Apoyo al candidato</h4>
                <p>{brief.support}</p>
              </div>
            </div>

            {/* Aside */}
            <div className="cp-preview-aside">
              <div className="cp-aside-card">
                <div className="cp-aside-title">Resumen del proyecto</div>
                <div className="cp-aside-row">
                  <span className="cp-aside-label">Duración</span>
                  <span className="cp-aside-value">{info.duration}</span>
                </div>
                <div className="cp-aside-row">
                  <span className="cp-aside-label">Área</span>
                  <span className="cp-aside-value">{info.area}</span>
                </div>
                <div className="cp-aside-row">
                  <span className="cp-aside-label">Nivel</span>
                  <span className="cp-level-badge">{info.level}</span>
                </div>
              </div>

              <div className="cp-aside-card">
                <div className="cp-aside-title">¿Todo se ve bien?</div>
                <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 16, lineHeight: 1.6 }}>Puedes publicarlo ahora o guardarlo como borrador para editarlo después.</p>
                <button className="cp-publish-btn" onClick={() => publishJob("published")} disabled={publishing}>
                  {publishing ? "Publicando..." : "Publicar proyecto"}
                </button>
                <button className="cp-draft-btn" onClick={() => publishJob("draft")} disabled={publishing}>
                  Guardar como borrador
                </button>
              </div>

              <div className="cp-aside-card" style={{ background: "var(--orange-soft)", border: "1px solid rgba(242,100,25,.15)" }}>
                <p style={{ fontSize: 13, color: "var(--gray-700)", lineHeight: 1.6 }}>🔁 ¿Quieres hacer cambios? Puedes volver al chat para ajustar el brief antes de publicar.</p>
                <button className="btn-ghost" style={{ marginTop: 12, width: "100%", fontSize: 13 }} onClick={() => setStep(2)}>
                  Volver al chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`cp-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </>
  );
}
