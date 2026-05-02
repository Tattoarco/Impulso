import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../Components/footer";

const API = import.meta.env.VITE_API_URL;

const APP_STATUS = {
  pending:  { label: "Postulación enviada",   icon: "fi-rr-clock",        color: "text-amber-600", bg: "bg-amber-50 border-amber-200"  },
  approved: { label: "¡Postulación aprobada!", icon: "fi-rr-check-circle", color: "text-green-600", bg: "bg-green-50 border-green-200"  },
  rejected: { label: "No seleccionado",        icon: "fi-rr-cross-circle", color: "text-red-500",   bg: "bg-red-50 border-red-200"      },
};

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-gray-100">
        <div className="h-4 bg-gray-100 rounded w-24 mb-4" />
        <div className="h-7 bg-gray-100 rounded w-2/3 mb-3" />
        <div className="flex gap-3 mb-6">
          {[20, 24, 16].map((_, i) => <div key={i} className="h-5 bg-gray-100 rounded-full w-20" />)}
        </div>
        {[100, 80, 60].map((_, i) => <div key={i} className="h-3 bg-gray-100 rounded w-full mb-2" />)}
      </div>
    </div>
  );
}

/* ── Bloque de recomendaciones IA ── */
function AIRecommendations({ job, steps, userProfile }) {
  const [recs, setRecs]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);

  const generate = async () => {
    if (recs) { setOpen(true); return; }
    setOpen(true);
    setLoading(true);
    try {
      const prompt = `Analiza este proyecto y el perfil del candidato. Da 3-4 recomendaciones concretas y breves (máximo 2 líneas cada una) para que el candidato decida si postularse y cómo prepararse si lo hace.

Proyecto: "${job.title}"
Área: ${job.profile_area}
Duración: ${job.duration}
Descripción: ${job.summary}
Etapas: ${steps.map((s) => s.title).join(", ")}

Perfil del candidato:
- Carrera: ${userProfile.carrera || "No especificada"}
- Ciudad: ${userProfile.ciudad || "No especificada"}
- Habilidades: ${userProfile.habilidades?.join(", ") || "No especificadas"}

Responde SOLO con un array JSON:
[
  {"tipo": "fit" | "advertencia" | "consejo", "texto": "..."},
  ...
]

Tipos: "fit" = es buena opción para ti, "advertencia" = considera esto antes, "consejo" = cómo prepararte.`;

      const res  = await fetch(`${API}/api/ai/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 600,
          messages:   [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      setRecs(JSON.parse(clean));
    } catch {
      setRecs([{ tipo: "consejo", texto: "Revisa las etapas del proyecto y asegúrate de tener el tiempo necesario para completarlas." }]);
    }
    setLoading(false);
  };

  const TIPO_STYLE = {
    fit:        { icon: "fi-rr-check-circle", color: "text-green-600",  bg: "bg-green-50 border-green-100",  label: "Buena opción"    },
    advertencia:{ icon: "fi-rr-exclamation",  color: "text-amber-600",  bg: "bg-amber-50 border-amber-100",  label: "Considerar"      },
    consejo:    { icon: "fi-rr-bulb",          color: "text-blue-600",   bg: "bg-blue-50 border-blue-100",    label: "Consejo"         },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={generate}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-none border-none text-left hover:bg-gray-50 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: "linear-gradient(135deg, #E26000, #FF8C3A)" }}>
            ✨
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Recomendaciones IA</p>
            <p className="text-xs text-gray-400">¿Es este proyecto para ti?</p>
          </div>
        </div>
        <i className={`fi ${open ? "fi-rr-angle-up" : "fi-rr-angle-down"} text-gray-400 text-sm`} />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4">
          {loading && (
            <div className="flex items-center gap-2.5 py-3">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin shrink-0" />
              <p className="text-xs text-gray-400">Analizando el proyecto para ti...</p>
            </div>
          )}
          {!loading && recs && (
            <div className="space-y-2.5">
              {recs.map((r, i) => {
                const s = TIPO_STYLE[r.tipo] || TIPO_STYLE.consejo;
                return (
                  <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${s.bg}`}>
                    <i className={`fi ${s.icon} text-sm ${s.color} mt-0.5 shrink-0`} />
                    <p className="text-xs text-gray-700 leading-relaxed">{r.texto}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProyectoDetalle() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const user       = JSON.parse(localStorage.getItem("user") || "{}");
  const isCandidate = user?.role === "candidato";

  const [job, setJob]               = useState(null);
  const [steps, setSteps]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [applying, setApplying]     = useState(false);
  const [appStatus, setAppStatus]   = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [toast, setToast]           = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res  = await fetch(`${API}/api/jobs/${id}`);
        if (!res.ok) throw new Error("Proyecto no encontrado.");
        const data = await res.json();
        setJob(data.job);
        setSteps(data.steps || []);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (!isCandidate) return;
    const check = async () => {
      try {
        const res  = await fetch(`${API}/api/applications/mine`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        if (!res.ok) return;
        const data = await res.json();
        const existing = data.applications?.find((a) => a.job_id === id);
        if (existing) { setAppStatus(existing.status); setApplicationId(existing.id); }
      } catch { /* silencioso */ }
    };
    check();
  }, [id, isCandidate]);

  const handleApply = async () => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    setApplying(true);
    try {
      const res  = await fetch(`${API}/api/applications`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body:    JSON.stringify({ job_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al postularse.");
      setAppStatus("pending");
      setApplicationId(data.application.id);
      showToast("success", "¡Postulación enviada! La empresa revisará tu perfil.");
    } catch (err) { showToast("error", err.message); } finally { setApplying(false); }
  };

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };
  const goToTimeline = () => navigate(`/candidato/timeline/${applicationId}`);

  if (loading) return (
    <div className="flex min-h-screen bg-[#F7F7F8]">
      <main className="ml-24 flex-1 p-8 max-w-4xl mx-auto"><Skeleton /></main>
    </div>
  );

  if (error || !job) return (
    <div className="flex min-h-screen bg-[#F7F7F8]">
      <main className="ml-24 flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <i className="fi fi-rr-search text-4xl text-gray-300 block mb-4" />
          <p className="text-gray-500 font-medium mb-2">Proyecto no encontrado</p>
          <button onClick={() => navigate(-1)} className="text-sm text-[#E26000] underline cursor-pointer bg-transparent border-none">Volver atrás</button>
        </div>
      </main>
    </div>
  );

  const st = APP_STATUS[appStatus];

  return (
    <>
      <div className="flex min-h-screen bg-[#F7F7F8]">
        <main className="ml-24 flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 bg-transparent border-none cursor-pointer transition-colors">
              <i className="fi fi-rr-arrow-left text-xs" /> Volver
            </button>

            <div className="grid grid-cols-[1fr_300px] gap-6 max-lg:grid-cols-1">

              {/* COLUMNA PRINCIPAL */}
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-2xl shadow-xl">
                  <div className="bg-[#1C1712] px-8 pt-8 pb-6">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#E26000]/10 blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-1.5 bg-[#E26000]/20 text-[#E26000] text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4 border border-[#E26000]/30">✨ Generado con IA</div>
                      <h1 className="text-2xl font-bold text-white tracking-tight mb-4">{job.title}</h1>
                      <div className="flex flex-wrap gap-2">
                        {[{ icon:"fi-rr-clock", val:job.duration },{ icon:"fi-rr-tag", val:job.profile_area },{ icon:"fi-rr-building", val:job.company_name }]
                          .filter((r) => r.val)
                          .map(({ icon, val }) => (
                            <span key={val} className="flex items-center gap-1.5 text-xs font-medium text-white/60 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                              <i className={`fi ${icon} text-[#E26000] text-[11px]`} /> {val}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white px-8 py-6">
                    <p className="text-sm text-gray-600 leading-relaxed">{job.summary}</p>
                  </div>
                </div>

                {steps.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Etapas del proyecto · {steps.length} fases</p>
                    <div className="relative">
                      <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gray-100" />
                      <div className="space-y-4">
                        {steps.map((step, i) => (
                          <div key={step.id} className="flex gap-4 relative">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 text-white text-[11px] font-bold shadow-sm" style={{ background: "linear-gradient(135deg, #E26000, #FF8C3A)" }}>
                              {i + 1}
                            </div>
                            <div className="flex-1 bg-gray-50 hover:bg-[#FEF0E8]/40 rounded-xl p-4 border border-gray-100 hover:border-[#E26000]/20 transition-all">
                              <div className="flex items-center justify-between mb-1.5">
                                <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                                {step.duration && <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0"><i className="fi fi-rr-clock text-[10px]" /> {step.duration}</span>}
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed mb-2">{step.description}</p>
                              {step.tasks && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {(typeof step.tasks === "string" ? JSON.parse(step.tasks) : step.tasks).slice(0, 2).map((t, ti) => (
                                    <span key={ti} className="text-[11px] bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">{t.length > 40 ? t.slice(0, 40) + "…" : t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <i className="fi fi-rr-lock text-gray-400 text-sm" />
                      <p className="text-xs text-gray-500">Las tareas completas se desbloquean una vez que la empresa apruebe tu postulación.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SIDEBAR */}
              <div className="space-y-4">

                {/* Card de acción */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-8">
                  {appStatus && st && (
                    <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 mb-5 ${st.bg}`}>
                      <i className={`fi ${st.icon} text-sm ${st.color}`} />
                      <p className={`text-sm font-semibold ${st.color}`}>{st.label}</p>
                    </div>
                  )}

                  {!appStatus && isCandidate && (
                    <button onClick={handleApply} disabled={applying}
                      className="w-full py-3.5 text-white font-bold text-sm rounded-xl border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(226,96,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-3"
                      style={{ background: "linear-gradient(135deg, #E26000, #FF8C3A)" }}>
                      {applying
                        ? <span className="flex items-center justify-center gap-2"><i className="fi fi-rr-spinner animate-spin text-sm" /> Enviando...</span>
                        : <span className="flex items-center justify-center gap-2"><i className="fi fi-rr-paper-plane text-sm" /> Postularme</span>}
                    </button>
                  )}

                  {appStatus === "pending"   && <p className="text-xs text-center text-gray-400 mb-3 leading-relaxed">La empresa revisará tu perfil y te notificará su decisión.</p>}
                  {appStatus === "rejected"  && <p className="text-xs text-center text-gray-400 mb-3 leading-relaxed">No fuiste seleccionado. Sigue explorando otras oportunidades.</p>}

                  {appStatus === "approved" && (
                    <button onClick={goToTimeline}
                      className="w-full py-3.5 bg-green-500 text-white font-bold text-sm rounded-xl border-none cursor-pointer transition-all hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(34,197,94,0.3)] mb-3">
                      <span className="flex items-center justify-center gap-2"><i className="fi fi-rr-rocket text-sm" /> Ir al timeline</span>
                    </button>
                  )}

                  {!isCandidate && !localStorage.getItem("token") && (
                    <button onClick={() => navigate("/login")}
                      className="w-full py-3.5 text-white font-bold text-sm rounded-xl border-none cursor-pointer mb-3"
                      style={{ background: "linear-gradient(135deg, #E26000, #FF8C3A)" }}>
                      Inicia sesión para postularte
                    </button>
                  )}

                  <div className="border-t border-gray-50 pt-4 space-y-3">
                    {[
                      { icon:"fi-rr-clock",      label:"Duración", value:job.duration     },
                      { icon:"fi-rr-tag",         label:"Área",     value:job.profile_area },
                      { icon:"fi-rr-building",    label:"Empresa",  value:job.company_name },
                      { icon:"fi-rr-list-check",  label:"Etapas",   value:steps.length ? `${steps.length} fases` : null },
                    ].filter((r) => r.value).map(({ icon, label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400"><i className={`fi ${icon} text-[11px]`} /> {label}</span>
                        <span className="text-xs font-semibold text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── RECOMENDACIONES IA — solo para candidatos ── */}
                {isCandidate && job && steps.length > 0 && (
                  <AIRecommendations job={job} steps={steps} userProfile={user} />
                )}

                {isCandidate && !appStatus && (
                  <div className="rounded-2xl p-5 border border-[#E26000]/15" style={{ background: "#FEF0E8" }}>
                    <p className="text-[11px] font-bold tracking-wide uppercase text-[#E26000] mb-2">💡 Tip</p>
                    <p className="text-xs text-gray-700 leading-relaxed">Revisa bien las etapas antes de postularte. Asegúrate de tener el tiempo y habilidades para completarlas.</p>
                  </div>
                )}
              </div>
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
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}


