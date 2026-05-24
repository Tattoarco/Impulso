import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { useAuth } from "../Context/Authcontext";

import Mascota from "../../Public/MascotaImagen.PNG";
import Footer from "../Components/footer";

const API = import.meta.env.VITE_API_URL;

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const AREAS = ["Marketing y Comunicación", "Diseño Gráfico / UX", "Desarrollo de Software", "Administración", "Derecho", "Ingeniería", "Psicología", "Contabilidad / Finanzas", "Educación", "Salud", "Otro"];
const LEVELS = ["Explorador", "Practicante", "Junior Validado"];

// ── Prompts ──────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = (info, brief = null) => `
Eres un asistente especializado en ayudar a empresas a crear proyectos profesionales para jóvenes sin experiencia en la plataforma Impulso.

La empresa proporcionó esta información inicial:
- Título: "${info.title}"
- Área: "${info.area}"
- Nivel: "${info.level}"
- Descripción: "${info.description}"
- Modalidad: "${info.modalidad}"
- Pago: "${info.pago ? `$${parseInt(info.pago).toLocaleString("es-CO")} COP` : "No especificado"}"
${info.archivoNombre ? `- Archivo adjunto: "${info.archivoNombre}"` : ""}

${brief ? `El brief actual del proyecto es:\n${JSON.stringify(brief, null, 2)}` : ""}

Tu objetivo es hacer una conversación natural y fluida para construir el mejor brief posible. Haz UNA pregunta a la vez de forma conversacional.

Temas a cubrir: entregable principal, herramientas específicas, problema concreto, materiales de apoyo disponibles, criterios de éxito.

Cuando tengas suficiente información (mínimo 4 intercambios), escribe tu último mensaje y al final incluye exactamente: [GENERAR_BRIEF]

Responde siempre en español. Sé conversacional, cálido y profesional.
`;

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

const STEPS_PROMPT = (info, brief) => `Genera entre 3 y 5 etapas en JSON puro (sin markdown):

Proyecto: "${info.title}" | Área: "${info.area}" | Nivel: "${info.level}"
Resumen: "${brief.summary}" | Objetivo: "${brief.objective}"
Entregables: ${JSON.stringify(brief.deliverables)}

Array JSON:
[{
  "title": "Nombre corto",
  "duration": "X días",
  "description": "Qué hace el candidato (2 oraciones)",
  "tasks": ["Tarea 1", "Tarea 2"],
  "criteria": ["Criterio 1", "Criterio 2"]
}]

Responde SOLO el array JSON.`;

const PRICE_PROMPT = (info) => `
Eres un asesor experto en compensación laboral para proyectos junior en Colombia.

Analiza este proyecto con DETALLE:
- Título: "${info.title}"
- Área: "${info.area}"  
- Nivel: "${info.level}"
- Descripción: "${info.description}"
- Modalidad: "${info.modalidad}"

Considera:
1. Tarifas reales del mercado colombiano 2024-2025 para el área específica
2. Complejidad técnica implícita en la descripción
3. Si es presencial, incluir gastos de desplazamiento
4. Nivel de especialización requerido
5. Competitividad para atraer talento de calidad

Genera EXACTAMENTE este JSON (sin markdown):
{
  "minPrice": 400000,
  "suggestedPrice": 750000,
  "maxPrice": 1200000,
  "rationale": "Explicación concisa de por qué este rango es justo para el mercado colombiano",
  "marketContext": "Qué pagan empresas similares en Colombia por este tipo de trabajo",
  "warningBelow": 500000,
  "warnings": {
    "tooLow": "Mensaje específico si pagan muy poco (por debajo de warningBelow)",
    "fair": "Mensaje de validación si el precio está en rango justo",
    "generous": "Mensaje si el precio es generoso y competitivo"
  }
}
`;

const CHAT_ANALYSIS_PROMPT = (info, messages) => `
Eres un asesor experto analizando la conversación entre una empresa y un asistente IA para crear un proyecto en Impulso.

Proyecto actual:
- Título: "${info.title}"
- Área: "${info.area}"
- Nivel: "${info.level}"
- Descripción: "${info.description}"
- Pago: $${parseInt(info.pago || 0).toLocaleString("es-CO")} COP

Conversación hasta ahora:
${messages.slice(-6).map((m) => `${m.role === "user" ? "Empresa" : "IA"}: ${typeof m.content === "string" ? m.content : "[archivo]"}`).join("\n")}

Genera entre 3 y 5 recomendaciones MUY ESPECÍFICAS y contextuales basadas en lo que la empresa ha dicho. NO seas genérico.

Analiza:
- ¿Hay ambigüedad en los entregables mencionados?
- ¿El nivel del candidato (${info.level}) es adecuado para la complejidad descrita?
- ¿Falta información crítica que afecte el éxito?
- ¿El pago es coherente con lo que se pide?
- ¿La modalidad (${info.modalidad}) tiene implicaciones no consideradas?
- ¿Hay riesgos específicos en este tipo de proyecto?

Responde SOLO con JSON (sin markdown):
[
  {
    "tipo": "advertencia" | "consejo" | "positivo" | "critico",
    "titulo": "Título corto y específico",
    "texto": "Recomendación concreta y accionable de máximo 2 oraciones. Menciona detalles específicos del proyecto."
  }
]
`;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Componente de precio ─────────────────────────────────────────────────────
function PriceAdvisor({ info, value, onChange, error }) {
  const [priceData, setPriceData]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [analyzed, setAnalyzed]     = useState(false);
  const debounceRef                 = useRef(null);

  // Regenerar cuando cambia info relevante
  useEffect(() => {
    if (!info.title || !info.area || !info.level || !info.description) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setAnalyzed(false);
      try {
        const res  = await fetch(`${API}/api/ai/chat`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            model:     "claude-haiku-4-5-20251001",
            max_tokens: 400,
            messages:  [{ role: "user", content: PRICE_PROMPT(info) }],
          }),
        });
        const data  = await res.json();
        const text  = data.content?.[0]?.text || "{}";
        const clean = text.replace(/```json|```/g, "").trim();
        setPriceData(JSON.parse(clean));
        setAnalyzed(true);
      } catch { /* silencioso */ }
      setLoading(false);
    }, 1400);
    return () => clearTimeout(debounceRef.current);
  }, [info.title, info.area, info.level, info.description, info.modalidad]);

  const numVal = parseInt(value) || 0;
  const status = !priceData ? null
    : numVal < (priceData.warningBelow || 0)   ? "low"
    : numVal > priceData.maxPrice              ? "generous"
    : "fair";

  const statusConfig = {
    low:      { color: "text-red-600",    bg: "bg-red-50 border-red-200",    icon: "fi-rr-exclamation",  label: "Muy bajo" },
    fair:     { color: "text-green-600",  bg: "bg-green-50 border-green-100", icon: "fi-rr-check-circle", label: "Justo"    },
    generous: { color: "text-blue-600",   bg: "bg-blue-50 border-blue-100",   icon: "fi-rr-star",         label: "Competitivo" },
  };

  return (
    <div className="space-y-3">
      {/* Input de precio */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">$</div>
        <input
          type="number" min="0"
          placeholder={priceData ? priceData.suggestedPrice.toLocaleString("es-CO") : "0"}
          className={`w-full pl-8 pr-24 py-3.5 border-[1.5px] rounded-2xl bg-white text-sm font-medium outline-none transition-all
            ${error ? "border-red-400 focus:border-red-500" : status === "low" ? "border-red-300 focus:border-red-400" : status === "fair" ? "border-green-300 focus:border-green-400" : "border-gray-200 focus:border-[#E26000]"}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loading && <div className="w-4 h-4 border-2 border-gray-200 border-t-[#E26000] rounded-full animate-spin" />}
          {status && !loading && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig[status].bg} ${statusConfig[status].color}`}>
              {statusConfig[status].label}
            </span>
          )}
          <span className="text-xs text-gray-400 font-medium">COP</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 flex items-center gap-1"><i className="fi fi-rr-exclamation text-[10px]" /> {error}</p>}

      {/* Panel de análisis IA */}
      {analyzed && priceData && (
        <div className="bg-[#1C1712] rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <img src={Mascota} alt="" className="w-6 h-6 object-cover rounded-full" />
            <p className="text-xs font-bold text-[#E26000] uppercase tracking-widest">Análisis de mercado · IA</p>
          </div>

          {/* Rango visual */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-white/40">
              <span>Mínimo</span><span>Sugerido</span><span>Máximo</span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full">
              {/* Rango verde */}
              <div className="absolute top-0 h-full rounded-full bg-gradient-to-r from-green-500/50 to-green-400/50"
                style={{
                  left:  `${Math.max(0, ((priceData.minPrice - priceData.minPrice * 0.5) / (priceData.maxPrice * 1.5 - priceData.minPrice * 0.5)) * 100)}%`,
                  width: `${((priceData.maxPrice - priceData.minPrice) / (priceData.maxPrice * 1.5 - priceData.minPrice * 0.5)) * 100}%`,
                }} />
              {/* Indicador del valor actual */}
              {numVal > 0 && (
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all"
                  style={{
                    left: `${Math.min(98, Math.max(2, ((numVal - priceData.minPrice * 0.5) / (priceData.maxPrice * 1.5 - priceData.minPrice * 0.5)) * 100))}%`,
                    background: status === "low" ? "#ef4444" : status === "generous" ? "#3b82f6" : "#22c55e",
                  }} />
              )}
            </div>
            <div className="flex justify-between text-[11px] text-white/60 font-medium">
              <span>${priceData.minPrice.toLocaleString("es-CO")}</span>
              <span className="text-[#E26000] font-bold">${priceData.suggestedPrice.toLocaleString("es-CO")}</span>
              <span>${priceData.maxPrice.toLocaleString("es-CO")}</span>
            </div>
          </div>

          {/* Contexto de mercado */}
          <p className="text-xs text-white/50 leading-relaxed">{priceData.marketContext}</p>

          {/* Mensaje según el valor ingresado */}
          {numVal > 0 && status && (
            <div className={`rounded-xl px-3 py-2.5 border text-xs leading-relaxed
              ${status === "low"      ? "bg-red-500/10 border-red-500/30 text-red-300" : ""}
              ${status === "fair"     ? "bg-green-500/10 border-green-500/30 text-green-300" : ""}
              ${status === "generous" ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : ""}`}>
              <i className={`fi ${statusConfig[status].icon} mr-1.5`} />
              {status === "low"      && priceData.warnings?.tooLow}
              {status === "fair"     && priceData.warnings?.fair}
              {status === "generous" && priceData.warnings?.generous}
            </div>
          )}

          {/* Botón para usar sugerido */}
          {status === "low" && (
            <button
              type="button"
              onClick={() => onChange(String(priceData.suggestedPrice))}
              className="w-full py-2 text-xs font-bold text-[#E26000] bg-[#E26000]/10 border border-[#E26000]/30 rounded-xl cursor-pointer hover:bg-[#E26000]/20 transition-all"
            >
              Usar precio sugerido: ${priceData.suggestedPrice.toLocaleString("es-CO")} COP
            </button>
          )}
        </div>
      )}

      {loading && !analyzed && (
        <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
          <div className="w-3 h-3 border border-gray-300 border-t-[#E26000] rounded-full animate-spin" />
          Analizando mercado laboral...
        </div>
      )}
    </div>
  );
}

// ── Análisis contextual del chat ─────────────────────────────────────────────
function ChatInsights({ info, messages }) {
  const [insights, setInsights]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    // Regenerar cada 2 mensajes del usuario
    const userMsgs = messages.filter((m) => m.role === "user").length;
    if (userMsgs === lastCount || userMsgs < 1) return;
    setLastCount(userMsgs);

    const run = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API}/api/ai/chat`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            model:     "claude-haiku-4-5-20251001",
            max_tokens: 600,
            messages:  [{ role: "user", content: CHAT_ANALYSIS_PROMPT(info, messages) }],
          }),
        });
        const data  = await res.json();
        const text  = data.content?.[0]?.text || "[]";
        const clean = text.replace(/```json|```/g, "").trim();
        setInsights(JSON.parse(clean));
      } catch { /* silencioso */ }
      setLoading(false);
    };
    run();
  }, [messages.length]);

  const TIPO = {
    advertencia: { icon: "fi-rr-exclamation",  bg: "bg-amber-50 border-amber-200",  txt: "text-amber-700",  dot: "bg-amber-400" },
    consejo:     { icon: "fi-rr-bulb",          bg: "bg-blue-50 border-blue-100",    txt: "text-blue-700",   dot: "bg-blue-400"  },
    positivo:    { icon: "fi-rr-check-circle",  bg: "bg-green-50 border-green-100",  txt: "text-green-700",  dot: "bg-green-400" },
    critico:     { icon: "fi-rr-shield-exclamation", bg: "bg-red-50 border-red-100", txt: "text-red-700",    dot: "bg-red-400"   },
  };

  if (messages.filter((m) => m.role === "user").length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Análisis en tiempo real</p>
        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
            <i className="fi fi-rr-comment-dots text-gray-300 text-lg" />
          </div>
          <p className="text-xs text-gray-400">Responde al asistente para ver recomendaciones contextuales</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Análisis · IA</p>
        {loading && <div className="w-3 h-3 border border-gray-200 border-t-[#E26000] rounded-full animate-spin" />}
      </div>

      {insights.length === 0 && !loading && (
        <p className="text-xs text-gray-400 text-center py-3">Analizando la conversación...</p>
      )}

      <div className="space-y-2.5">
        {insights.map((ins, i) => {
          const s = TIPO[ins.tipo] || TIPO.consejo;
          return (
            <div key={i} className={`rounded-xl border p-3 ${s.bg}`}>
              <div className="flex items-start gap-2">
                <i className={`fi ${s.icon} text-sm ${s.txt} shrink-0 mt-0.5`} />
                <div>
                  <p className={`text-[11px] font-bold mb-0.5 ${s.txt}`}>{ins.titulo}</p>
                  <p className={`text-xs leading-relaxed ${s.txt} opacity-80`}>{ins.texto}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function CrearProyecto() {
  const navigate   = useNavigate();
  const { token }  = useAuth();

  const [step, setStep]   = useState(1);
  const [info, setInfo]   = useState({
    title: "", area: "", level: "", description: "",
    modalidad: "remoto", pago: "", archivoNombre: "",
  });
  const [archivoBase64, setArchivoBase64] = useState(null);
  const [archivoMime, setArchivoMime]     = useState(null);
  const [infoErrors, setInfoErrors]       = useState({});

  const [messages, setMessages]       = useState([]);
  const [userInput, setUserInput]     = useState("");
  const [adjunto, setAdjunto]         = useState(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [chatDone, setChatDone]       = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [brief, setBrief]             = useState(null);
  const [generating, setGenerating]   = useState(false);
  const [publishing, setPublishing]   = useState(false);
  const [publishingMsg, setPublishingMsg] = useState("Publicando...");
  const [toast, setToast]             = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);
  const chatFileRef    = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, aiLoading]);

  const validateInfo = () => {
    const e = {};
    if (!info.title.trim())       e.title       = "Requerido";
    if (!info.area)               e.area        = "Selecciona un área";
    if (!info.level)              e.level       = "Selecciona el nivel";
    if (!info.description.trim()) e.description = "Describe el proyecto";
    if (!info.pago || parseInt(info.pago) <= 0) e.pago = "Define una compensación para continuar";
    setInfoErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleArchivoStep1 = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setArchivoBase64(b64);
    setArchivoMime(file.type);
    setInfo((p) => ({ ...p, archivoNombre: file.name }));
  };

  const handleArchivoChat = (e) => {
    const file = e.target.files?.[0];
    if (file) setAdjunto(file);
  };

  const startChat = async () => {
    if (!validateInfo()) return;
    setStep(2);
    if (messages.length > 0) return;
    setAiLoading(true);
    try {
      let userContent = [{ type: "text", text: "Hola, quiero crear un proyecto para Impulso." }];
      if (archivoBase64) {
        const block = archivoMime?.startsWith("image/")
          ? { type: "image",    source: { type: "base64", media_type: archivoMime, data: archivoBase64 } }
          : { type: "document", source: { type: "base64", media_type: "application/pdf", data: archivoBase64 } };
        userContent.unshift(block);
      }
      const res  = await fetch(`${API}/api/ai/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          model:     "claude-sonnet-4-20250514",
          max_tokens: 1200,
          system:    SYSTEM_PROMPT(info, brief),
          messages:  [{ role: "user", content: userContent }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "Cuéntame más sobre el proyecto. ¿Cuál es el entregable principal?";
      setMessages([{ role: "ai", content: `¡Hola! Soy tu asistente de Impulso 👋 Voy a ayudarte a construir un brief atractivo.\n\n${text}` }]);
      setQuestionCount(1);
    } catch {
      setMessages([{ role: "ai", content: "¡Hola! Comencemos. ¿Cuál es el entregable principal que esperas recibir al finalizar el proyecto?" }]);
      setQuestionCount(1);
    }
    setAiLoading(false);
  };

  const sendMessage = async () => {
    if ((!userInput.trim() && !adjunto) || aiLoading) return;
    const userMsg = userInput.trim();
    setUserInput("");

    let userContent;
    let displayContent = userMsg || "(archivo adjunto)";

    if (adjunto) {
      const b64  = await fileToBase64(adjunto);
      const mime = adjunto.type;
      const block = mime.startsWith("image/")
        ? { type: "image",    source: { type: "base64", media_type: mime, data: b64 } }
        : { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } };
      userContent    = [block, ...(userMsg ? [{ type: "text", text: userMsg }] : [])];
      displayContent = `📎 ${adjunto.name}${userMsg ? `\n${userMsg}` : ""}`;
      setAdjunto(null);
    } else {
      userContent = userMsg;
    }

    const newMessages = [...messages, { role: "user", content: displayContent }];
    setMessages(newMessages);
    setAiLoading(true);

    try {
      const apiMessages = newMessages.map((m, i) => ({
        role:    m.role === "ai" ? "assistant" : "user",
        content: i === newMessages.length - 1 && userContent !== displayContent ? userContent : m.content,
      }));
      const res  = await fetch(`${API}/api/ai/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          model:     "claude-sonnet-4-20250514",
          max_tokens: 1200,
          system:    SYSTEM_PROMPT(info, brief),
          messages:  apiMessages,
        }),
      });
      const data    = await res.json();
      const aiText  = data.content?.[0]?.text || "";

      if (aiText.includes("[GENERAR_BRIEF]")) {
        const cleanText = aiText.replace("[GENERAR_BRIEF]", "").trim();
        setMessages((prev) => [...prev, { role: "ai", content: cleanText }]);
        setChatDone(true);
        setTimeout(() => generateBrief([...newMessages, { role: "ai", content: cleanText }]), 800);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: aiText }]);
        setQuestionCount((p) => p + 1);
      }
    } catch {
      const fallback = questionCount >= 5
        ? "¡Perfecto! Creo que tengo todo. [GENERAR_BRIEF]"
        : "Entendido. ¿Hay algo más que el candidato deba saber?";
      setMessages((prev) => [...prev, { role: "ai", content: fallback }]);
      if (questionCount >= 5) setChatDone(true);
      setQuestionCount((p) => p + 1);
    }
    setAiLoading(false);
  };

  const generateBrief = async (history) => {
    setGenerating(true);
    try {
      const textHistory = history.map((m) => ({
        role:    m.role === "ai" ? "assistant" : "user",
        content: typeof m.content === "string" ? m.content : "[archivo adjunto]",
      }));
      const res  = await fetch(`${API}/api/ai/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          model:     "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages:  [{ role: "user", content: BRIEF_PROMPT(info, textHistory) }],
        }),
      });
      const data  = await res.json();
      const text  = data.content?.[0]?.text || "{}";
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

  const volverAlChat = () => {
    setChatDone(false);
    setStep(2);
    if (brief) {
      setMessages((prev) => [...prev, { role: "ai", content: "He generado un borrador del brief. Si quieres ajustar algo, cuéntame." }]);
    }
  };

  const publishJob = async (status) => {
    setPublishing(true);
    setPublishingMsg("Generando etapas con IA...");
    try {
      let steps        = [];
      let totalDuration = "3 semanas";
      try {
        const stepsRes  = await fetch(`${API}/api/ai/chat`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            model:     "claude-haiku-4-5-20251001",
            max_tokens: 1500,
            messages:  [{ role: "user", content: STEPS_PROMPT(info, brief) }],
          }),
        });
        const stepsData = await stepsRes.json();
        const stepsText = stepsData.content?.[0]?.text || "[]";
        const clean     = stepsText.replace(/```json|```/g, "").trim();
        steps           = JSON.parse(clean);
        const dias      = steps.reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0);
        if (dias > 0) totalDuration = dias <= 7 ? "1 semana" : dias <= 14 ? "2 semanas" : dias <= 21 ? "3 semanas" : dias <= 30 ? "1 mes" : "2 meses";
      } catch {
        steps = (brief.deliverables || []).map((d, i) => ({
          title:       `Etapa ${i + 1}: ${d}`,
          duration:    "5 días",
          description: `Desarrolla y entrega: ${d}.`,
          tasks:       [d, "Documenta el proceso", "Presenta resultados"],
          criteria:    ["Calidad del entregable", "Claridad", "Cumplimiento"],
        }));
      }

      setPublishingMsg("Guardando proyecto...");
      const res  = await fetch(`${API}/api/jobs`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          title: info.title, summary: brief.summary,
          profile_area: info.area, duration: totalDuration,
          modalidad: info.modalidad, pago: info.pago || null,
          status, steps,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al publicar.");

      setToast({ type: "success", msg: status === "published" ? "¡Proyecto publicado! 🎉" : "Guardado como borrador" });
      setTimeout(() => { setToast(null); navigate("/empresa"); }, 2500);
    } catch (err) {
      setToast({ type: "error", msg: err.message || "Error al guardar." });
      setTimeout(() => setToast(null), 3000);
    }
    setPublishing(false);
    setPublishingMsg("Publicando...");
  };

  const progressItems = [
    { label: "Entregable principal",   done: questionCount > 0 },
    { label: "Herramientas requeridas", done: questionCount > 1 },
    { label: "Problema que resuelve",  done: questionCount > 2 },
    { label: "Materiales y apoyo",     done: questionCount > 3 },
    { label: "Criterios de éxito",     done: questionCount > 4 },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F8] font-sans">

      {/* Stepper */}
      <div className="bg-[#1C1712] border-b border-white/5 px-8 flex items-center gap-1">
        {[
          { n: 1, label: "Información básica" },
          { n: 2, label: "Construir con IA" },
          { n: 3, label: "Revisar y publicar" },
        ].map((s) => (
          <div key={s.n} className="flex items-center">
            <div className="flex items-center gap-2.5 py-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step === s.n ? "text-white"    : step > s.n ? "bg-green-500 text-white" : "bg-white/10 text-white/40"}`}
                style={step === s.n ? { background: "linear-gradient(135deg,#E26000,#FF8C3A)" } : {}}>
                {step > s.n ? <CheckIcon /> : s.n}
              </div>
              <span className={`text-sm font-medium transition-all ${step === s.n ? "text-white" : step > s.n ? "text-green-400" : "text-white/30"}`}>{s.label}</span>
            </div>
            {s.n < 3 && <span className="text-white/20 text-lg mx-4">›</span>}
          </div>
        ))}

        <button onClick={() => navigate("/empresa")}
          className="ml-auto flex items-center gap-2 text-white/40 hover:text-white text-sm cursor-pointer bg-transparent border-none transition-colors">
          <i className="fi fi-rr-arrow-left text-xs" /> Volver
        </button>
      </div>

      <main className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">

        {/* ── PASO 1 ─────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="grid grid-cols-[1fr_380px] gap-6 max-lg:grid-cols-1">

            {/* Formulario principal */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Header del form */}
              <div className="bg-[#1C1712] px-8 py-7">
                <div className="flex items-center gap-3 mb-2">
                  <img src={Mascota} alt="" className="w-10 h-10 object-cover rounded-full" />
                  <div>
                    <h2 className="text-white font-bold text-lg leading-tight">Cuéntanos sobre tu proyecto</h2>
                    <p className="text-white/40 text-xs">La IA construirá el brief completo en el siguiente paso</p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-7 space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Título del proyecto <span className="text-[#E26000]">*</span>
                  </label>
                  <input
                    className={`w-full px-4 py-3 border-[1.5px] rounded-2xl bg-gray-50 text-sm font-medium outline-none transition-all focus:border-[#E26000] focus:bg-white ${infoErrors.title ? "border-red-400" : "border-gray-200"}`}
                    placeholder="Ej: Diagnóstico de redes sociales para startup"
                    value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })}
                  />
                  {infoErrors.title && <p className="text-xs text-red-500 mt-1">{infoErrors.title}</p>}
                </div>

                {/* Área + Nivel */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Área <span className="text-[#E26000]">*</span>
                    </label>
                    <select
                      className={`w-full px-4 py-3 border-[1.5px] rounded-2xl bg-gray-50 text-sm outline-none cursor-pointer appearance-none transition-all focus:border-[#E26000] focus:bg-white ${infoErrors.area ? "border-red-400" : "border-gray-200"}`}
                      value={info.area} onChange={(e) => setInfo({ ...info, area: e.target.value })}>
                      <option value="">Selecciona el área</option>
                      {AREAS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                    {infoErrors.area && <p className="text-xs text-red-500 mt-1">{infoErrors.area}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Nivel <span className="text-[#E26000]">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      {LEVELS.map((l) => (
                        <button key={l} type="button" onClick={() => setInfo({ ...info, level: l })}
                          className={`flex-1 py-2.5 rounded-2xl text-xs font-bold cursor-pointer border transition-all
                            ${info.level === l ? "border-[#E26000] text-[#E26000] bg-[#FEF0E8]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-[#E26000]/50"}`}>
                          {l === "Explorador" ? "🌱" : l === "Practicante" ? "🚀" : "⭐"}<br />
                          <span className="text-[9px] font-medium leading-none">{l}</span>
                        </button>
                      ))}
                    </div>
                    {infoErrors.level && <p className="text-xs text-red-500 mt-1">{infoErrors.level}</p>}
                  </div>
                </div>

                {/* Modalidad */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Modalidad</label>
                  <div className="flex gap-2">
                    {[
                      { key: "remoto",     label: "🌐 Remoto"     },
                      { key: "presencial", label: "🏢 Presencial" },
                      { key: "hibrido",    label: "🔀 Híbrido"    },
                    ].map((m) => (
                      <button key={m.key} type="button" onClick={() => setInfo({ ...info, modalidad: m.key })}
                        className={`flex-1 py-2.5 rounded-2xl text-sm font-medium cursor-pointer border transition-all
                          ${info.modalidad === m.key ? "border-[#E26000] text-[#E26000] bg-[#FEF0E8] font-bold" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-[#E26000]/50"}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Descripción breve <span className="text-[#E26000]">*</span>
                  </label>
                  <textarea
                    className={`w-full px-4 py-3 border-[1.5px] rounded-2xl bg-gray-50 text-sm outline-none resize-y min-h-24 leading-relaxed transition-all focus:border-[#E26000] focus:bg-white ${infoErrors.description ? "border-red-400" : "border-gray-200"}`}
                    placeholder="En 2-3 líneas, ¿de qué trata el proyecto? La IA profundizará en el siguiente paso..."
                    value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })}
                  />
                  {infoErrors.description && <p className="text-xs text-red-500 mt-1">{infoErrors.description}</p>}
                </div>

                {/* Archivo */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Documento de referencia <span className="text-gray-300 font-normal normal-case">· opcional</span>
                  </label>
                  <div onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-4 py-3 border-[1.5px] border-dashed border-gray-200 rounded-2xl bg-gray-50 cursor-pointer hover:border-[#E26000]/50 hover:bg-[#FEF0E8]/30 transition-all">
                    <i className="fi fi-rr-paperclip text-gray-400" />
                    <span className="text-sm text-gray-400 flex-1">{info.archivoNombre || "PDF o imagen de referencia..."}</span>
                    {info.archivoNombre && (
                      <button onClick={(e) => { e.stopPropagation(); setArchivoBase64(null); setArchivoMime(null); setInfo((p) => ({ ...p, archivoNombre: "" })); }}
                        className="text-red-400 text-xs cursor-pointer bg-transparent border-none">✕</button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleArchivoStep1} />
                </div>

                <button onClick={startChat}
                  className="w-full py-4 text-white font-bold text-sm rounded-2xl border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(226,96,0,0.3)]"
                  style={{ background: "linear-gradient(135deg,#E26000,#FF8C3A)" }}>
                  Continuar con IA →
                </button>
              </div>
            </div>

            {/* Panel lateral: compensación */}
            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                    style={{ background: "linear-gradient(135deg,#E26000,#FF8C3A)" }}>
                    <i className="fi fi-rr-money" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Compensación</p>
                    <p className="text-xs text-gray-400">La IA analiza el mercado colombiano</p>
                  </div>
                </div>

                <PriceAdvisor
                  info={info}
                  value={info.pago}
                  onChange={(v) => setInfo({ ...info, pago: v })}
                  error={infoErrors.pago}
                />
              </div>

              <div className="bg-[#1C1712] rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <img src={Mascota} alt="" className="w-7 h-7 object-cover rounded-full" />
                  <p className="text-xs font-bold text-[#E26000] uppercase tracking-widest">Tip de Impulso</p>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  Proyectos con compensación justa reciben <strong className="text-white/80">3x más postulaciones</strong> de calidad. La IA analiza el mercado colombiano en tiempo real para ayudarte.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── PASO 2: CHAT ──────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="grid grid-cols-[1fr_340px] gap-5 max-lg:grid-cols-1">

            {/* Chat */}
            <div className="bg-white rounded-3xl border border-gray-100 flex flex-col shadow-sm overflow-hidden" style={{ height: "600px" }}>
              {/* Header */}
              <div className="bg-[#1C1712] px-6 py-4 flex items-center gap-3">
                <img src={Mascota} alt="" className="w-10 h-10 object-cover rounded-full" />
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">Asistente Impulso</p>
                  <p className="text-white/40 text-xs">Construyendo el brief de tu proyecto</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> En línea
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#F7F7F8]" style={{ scrollbarWidth: "thin" }}>
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${m.role === "ai" ? "bg-white shadow-sm" : "bg-gray-200 text-gray-600"}`}>
                      {m.role === "ai" ? <img src={Mascota} alt="" className="w-full h-full object-cover rounded-full" /> : "😎"}
                    </div>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line
                      ${m.role === "ai" ? "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm" : "text-white rounded-br-sm"}`}
                      style={m.role === "user" ? { background: "linear-gradient(135deg,#E26000,#FF8C3A)" } : {}}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <img src={Mascota} alt="" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                      {[0, 200, 400].map((d) => <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                  </div>
                )}
                {generating && (
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <img src={Mascota} alt="" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-gray-600">✨ Generando el brief completo...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Preview adjunto */}
              {adjunto && (
                <div className="px-5 pt-2 flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#FEF0E8] border border-[#E26000]/20 rounded-xl px-3 py-1.5 text-xs text-[#E26000] font-medium">
                    <i className="fi fi-rr-paperclip text-[10px]" /> {adjunto.name}
                    <button onClick={() => setAdjunto(null)} className="ml-1 text-red-400 cursor-pointer bg-transparent border-none">✕</button>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="px-5 py-4 border-t border-gray-100 bg-white flex gap-2 items-end">
                <button onClick={() => chatFileRef.current?.click()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 hover:border-[#E26000] hover:text-[#E26000] transition-all cursor-pointer shrink-0">
                  <i className="fi fi-rr-file-import text-sm" />
                </button>
                <input ref={chatFileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleArchivoChat} />

                <textarea
                  className="flex-1 px-4 py-2.5 border-[1.5px] border-gray-200 rounded-2xl bg-gray-50 text-sm outline-none transition-all focus:border-[#E26000] focus:bg-white disabled:opacity-50 resize-none min-h-10 max-h-28"
                  placeholder={chatDone ? "Brief generado — puedes seguir ajustando" : "Responde aquí... (Enter para enviar)"}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  disabled={aiLoading}
                  rows={1}
                />
                <button onClick={sendMessage} disabled={aiLoading || (!userInput.trim() && !adjunto)}
                  className="w-9 h-9 rounded-xl border-none cursor-pointer flex items-center justify-center shrink-0 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg,#E26000,#FF8C3A)" }}>
                  <i className="fi fi-sr-paper-plane-launch text-white text-sm" />
                </button>
              </div>

              {chatDone && brief && (
                <div className="px-5 pb-4">
                  <button onClick={() => setStep(3)}
                    className="w-full py-2.5 bg-green-500 text-white font-bold text-sm rounded-2xl border-none cursor-pointer hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                    <i className="fi fi-rr-check-circle" /> Ver preview del proyecto
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar del chat */}
            <div className="flex flex-col gap-4">
              {/* Temas cubiertos */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Temas cubiertos</p>
                {progressItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-3 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 transition-all
                      ${item.done ? "bg-green-500" : questionCount === i + 1 ? "" : "bg-gray-100 text-gray-400"}`}
                      style={!item.done && questionCount === i + 1 ? { background: "linear-gradient(135deg,#E26000,#FF8C3A)" } : {}}>
                      {item.done ? <CheckIcon /> : <span className={questionCount === i + 1 ? "text-white font-bold" : "text-gray-400"}>{i + 1}</span>}
                    </div>
                    <span className={item.done ? "text-green-600 text-xs" : questionCount === i + 1 ? "text-gray-900 font-semibold text-xs" : "text-gray-400 text-xs"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Análisis contextual */}
              <ChatInsights info={info} messages={messages} />
            </div>
          </div>
        )}

        {/* ── PASO 3: PREVIEW ───────────────────────────────────────────────── */}
        {step === 3 && brief && (
          <div className="grid grid-cols-[1fr_320px] gap-5 max-lg:grid-cols-1">

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Banner del proyecto */}
              <div className="bg-[#1C1712] px-8 pt-8 pb-7 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#E26000]/10 blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-[#E26000]/20 text-[#E26000] text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4 border border-[#E26000]/30">
                    ✨ Generado por IA
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-4">{info.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: "fi-rr-tag",      val: info.area                     },
                      { icon: "fi-rr-user",      val: info.level                    },
                      { icon: "fi-rr-clock",     val: "Duración por IA"             },
                    ].map(({ icon, val }) => (
                      <span key={val} className="flex items-center gap-1.5 text-xs text-white/60 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                        <i className={`fi ${icon} text-[#E26000] text-[10px]`} /> {val}
                      </span>
                    ))}
                    <span className={`text-xs px-3 py-1.5 rounded-full border font-medium
                      ${info.modalidad === "presencial" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : info.modalidad === "hibrido" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-green-500/20 text-green-300 border-green-500/30"}`}>
                      {info.modalidad === "presencial" ? "🏢 Presencial" : info.modalidad === "hibrido" ? "🔀 Híbrido" : "🌐 Remoto"}
                    </span>
                    {info.pago && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full font-bold">
                        💰 ${parseInt(info.pago).toLocaleString("es-CO")} COP
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-8 py-7 space-y-6">
                {[
                  { title: "Descripción del proyecto", content: brief.summary     },
                  { title: "Objetivo",                  content: brief.objective   },
                  { title: "Contexto",                  content: brief.context     },
                  { title: "Apoyo al candidato",        content: brief.support     },
                ].map(({ title, content }) => (
                  <div key={title}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{title}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
                  </div>
                ))}

                {[
                  { title: "Entregables",          items: brief.deliverables },
                  { title: "Habilidades requeridas", items: brief.skills      },
                ].map(({ title, items }) => (
                  <div key={title}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{title}</p>
                    <ul className="space-y-1.5">
                      {items?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-[#E26000] font-bold shrink-0 mt-0.5">→</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar publicar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-bold mb-4">Resumen</p>
                {[
                  { label: "Área",       value: info.area   },
                  { label: "Nivel",      value: info.level  },
                  { label: "Modalidad",  value: info.modalidad === "presencial" ? "Presencial" : info.modalidad === "hibrido" ? "Híbrido" : "Remoto" },
                  ...(info.pago ? [{ label: "Compensación", value: `$${parseInt(info.pago).toLocaleString("es-CO")} COP` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center mb-2.5">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-semibold text-gray-700">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-bold mb-1">¿Todo se ve bien?</p>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Puedes publicarlo ahora o guardarlo como borrador.</p>
                <button onClick={() => publishJob("published")} disabled={publishing}
                  className="w-full py-3.5 text-white font-bold text-sm rounded-2xl border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(226,96,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-2.5"
                  style={{ background: "linear-gradient(135deg,#E26000,#FF8C3A)" }}>
                  {publishing ? <span className="flex items-center justify-center gap-2"><i className="fi fi-rr-spinner animate-spin" /> {publishingMsg}</span> : "Publicar proyecto"}
                </button>
                <button onClick={() => publishJob("draft")} disabled={publishing}
                  className="w-full py-2.5 bg-transparent text-gray-500 border border-gray-200 rounded-2xl text-sm font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50 transition-all">
                  Guardar como borrador
                </button>
              </div>

              <div className="bg-[#FEF0E8] rounded-2xl border border-[#E26000]/15 p-5">
                <p className="text-xs text-gray-600 leading-relaxed mb-3">🔁 ¿Quieres ajustar algo? La conversación se conserva.</p>
                <button onClick={volverAlChat}
                  className="w-full py-2.5 bg-transparent text-gray-600 border border-gray-200 rounded-2xl text-sm font-medium cursor-pointer hover:bg-white transition-all">
                  Volver al chat
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-2xl z-50 animate-[slideUp_0.3s_ease]
          ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <Footer />
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}