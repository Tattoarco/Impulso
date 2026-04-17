import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { useAuth } from "../Context/Authcontext";
import Footer from "../Components/footer";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#F26419]">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#F26419]">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AREAS = ["Marketing y Comunicación", "Diseño Gráfico / UX", "Desarrollo de Software", "Administración", "Derecho", "Ingeniería", "Psicología", "Contabilidad / Finanzas", "Educación", "Otro"];
const LEVELS = ["Explorador", "Practicante", "Junior Validado"];

// PUNTO 4: duración eliminada del formulario — la IA la determina
const SYSTEM_PROMPT = (info) => `Eres un asistente especializado en ayudar a empresas a crear proyectos profesionales para jóvenes sin experiencia en la plataforma Impulso.

La empresa proporcionó:
- Título: "${info.title}"
- Área: "${info.area}"
- Nivel: "${info.level}"
- Descripción: "${info.description}"

Haz exactamente 4 preguntas (una por mensaje):
1. ¿Cuál es el entregable principal? (Ej: informe PDF, prototipo, base de datos...)
2. ¿Qué herramientas o conocimientos específicos debe tener el candidato?
3. ¿Cuál es el problema concreto que este proyecto resuelve?
4. ¿Tienes algún ejemplo o material de apoyo para el candidato?
5. ¿Cuáles son los criterios de éxito para este proyecto?
6. ¿Algo más?

Después de las 4 respuestas termina con: "¡Perfecto! Voy a generar el brief completo. [GENERAR_BRIEF]"

Sé conciso, amable y profesional. Una pregunta a la vez. Responde en español. Haz preguntas claras y específicas para obtener la información necesaria. No hagas suposiciones, si falta información importante haz la pregunta correspondiente. Recuerda que el objetivo es construir un brief detallado para que la IA pueda generar un proyecto completo y atractivo para los candidatos.`;

const BRIEF_PROMPT = (info, history) => `Con esta información genera un brief en JSON puro (sin markdown):

Info básica: ${JSON.stringify(info, null, 2)}
Conversación: ${history.map((m) => `${m.role === "user" ? "Empresa" : "Asistente"}: ${m.content}`).join("\n")}

Estructura exacta:
{
  "summary": "Descripción en 3-4 oraciones",
  "objective": "Objetivo claro y medible",
  "deliverables": ["entregable 1", "entregable 2", "entregable 3"],
  "skills": ["habilidad 1", "habilidad 2", "habilidad 3"],
  "context": "Contexto de la organización",
  "support": "Recursos que recibirá el candidato"
}

Responde SOLO con el JSON.`;

// PUNTO 4: la IA determina la duración
const STEPS_PROMPT = (info, brief) => `Eres un experto en diseño de proyectos para jóvenes profesionales.

Con base en esta información genera entre 3 y 5 etapas de trabajo en JSON puro (sin markdown):

Proyecto: "${info.title}"
Área: "${info.area}"
Nivel: "${info.level}"
Resumen: "${brief.summary}"
Objetivo: "${brief.objective}"
Entregables: ${JSON.stringify(brief.deliverables)}

Genera un array JSON con esta estructura exacta:
[
  {
    "title": "Nombre corto de la etapa",
    "duration": "X días",
    "description": "Qué debe hacer el candidato en esta etapa (2 oraciones concretas)",
    "tasks": ["Tarea específica 1", "Tarea específica 2"],
    "criteria": ["Criterio de evaluación 1", "Criterio 2"]
  }
]

Reglas:
- Las etapas deben ser secuenciales y progresivas
- Cada etapa 2-3 tareas concretas y medibles
- Determina tú la duración total del proyecto según la complejidad (entre 1 semana y 2 meses)
- La duración de cada etapa debe ser coherente con el total
- Responde SOLO con el array JSON`;

export default function CrearProyecto() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [step, setStep] = useState(1);
  // PUNTO 4: se elimina "duration" del estado de info
  const [info, setInfo] = useState({ title: "", area: "", level: "", description: "" });
  const [infoErrors, setInfoErrors] = useState({});

  // PUNTO 5: mensajes persisten al volver del paso 3 al 2
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatDone, setChatDone] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [brief, setBrief] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishingMsg, setPublishingMsg] = useState("Publicando...");
  const [toast, setToast] = useState(null);
  const [tipIdx] = useState(() => Math.floor(Math.random() * 3));
  const messagesEndRef = useRef(null);

  const API = import.meta.env.VITE_API_URL;


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  const tips = ["Sé específico en los entregables — ayuda a los candidatos a saber qué producir.", "Proyectos de 2-3 semanas suelen atraer más postulantes.", "Mencionar herramientas concretas (Canva, Figma...) ayuda a filtrar mejores candidatos."];

  const validateInfo = () => {
    const e = {};
    if (!info.title.trim()) e.title = "Requerido";
    if (!info.area) e.area = "Selecciona un área";
    if (!info.level) e.level = "Selecciona el nivel";
    if (!info.description.trim()) e.description = "Describe brevemente el proyecto";
    setInfoErrors(e);
    return Object.keys(e).length === 0;
  };

  const startChat = async () => {
    if (!validateInfo()) return;
    setStep(2);
    // PUNTO 5: si ya hay mensajes (volvió del paso 3), no reiniciar el chat
    if (messages.length > 0) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT(info), messages: [{ role: "user", content: "Hola, quiero crear un proyecto para Impulso." }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "¿Cuál es el entregable principal?";
      setMessages([{ role: "ai", content: `¡Hola! Soy tu asistente de Impulso 👋 Voy a ayudarte a crear un proyecto completo.\n\n${text}` }]);
      setQuestionCount(1);
    } catch {
      setMessages([{ role: "ai", content: "¡Hola! Comencemos. ¿Cuál es el entregable principal que esperas recibir?" }]);
      setQuestionCount(1);
    }
    setAiLoading(false);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || aiLoading) return;
    const userMsg = userInput.trim();
    setUserInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setAiLoading(true);
    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));
      const res = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT(info), messages: apiMessages }),
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
      const fallback = questionCount >= 4 ? "¡Perfecto! Ya tengo suficiente información. [GENERAR_BRIEF]" : "Entendido. ¿Tienes algún ejemplo o material de apoyo para el candidato?";
      setMessages((prev) => [...prev, { role: "ai", content: fallback }]);
      if (questionCount >= 4) setChatDone(true);
      setQuestionCount((prev) => prev + 1);
    }
    setAiLoading(false);
  };

  const generateBrief = async (history) => {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: BRIEF_PROMPT(info, history) }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      setBrief(JSON.parse(clean));
      setStep(3);
    } catch {
      setBrief({
        summary: info.description,
        objective: `Desarrollar ${info.title} de manera efectiva.`,
        deliverables: ["Entregable principal", "Documentación del proceso", "Presentación de resultados"],
        skills: [info.area, "Comunicación escrita", "Gestión del tiempo"],
        context: "Este proyecto surge de una necesidad real de la organización.",
        support: "El candidato contará con acompañamiento y materiales de referencia.",
      });
      setStep(3);
    }
    setGenerating(false);
  };

  // PUNTO 5: volver al chat sin perder el historial
  const volverAlChat = () => {
    setChatDone(false); // permite seguir escribiendo
    setStep(2);
    // Agregar mensaje de contexto si ya había brief
    if (brief) {
      setMessages((prev) => [...prev, { role: "ai", content: "He generado un borrador del brief. Si quieres ajustar algo — agregar más contexto, cambiar los entregables o cualquier detalle — cuéntame y lo actualizo." }]);
    }
  };

  const publishJob = async (status) => {
    setPublishing(true);
    setPublishingMsg("Generando etapas con IA...");
    try {
      // Generar etapas — la IA determina la duración (PUNTO 4)
      let steps = [];
      let totalDuration = "3 semanas";
      try {
        const stepsRes = await fetch(`${API}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1500, messages: [{ role: "user", content: STEPS_PROMPT(info, brief) }] }),
        });
        const stepsData = await stepsRes.json();
        const stepsText = stepsData.content?.[0]?.text || "[]";
        const clean = stepsText.replace(/```json|```/g, "").trim();
        steps = JSON.parse(clean);
        // Calcular duración total sumando las etapas
        const dias = steps.reduce((acc, s) => {
          const n = parseInt(s.duration);
          return acc + (isNaN(n) ? 0 : n);
        }, 0);
        if (dias > 0) totalDuration = dias <= 7 ? "1 semana" : dias <= 14 ? "2 semanas" : dias <= 21 ? "3 semanas" : dias <= 30 ? "1 mes" : dias <= 42 ? "6 semanas" : "2 meses";
      } catch {
        steps = (brief.deliverables || []).map((d, i) => ({ title: `Etapa ${i + 1}: ${d}`, duration: "5 días", description: `Desarrolla y entrega: ${d}. Documenta el proceso y los resultados obtenidos.`, tasks: [d, "Documenta el proceso realizado", "Prepara una breve presentación del resultado"], criteria: ["Calidad del entregable", "Claridad de la documentación", "Cumplimiento del plazo"] }));
      }

      setPublishingMsg("Guardando proyecto...");
      const res = await fetch(`${API}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: info.title, summary: brief.summary, profile_area: info.area, duration: totalDuration, status, steps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al publicar el proyecto.");

      setToast({ type: "success", msg: status === "published" ? "¡Proyecto publicado con éxito! 🎉" : "Guardado como borrador" });
      setTimeout(() => {
        setToast(null);
        navigate("/empresa");
      }, 2500);
    } catch (err) {
      setToast({ type: "error", msg: err.message || "Error al guardar. Intenta de nuevo." });
      setTimeout(() => setToast(null), 3000);
    }
    setPublishing(false);
    setPublishingMsg("Publicando...");
  };

  const progressItems = [
    { label: "Objetivo del proyecto", done: questionCount > 0 },
    { label: "Entregables esperados", done: questionCount > 1 },
    { label: "Habilidades requeridas", done: questionCount > 2 },
    { label: "Contexto y recursos", done: questionCount > 3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      {/* TOPBAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-[5%] h-15 flex items-center justify-between">
        <a href="/empresa" className="flex items-center gap-2 no-underline cursor-pointer">
          <div className="w-7.5 h-7.5 bg-[#F26419] rounded-lg flex items-center justify-center">
            <i className="fi fi-sr-bolt text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">Impulso</span>
        </a>
        <Button onClick={() => (step > 1 ? setStep((s) => s - 1) : navigate("/empresa"))} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 bg-transparent border-none cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all">
          <i className="fi fi-br-angle-small-left" />
          {step > 1 ? "Paso anterior" : "Volver al dashboard"}
        </Button>
      </header>

      {/* STEPPER */}
      <div className="bg-white border-b border-gray-200 px-[5%] flex items-center">
        {[
          { n: 1, label: "Información básica" },
          { n: 2, label: "Construir con IA" },
          { n: 3, label: "Revisar y publicar" },
        ].map((s) => (
          <div key={s.n} className="flex items-center">
            <div className="flex items-center gap-2.5 py-4">
              <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s.n ? "bg-[#F26419] text-white" : step > s.n ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>{step > s.n ? <CheckIcon /> : s.n}</div>
              <span className={`text-sm font-medium transition-all ${step === s.n ? "text-gray-900 font-semibold" : step > s.n ? "text-green-500" : "text-gray-500"}`}>{s.label}</span>
            </div>
            {s.n < 3 && <span className="text-gray-300 text-lg mx-4">›</span>}
          </div>
        ))}
      </div>

      <main className="flex-1 px-[5%] py-10 max-w-250 mx-auto w-full">
        {/* PASO 1 — sin campo de duración (PUNTO 4) */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-9 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight mb-1.5">Cuéntanos sobre tu proyecto</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">Con esta información, nuestra IA te ayudará a construir un brief completo y determinará la duración ideal del proyecto.</p>
            <div className="grid grid-cols-2 gap-5">
              {/* Título */}
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Título del proyecto <span className="text-[#F26419]">*</span>
                </label>
                <input
                  className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-xl bg-gray-50 text-sm text-gray-900 outline-none transition-all focus:border-[#F26419] focus:bg-white focus:shadow-[0_0_0_3px_rgba(242,100,25,0.1)] ${infoErrors.title ? "border-red-500" : "border-gray-200"}`}
                  placeholder="Ej: Diagnóstico de redes sociales para startup local"
                  value={info.title}
                  onChange={(e) => setInfo({ ...info, title: e.target.value })}
                />
                {infoErrors.title && <span className="text-xs text-red-500">{infoErrors.title}</span>}
              </div>
              {/* Área */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Área profesional <span className="text-[#F26419]">*</span>
                </label>
                <select className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-xl bg-gray-50 text-sm text-gray-900 outline-none cursor-pointer transition-all appearance-none focus:border-[#F26419] focus:bg-white ${infoErrors.area ? "border-red-500" : "border-gray-200"}`} value={info.area} onChange={(e) => setInfo({ ...info, area: e.target.value })}>
                  <option value="">Selecciona el área</option>
                  {AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
                {infoErrors.area && <span className="text-xs text-red-500">{infoErrors.area}</span>}
              </div>
              {/* Nivel */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Nivel del candidato <span className="text-[#F26419]">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {LEVELS.map((l) => (
                    <Button key={l} type="button" onClick={() => setInfo({ ...info, level: l })} className={`flex-1 px-3 py-2.5 border-[1.5px] rounded-xl text-sm font-medium cursor-pointer transition-all ${info.level === l ? "border-[#F26419] bg-[#FEF0E8] text-[#F26419] font-bold" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#F26419] hover:bg-[#FEF0E8] hover:text-[#F26419]"}`}>
                      {l === "Explorador" && "🌱 "}
                      {l === "Practicante" && "🚀 "}
                      {l === "Junior Validado" && "⭐ "}
                      {l}
                    </Button>
                  ))}
                </div>
                {infoErrors.level && <span className="text-xs text-red-500">{infoErrors.level}</span>}
              </div>
              {/* Descripción */}
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Descripción breve <span className="text-[#F26419]">*</span>
                </label>
                <textarea
                  className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-xl bg-gray-50 text-sm text-gray-900 outline-none resize-y min-h-22.5 leading-relaxed transition-all focus:border-[#F26419] focus:bg-white ${infoErrors.description ? "border-red-500" : "border-gray-200"}`}
                  placeholder="En 2-3 líneas, ¿de qué trata el proyecto? La IA completará el resto y determinará la duración..."
                  value={info.description}
                  onChange={(e) => setInfo({ ...info, description: e.target.value })}
                />
                {infoErrors.description && <span className="text-xs text-red-500">{infoErrors.description}</span>}
              </div>
              {/* Aviso IA determina duración */}
              <div className="col-span-2 flex items-center gap-2.5 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                <i className="fi fi-rr-info text-[#F26419] text-sm" />
                <p className="text-xs text-gray-600">La duración del proyecto será determinada automáticamente por la IA según la complejidad del trabajo.</p>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <Button onClick={startChat} className="flex items-center gap-2 px-7 py-3 bg-[#F26419] text-white font-bold text-sm rounded-full cursor-pointer border-none transition-all hover:bg-[#C94E0D] hover:-translate-y-0.5 hover:shadow-[0_5px_16px_rgba(242,100,25,0.28)]">
                Continuar con IA <i className="fi fi-rr-arrow-right text-white" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 2: CHAT */}
        {step === 2 && (
          <div className="grid grid-cols-[1fr_340px] gap-5 max-lg:grid-cols-1">
            <div className="bg-white rounded-2xl border border-gray-200 flex flex-col h-150 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
                <div className="w-9.5 h-9.5 rounded-full bg-linear-to-br from-[#F26419] to-[#C94E0D] flex items-center justify-center text-lg shrink-0">🤖</div>
                <div>
                  <h4 className="text-[15px] font-bold">Asistente Impulso</h4>
                  <p className="text-xs text-gray-500">Te ayuda a crear el mejor brief</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-green-500 font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  En línea
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 scroll-smooth [scrollbar-width:thin]">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2.5 animate-[msgIn_0.25s_ease] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${m.role === "ai" ? "bg-linear-to-br from-[#F26419] to-[#C94E0D]" : "bg-gray-200"}`}>{m.role === "ai" ? "🤖" : "😎"}</div>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "ai" ? "bg-gray-100 text-gray-900 rounded-bl-sm" : "bg-[#F26419] text-white rounded-br-sm"}`}>{m.content}</div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#F26419] to-[#C94E0D] flex items-center justify-center text-sm">🤖</div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                      {[0, 200, 400].map((delay) => (
                        <span key={delay} className="w-1.75 h-1.75 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                {generating && (
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#F26419] to-[#C94E0D] flex items-center justify-center text-sm">🤖</div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-gray-700">✨ Generando el brief completo...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="px-5 py-4 border-t border-gray-200 flex gap-2.5">
                <input
                  className="flex-1 px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-full bg-gray-50 text-sm text-gray-900 outline-none transition-all focus:border-[#F26419] focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={chatDone ? "Brief generado — puedes seguir ajustando o ir al preview" : "Escribe tu respuesta..."}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={aiLoading}
                />
                <Button onClick={sendMessage} disabled={aiLoading || !userInput.trim()} className="w-10 h-10 rounded-full bg-[#F26419] border-none cursor-pointer flex items-center justify-center shrink-0 transition-all hover:bg-[#C94E0D] hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100">
                  <i className="fi fi-sr-paper-plane-launch" />
                </Button>
              </div>
              {/* PUNTO 5: botón ir al preview si el brief ya fue generado */}
              {chatDone && brief && (
                <div className="px-5 pb-4">
                  <Button onClick={() => setStep(3)} className="w-full py-2.5 bg-green-500 text-white font-semibold text-sm rounded-xl border-none cursor-pointer hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                    <i className="fi fi-rr-arrow-right" /> Ver preview del proyecto
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4 max-lg:hidden">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-bold text-gray-900 mb-3.5">Progreso del brief</p>
                {progressItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-2.5 text-sm text-gray-500">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 transition-all ${item.done ? "bg-green-500" : questionCount === i + 1 ? "bg-[#F26419] animate-pulse" : "bg-gray-200"}`}>{item.done ? <CheckIcon /> : i + 1}</div>
                    <span className={item.done ? "text-green-500" : questionCount === i + 1 ? "text-gray-900" : "text-gray-400"}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#FEF0E8] rounded-2xl border border-[#F26419]/15 p-4.5">
                <p className="text-[11px] font-bold tracking-wide uppercase text-[#F26419] mb-2">💡 Consejo</p>
                <p className="text-sm text-gray-700 leading-relaxed">{tips[tipIdx]}</p>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: PREVIEW */}
        {step === 3 && brief && (
          <div className="grid grid-cols-[1fr_320px] gap-5 max-lg:grid-cols-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-9 shadow-sm">
              <div className="inline-flex items-center gap-1.5 bg-[#FEF0E8] text-[#F26419] text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-full mb-4">✨ Generado por IA</div>
              <h1 className="text-[26px] font-bold tracking-tight mb-2">{info.title}</h1>
              <div className="flex gap-4 flex-wrap mb-6">
                {[
                  { icon: <TagIcon />, text: info.area },
                  { icon: <UserIcon />, text: info.level },
                ].map(({ icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 text-sm text-gray-500">
                    {icon} {text}
                  </span>
                ))}
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <i className="fi fi-rr-clock text-[#F26419] text-sm" /> Duración determinada por IA al publicar
                </span>
              </div>
              {[
                { title: "Descripción del proyecto", content: brief.summary },
                { title: "Objetivo", content: brief.objective },
                { title: "Contexto", content: brief.context },
                { title: "Apoyo al candidato", content: brief.support },
              ].map(({ title, content }) => (
                <div key={title} className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2.5">{title}</h4>
                  <p className="text-[15px] text-gray-700 leading-[1.75]">{content}</p>
                </div>
              ))}
              {[
                { title: "Entregables", items: brief.deliverables },
                { title: "Habilidades requeridas", items: brief.skills },
              ].map(({ title, items }) => (
                <div key={title} className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2.5">{title}</h4>
                  <ul className="flex flex-col gap-2">
                    {items?.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-[#F26419] font-bold shrink-0 mt-0.5">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mt-2">
                <i className="fi fi-rr-info text-[#F26419] text-sm" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  Al publicar, la IA generará las <strong>etapas del timeline</strong> y calculará la <strong>duración total</strong> del proyecto.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-bold mb-3.5">Resumen del proyecto</p>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm text-gray-500">Área</span>
                  <span className="text-sm font-semibold text-gray-900">{info.area}</span>
                </div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm text-gray-500">Nivel</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF0E8] text-[#F26419]">{info.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Duración</span>
                  <span className="text-xs text-gray-400 italic">La IA la determina</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-bold mb-2">¿Todo se ve bien?</p>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">Puedes publicarlo ahora o guardarlo como borrador.</p>
                <Button
                  onClick={() => publishJob("published")}
                  disabled={publishing}
                  className="w-full py-3.75 bg-[#F26419] text-white border-none rounded-full font-bold text-[15px] cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[#C94E0D] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,100,25,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {publishing ? (
                    <span className="flex items-center gap-2">
                      <i className="fi fi-rr-spinner animate-spin text-sm" />
                      {publishingMsg}
                    </span>
                  ) : (
                    "Publicar proyecto"
                  )}
                </Button>
                <Button onClick={() => publishJob("draft")} disabled={publishing} className="w-full py-3 mt-2.5 bg-transparent text-gray-600 border-[1.5px] border-gray-200 rounded-full font-medium text-sm cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-50">
                  Guardar como borrador
                </Button>
              </div>
              {/* PUNTO 5: volver al chat conserva el historial */}
              <div className="bg-[#FEF0E8] rounded-2xl border border-[#F26419]/15 p-5">
                <p className="text-sm text-gray-700 leading-relaxed mb-3">🔁 ¿Quieres ajustar algo? Vuelve al chat — la conversación se conserva.</p>
                <Button onClick={volverAlChat} className="w-full py-3 bg-transparent text-gray-600 border-[1.5px] border-gray-200 rounded-full font-medium text-sm cursor-pointer transition-all hover:bg-white">
                  Volver al chat
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-2xl z-9999 animate-[slideUp_0.3s_ease] ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
      <Footer />
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
