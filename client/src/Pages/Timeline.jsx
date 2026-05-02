import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import Footer from "../Components/footer";

const API = import.meta.env.VITE_API_URL;

const STEP_STATUS = {
  done:    { label: "Completado",  pill: "bg-green-50 text-green-600 border-green-200",      },
  current: { label: "En progreso", pill: "bg-[#FEF0E8] text-[#E26000] border-[#E26000]/30",  },
  locked:  { label: "Bloqueado",   pill: "bg-gray-50 text-gray-400 border-gray-200",          },
};

/* ── Skeleton ─────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-3xl border border-gray-100 p-8">
          <div className="flex gap-5">
            <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Progress bar ─────────────────────────────────────────────────────── */
function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="relative overflow-hidden bg-[#1C1712] rounded-3xl p-7 mb-8 shadow-xl">
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#E26000]/15 blur-2xl pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between mb-5">
        <div>
          <p className="text-white font-bold">Progreso del proyecto</p>
          <p className="text-white/40 text-sm mt-0.5">{completed} de {total} etapas completadas</p>
        </div>
        <span className="text-4xl font-black text-[#E26000]">{pct}%</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#E26000,#FF8C3A)" }} />
      </div>
      <div className="flex justify-between">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < completed ? "bg-[#E26000]" : "bg-white/20"}`} />
        ))}
      </div>
      {pct === 100 && (
        <p className="mt-4 text-[#E26000] text-sm font-semibold flex items-center gap-2">
          <i className="fi fi-rr-check-circle" /> ¡Proyecto completado! Espera el feedback final.
        </p>
      )}
    </div>
  );
}

/* ── FileUpload ───────────────────────────────────────────────────────── */
function FileUpload({ files, onChange }) {
  const inputRef = useRef(null);

  const handleFiles = (e) => onChange((prev) => [...prev, ...Array.from(e.target.files)]);
  const remove = (idx) => onChange((prev) => prev.filter((_, i) => i !== idx));
  const fmt = (b) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(1)}MB`;

  return (
    <div className="mt-5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        Archivos adjuntos <span className="normal-case font-normal text-gray-300">(opcional)</span>
      </p>

      <button type="button" onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-200 hover:border-[#E26000]/50 hover:bg-[#FEF0E8]/20 rounded-2xl p-7 flex flex-col items-center gap-3 cursor-pointer bg-transparent transition-all group">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 group-hover:bg-[#FEF0E8] flex items-center justify-center transition-all">
          <i className="fi fi-rr-cloud-upload text-3xl text-gray-300 group-hover:text-[#E26000] transition-colors" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500 group-hover:text-[#E26000] transition-colors">
            Haz clic para adjuntar archivos
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, imágenes, docs, ZIP · Máx. 10 MB c/u</p>
        </div>
      </button>

      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.zip,.txt" />

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-[#FEF0E8] flex items-center justify-center shrink-0">
                <i className="fi fi-rr-file text-[#E26000]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{f.name}</p>
                <p className="text-[10px] text-gray-400">{fmt(f.size)}</p>
              </div>
              <button type="button" onClick={() => remove(i)}
                className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer text-xl leading-none transition-colors">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pega este componente StepChat ANTES del componente StepCard en Timeline.jsx ──

function StepChat({ step, applicationId, currentUser, onClose }) {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const messagesEndRef           = useRef(null);

  // Cargar mensajes al abrir
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${API}/api/messages/${applicationId}/${step.step_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setMessages(data.messages || []);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [applicationId, step.step_id]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic update
    const tempMsg = {
      id: Date.now(),
      message: text,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      created_at: new Date().toISOString(),
      temp: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`${API}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          application_id: applicationId,
          step_id: step.step_id,
          message: text,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m.temp ? data.message : m)));
      }
    } catch {
      // Revertir si falla
      setMessages((prev) => prev.filter((m) => !m.temp));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return "Hoy";
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  };

  // Agrupar mensajes por fecha
  const grouped = messages.reduce((acc, msg) => {
    const key = new Date(msg.created_at).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden"
        style={{ height: "560px" }}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #1C1712, #2a2016)" }}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #E26000, #FF8C3A)" }}>
            <i className="fi fi-rr-comment-dots" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{step.step_title}</p>
            <p className="text-white/40 text-xs">Mensajería de etapa</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all border-none cursor-pointer"
          >
            <i className="fi fi-rr-cross text-xs" />
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-[#F7F7F8]"
          style={{ scrollbarWidth: "thin" }}>

          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#E26000] rounded-full animate-spin" />
                Cargando mensajes...
              </div>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                <i className="fi fi-rr-comment text-2xl text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500">Sin mensajes aún</p>
                <p className="text-xs text-gray-400 mt-1">Usa este chat para resolver dudas sobre esta etapa</p>
              </div>
            </div>
          )}

          {!loading && Object.entries(grouped).map(([dateKey, msgs]) => (
            <div key={dateKey}>
              {/* Separador de fecha */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                  {formatDate(msgs[0].created_at)}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {msgs.map((msg, i) => {
                const isMe = msg.sender_id === currentUser.id;
                const showName = !isMe && (i === 0 || msgs[i - 1]?.sender_id !== msg.sender_id);

                return (
                  <div key={msg.id} className={`flex gap-2 mb-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                    {/* Avatar solo si no es el mismo sender consecutivo */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto
                      ${isMe ? "bg-[#E26000] text-white" : "bg-gray-200 text-gray-600"}`}>
                      {msg.sender_name?.[0]?.toUpperCase() || "?"}
                    </div>

                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      {showName && !isMe && (
                        <span className="text-[10px] text-gray-400 font-medium mb-1 ml-1">
                          {msg.sender_name}
                          {msg.sender_role === "empresa" && (
                            <span className="ml-1 text-[#E26000]">· Empresa</span>
                          )}
                        </span>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isMe
                          ? "text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm"
                        }
                        ${msg.temp ? "opacity-70" : ""}`}
                        style={isMe ? { background: "linear-gradient(135deg, #E26000, #FF8C3A)" } : {}}>
                        {msg.message}
                      </div>
                      <span className={`text-[10px] text-gray-400 mt-1 ${isMe ? "mr-1" : "ml-1"}`}>
                        {formatTime(msg.created_at)}
                        {msg.temp && " · Enviando..."}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2 items-end">
          <input
            className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-[#E26000] focus:bg-white transition-all resize-none"
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-2xl border-none cursor-pointer flex items-center justify-center shrink-0 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #E26000, #FF8C3A)" }}
          >
            <i className="fi fi-rr-paper-plane text-white text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── StepCard ─────────────────────────────────────────────────────────── */
function StepCard({ step, index, onSubmit, submitting }) {
  // Al inicio de StepCard agrega:
const [chatOpen, setChatOpen] = useState(false);
const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [answer, setAnswer] = useState("");
  const [files, setFiles]   = useState([]);
  const [error, setError]   = useState("");
  const textareaRef = useRef(null);

  const tasks    = step.tasks    ? (typeof step.tasks    === "string" ? JSON.parse(step.tasks)    : step.tasks)    : [];
  const criteria = step.criteria ? (typeof step.criteria === "string" ? JSON.parse(step.criteria) : step.criteria) : [];

  const isDone    = !!step.submission_id;
  const isLocked  = !isDone && !step.unlocked;
  const isCurrent = !isDone && step.unlocked;
  const st = isDone ? STEP_STATUS.done : isLocked ? STEP_STATUS.locked : STEP_STATUS.current;

  const handleSubmit = () => {
    if (!answer.trim()) { setError("Escribe tu respuesta antes de enviar."); textareaRef.current?.focus(); return; }
    setError("");
    onSubmit(step.step_id, answer.trim(), files);
  };

  return (
    <div className="relative flex gap-6">
      {/* Nodo + línea */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 z-10 shadow-md
          ${isDone    ? "bg-green-500 text-white ring-4 ring-green-100" : ""}
          ${isCurrent ? "text-white ring-4 ring-[#E26000]/20" : ""}
          ${isLocked  ? "bg-gray-100 text-gray-400" : ""}`}
          style={isCurrent ? { background: "linear-gradient(135deg,#E26000,#FF8C3A)" } : {}}>
          {isDone ? <i className="fi fi-rr-check" /> : <span className="text-sm">{index + 1}</span>}
        </div>
        <div className={`w-px flex-1 mt-2 ${isDone ? "bg-green-200" : "bg-gray-100"}`} style={{ minHeight: 32 }} />
      </div>

      {/* Card */}
      <div className={`flex-1 mb-7 rounded-3xl border overflow-hidden transition-all duration-300
        ${isDone    ? "bg-white border-green-100" : ""}
        ${isCurrent ? "bg-white border-[#E26000]/30 shadow-[0_12px_40px_rgba(226,96,0,0.10)]" : ""}
        ${isLocked  ? "bg-gray-50/80 border-gray-100 opacity-55" : ""}`}>

        {isCurrent && <div className="h-1.5" style={{ background: "linear-gradient(90deg,#E26000,#FF8C3A)" }} />}
        {isDone    && <div className="h-1.5 bg-green-400" />}

        {/* Cabecera */}
        <div className="px-7 pt-7 pb-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className={`font-bold text-base leading-snug ${isDone ? "text-green-700" : isCurrent ? "text-gray-900" : "text-gray-400"}`}>
              {step.step_title}
            </h3>
            <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border shrink-0 ${st.pill}`}>
              {st.label}
            </span>
          </div>
          {step.step_duration && (
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
              <i className="fi fi-rr-clock text-[10px]" /> {step.step_duration}
            </p>
          )}
          <p className={`text-sm leading-relaxed mb-6 ${isLocked ? "text-gray-400" : "text-gray-600"}`}>
            {step.step_description}
          </p>
        </div>

        {!isLocked && (
          <div className="px-7 pb-7">

            {/* Tareas */}
            {tasks.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-5 border border-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Tareas a realizar</p>
                <ul className="space-y-2.5">
                  {tasks.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="text-[#E26000] font-bold shrink-0 mt-0.5">›</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Criterios */}
            {criteria.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {criteria.map((c, i) => (
                  <span key={i} className="text-xs bg-[#FEF0E8] text-[#E26000] border border-[#E26000]/20 px-3 py-1 rounded-full font-medium">{c}</span>
                ))}
              </div>
            )}

            {/* Entrega enviada */}
            {isDone && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-green-600 mb-2">Tu entrega</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{step.answer_text}</p>
                  {step.submitted_at && (
                    <p className="text-[10px] text-gray-400 mt-3">
                      Enviado el {new Date(step.submitted_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>

                {step.feedback_text ? (
                  <div className="bg-[#1C1712] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="fi fi-rr-comment-check text-[#E26000]" />
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#F0D4C4]">Feedback de la empresa</p>
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed">{step.feedback_text}</p>
                    {step.score && (
                      <div className="flex items-center gap-1.5 mt-3">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i key={i} className={`fi fi-${i < step.score ? "sr" : "rr"}-star text-sm ${i < step.score ? "text-amber-400" : "text-white/20"}`} />
                        ))}
                        <span className="text-xs text-white/40 ml-1">{step.score}/5</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
                    <i className="fi fi-rr-clock" /> Esperando feedback de la empresa...
                  </div>
                )}
              </div>
            )}

            {/* Formulario activo */}
            {isCurrent && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2.5 block">
                  Tu respuesta / entrega
                </label>
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={(e) => { setAnswer(e.target.value); setError(""); }}
                  placeholder="Describe tu trabajo, pega un link, comparte tus conclusiones..."
                  rows={6}
                  className={`w-full px-5 py-4 border-[1.5px] rounded-2xl bg-gray-50 text-sm text-gray-900 outline-none resize-y min-h-40 leading-relaxed transition-all
                    focus:bg-white focus:shadow-[0_0_0_3px_rgba(226,96,0,0.08)]
                    ${error ? "border-red-400" : "border-gray-200 focus:border-[#E26000]"}`}
                />
                {error && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <i className="fi fi-rr-exclamation text-[10px]" /> {error}
                  </p>
                )}

                <FileUpload files={files} onChange={setFiles} />

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <p>{answer.length} caracteres</p>
                    {files.length > 0 && (
                      <p className="text-[#E26000] font-medium">
                        {files.length} archivo{files.length !== 1 ? "s" : ""} adjunto{files.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <button onClick={handleSubmit} disabled={submitting}
                    className="flex items-center gap-2.5 px-7 py-3.5 text-white font-bold text-sm rounded-2xl border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(226,96,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ background: "linear-gradient(135deg,#E26000,#FF8C3A)" }}>
                    {submitting
                      ? <><i className="fi fi-rr-spinner animate-spin" /> Enviando...</>
                      : <><i className="fi fi-rr-paper-plane" /> Enviar entrega</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
// Dentro del JSX de StepCard, al final del bloque !isLocked, 
// antes del cierre de la card agrega:
{!isLocked && (
  <div className="px-7 pb-5 pt-0 border-t border-gray-50 mt-2">
    <button
      onClick={() => setChatOpen(true)}
      className="flex items-center gap-2 text-sm font-semibold text-[#E26000] bg-[#FEF0E8] hover:bg-[#fde0cc] border border-[#E26000]/20 px-4 py-2.5 rounded-2xl transition-all cursor-pointer border-none"
    >
      <i className="fi fi-rr-comment-dots" /> Mensajería
    </button>
  </div>
)}

{chatOpen && (
  <StepChat
    step={step}
    applicationId={applicationId}
    currentUser={user}
    onClose={() => setChatOpen(false)}
  />
)}
        {isLocked && (
          <div className="px-7 pb-6 flex items-center gap-2 text-sm text-gray-400">
            <i className="fi fi-rr-lock text-xs" /> Completa la etapa anterior para desbloquear esta.
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────────────────── */
export default function Timeline() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [steps, setSteps]       = useState([]);
  const [jobInfo, setJobInfo]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]       = useState(null);

  const fetchSteps = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/submissions/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Error al cargar el timeline."); }
      const data = await res.json();
      const enriched = data.steps.map((step, i) => ({
        ...step,
        unlocked: i === 0 || !!data.steps[i - 1].submission_id,
      }));
      setSteps(enriched);
      if (data.job) setJobInfo(data.job);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API, token, applicationId]);

  useEffect(() => { if (token) fetchSteps(); }, [applicationId, token, fetchSteps]);

  const handleSubmit = async (stepId, answerText, files) => {
    setSubmitting(true);
    try {
      let res;
      if (files && files.length > 0) {
        const fd = new FormData();
        fd.append("application_id", applicationId);
        fd.append("step_id", stepId);
        fd.append("answer_text", answerText);
        files.forEach((f) => fd.append("files", f));
        res = await fetch(`${API}/api/submissions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      } else {
        res = await fetch(`${API}/api/submissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ application_id: applicationId, step_id: stepId, answer_text: answerText }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar.");
      showToast("success", "¡Entrega enviada! La siguiente etapa se ha desbloqueado.");
      await fetchSteps();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const completed = steps.filter((s) => !!s.submission_id).length;
  const total     = steps.length;
  const allDone   = completed === total && total > 0;

  if (loading) return (
    <div className="flex min-h-screen bg-[#F7F7F8]">
      <main className="ml-24 flex-1 px-10 py-10 max-w-4xl mx-auto"><Skeleton /></main>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-[#F7F7F8]">
      <main className="ml-24 flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <i className="fi fi-rr-shield-exclamation text-4xl text-gray-300 block mb-4" />
          <p className="text-gray-600 font-medium mb-1">{error}</p>
          <button onClick={() => navigate(-1)} className="text-sm text-[#E26000] underline cursor-pointer bg-transparent border-none mt-2">Volver atrás</button>
        </div>
      </main>
    </div>
  );

  return (
    <>
      <div className="flex min-h-screen bg-[#F7F7F8]">
        <main className="ml-24 flex-1 px-10 py-10">
          <div className="max-w-4xl mx-auto">

            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-7 bg-transparent border-none cursor-pointer transition-colors">
              <i className="fi fi-rr-arrow-left text-xs" /> Volver
            </button>

            <div className="mb-7">
              <p className="text-xs font-bold tracking-widest uppercase text-[#E26000] mb-1">Timeline del proyecto</p>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{jobInfo?.title || "Mi proyecto"}</h1>
              <p className="text-sm text-gray-400 mt-1.5">Completa cada etapa en orden para avanzar</p>
            </div>

            <ProgressBar completed={completed} total={total} />

            {allDone && (
              <div className="relative overflow-hidden bg-[#1C1712] rounded-3xl p-8 mb-8 border border-[#E26000]/20 text-center shadow-xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#E26000]/10 blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "linear-gradient(135deg,#E26000,#FF8C3A)" }}>
                    <i className="fi fi-sr-diploma text-3xl text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">¡Proyecto completado!</h3>
                  <p className="text-white/50 text-sm mb-5 max-w-sm mx-auto">
                    Enviaste todas las etapas. Cuando la empresa finalice su feedback podrás descargar tu certificado.
                  </p>
                  <button disabled className="px-7 py-3 text-sm font-bold rounded-2xl border-none cursor-not-allowed opacity-50 text-white"
                    style={{ background: "#E26000" }}>
                    <i className="fi fi-rr-diploma mr-2" /> Certificado pendiente
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              {steps.map((step, i) => (
               <StepCard key={step.step_id} step={step} index={i} onSubmit={handleSubmit} submitting={submitting} applicationId={applicationId} />
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-2xl z-50 animate-[slideUp_0.3s_ease]
          ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}