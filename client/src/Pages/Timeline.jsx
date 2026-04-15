import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import SideBar from "../Components/Sidebar";
import Footer from "../Components/footer";

const STEP_STATUS = {
  done:    { label: "Completado",  pill: "bg-green-50 text-green-600 border-green-200",      dot: "bg-green-500"  },
  current: { label: "En progreso", pill: "bg-orange-50 text-[#F26419] border-orange-200",    dot: "bg-[#F26419]"  },
  locked:  { label: "Bloqueado",   pill: "bg-gray-50 text-gray-400 border-gray-200",         dot: "bg-gray-200"   },
};

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">Progreso del proyecto</p>
          <p className="text-xs text-gray-400 mt-0.5">{completed} de {total} etapas completadas</p>
        </div>
        <span className="text-2xl font-black text-[#F26419]">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#F26419] to-rose-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct === 100 && (
        <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-semibold">
          <i className="fi fi-rr-check-circle text-base" />
          ¡Proyecto completado! Espera el feedback final de la empresa.
        </div>
      )}
    </div>
  );
}

function StepCard({ step, index, onSubmit, submitting }) {
  const [answer, setAnswer] = useState("");
  const [error, setError]   = useState("");
  const textareaRef         = useRef(null);

  const tasks    = step.tasks    ? (typeof step.tasks    === "string" ? JSON.parse(step.tasks)    : step.tasks)    : [];
  const criteria = step.criteria ? (typeof step.criteria === "string" ? JSON.parse(step.criteria) : step.criteria) : [];

  const isDone    = !!step.submission_id;
  const isLocked  = !isDone && !step.unlocked;
  const isCurrent = !isDone && step.unlocked;
  const st        = isDone ? STEP_STATUS.done : isLocked ? STEP_STATUS.locked : STEP_STATUS.current;

  const handleSubmit = () => {
    if (!answer.trim()) { setError("Por favor escribe tu respuesta antes de enviar."); textareaRef.current?.focus(); return; }
    setError("");
    onSubmit(step.step_id, answer.trim());
  };

  return (
    <div className="relative flex gap-5 group">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all
          ${isDone    ? "bg-green-500 text-white shadow-[0_0_0_4px_#dcfce7]" : ""}
          ${isCurrent ? "bg-[#F26419] text-white shadow-[0_0_0_4px_#fef0e8] animate-pulse" : ""}
          ${isLocked  ? "bg-gray-200 text-gray-400" : ""}`}>
          {isDone ? <i className="fi fi-rr-check text-xs" /> : index + 1}
        </div>
        <div className={`w-px flex-1 mt-2 ${isDone ? "bg-green-200" : "bg-gray-100"}`} style={{ minHeight: 24 }} />
      </div>

      <div className={`flex-1 mb-4 rounded-2xl border transition-all duration-300
        ${isDone    ? "bg-white border-green-100" : ""}
        ${isCurrent ? "bg-white border-[#F26419]/30 shadow-[0_8px_30px_rgba(242,100,25,0.12)]" : ""}
        ${isLocked  ? "bg-gray-50/60 border-gray-100 opacity-60" : ""}`}>

        <div className="p-5 pb-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={`font-semibold text-sm leading-tight ${isDone ? "text-green-700" : isCurrent ? "text-gray-900" : "text-gray-400"}`}>
              {step.step_title}
            </h3>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${st.pill}`}>
              {st.label}
            </span>
          </div>
          {step.step_duration && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
              <i className="fi fi-rr-clock text-[10px]" /> {step.step_duration}
            </p>
          )}
          <p className={`text-xs leading-relaxed mb-4 ${isLocked ? "text-gray-400" : "text-gray-600"}`}>
            {step.step_description}
          </p>
        </div>

        {!isLocked && (
          <div className="px-5 pb-5">
            {tasks.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Tareas a realizar</p>
                <ul className="space-y-2">
                  {tasks.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="text-[#F26419] font-bold mt-0.5 flex-shrink-0">›</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {criteria.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {criteria.map((c, i) => (
                  <span key={i} className="text-[11px] bg-[#FEF0E8] text-[#F26419] border border-[#F26419]/20 px-2.5 py-1 rounded-full font-medium">{c}</span>
                ))}
              </div>
            )}
            {isDone && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-green-600 mb-2">Tu entrega</p>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{step.answer_text}</p>
                  {step.submitted_at && (
                    <p className="text-[10px] text-gray-400 mt-2">
                      Enviado el {new Date(step.submitted_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
                {step.feedback_text ? (
                  <div className="bg-[#1C1712] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fi fi-rr-comment-check text-[#F26419] text-sm" />
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#F0D4C4]">Feedback de la empresa</p>
                    </div>
                    <p className="text-xs text-white/75 leading-relaxed">{step.feedback_text}</p>
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
                  <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <i className="fi fi-rr-clock text-[11px]" /> Esperando feedback de la empresa...
                  </div>
                )}
              </div>
            )}
            {isCurrent && (
              <div className="mt-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Tu respuesta / entrega</label>
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={(e) => { setAnswer(e.target.value); setError(""); }}
                  placeholder="Describe tu trabajo, pega un link, comparte tus conclusiones..."
                  className={`w-full px-4 py-3 border-[1.5px] rounded-xl bg-gray-50 text-sm text-gray-900 outline-none resize-y min-h-28 leading-relaxed transition-all focus:border-[#F26419] focus:bg-white focus:shadow-[0_0_0_3px_rgba(242,100,25,0.1)] ${error ? "border-red-400" : "border-gray-200"}`}
                />
                {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><i className="fi fi-rr-exclamation text-[10px]" /> {error}</p>}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400">{answer.length} caracteres</p>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#F26419] text-white font-semibold text-sm rounded-xl border-none cursor-pointer transition-all hover:bg-[#C94E0D] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? <><i className="fi fi-rr-spinner animate-spin text-sm" /> Enviando...</> : <><i className="fi fi-rr-paper-plane text-sm" /> Enviar entrega</>}
                  </button>
                </div>
              </div>
            )}
            {isLocked && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                <i className="fi fi-rr-lock text-[11px]" /> Completa la etapa anterior para desbloquear esta.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Timeline() {
  const { applicationId } = useParams();
  const navigate           = useNavigate();
  const { token }          = useAuth();

  const [steps, setSteps]           = useState([]);
  const [jobInfo, setJobInfo]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  const API = import.meta.env.VITE_API_URL;

  const fetchSteps = async () => {
    try {
      const res = await fetch(`${API}/api/submissions/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Error al cargar el timeline."); }
      const data = await res.json();
      const enriched = data.steps.map((step, i) => ({ ...step, unlocked: i === 0 || !!data.steps[i - 1].submission_id }));
      setSteps(enriched);
      if (data.job) setJobInfo(data.job);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchSteps(); }, [applicationId, token]);

  const handleSubmit = async (stepId, answerText) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ application_id: applicationId, step_id: stepId, answer_text: answerText }),
      });
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
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />
      <main className="ml-24 flex-1 p-8 max-w-3xl mx-auto">
        <div className="h-6 bg-gray-100 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-72 mb-8 animate-pulse" />
        <Skeleton />
      </main>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />
      <main className="ml-24 flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <i className="fi fi-rr-shield-exclamation text-4xl text-gray-300 block mb-4" />
          <p className="text-gray-600 font-medium mb-1">{error}</p>
          <button onClick={() => navigate(-1)} className="text-sm text-[#F26419] underline cursor-pointer bg-none border-none mt-2">Volver atrás</button>
        </div>
      </main>
    </div>
  );

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <SideBar />
        <main className="ml-24 flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 bg-none border-none cursor-pointer transition-colors">
              <i className="fi fi-rr-arrow-left text-xs" /> Volver
            </button>
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#F26419] mb-1">Timeline del proyecto</p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{jobInfo?.title || "Mi proyecto"}</h1>
              <p className="text-sm text-gray-400 mt-1">Completa cada etapa en orden para avanzar en el proyecto</p>
            </div>
            <ProgressBar completed={completed} total={total} />
            {allDone && (
              <div className="bg-[#1C1712] rounded-2xl p-6 mb-6 border border-[#F26419]/20 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F26419]/15 border border-[#F26419]/30 flex items-center justify-center mx-auto mb-3">
                  <i className="fi fi-sr-diploma text-2xl text-[#F26419]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">¡Proyecto completado!</h3>
                <p className="text-white/50 text-sm mb-4">Enviaste todas las etapas. Cuando la empresa finalice su feedback podrás descargar tu certificado verificado.</p>
                <button disabled className="px-6 py-2.5 bg-[#F26419]/30 text-[#F0D4C4] text-sm font-semibold rounded-xl border-none cursor-not-allowed opacity-60">
                  <i className="fi fi-rr-diploma text-sm mr-2" /> Certificado pendiente de feedback
                </button>
              </div>
            )}
            <div className="relative">
              {steps.map((step, i) => (
                <StepCard key={step.step_id} step={step} index={i} onSubmit={handleSubmit} submitting={submitting} />
              ))}
            </div>
          </div>
        </main>
      </div>
      <Footer />
      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-2xl z-50 animate-[slideUp_0.3s_ease] ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:translateY(0);}}`}</style>
    </>
  );
}