import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../Components/Sidebar";
import Footer from "../Components/footer";

/* ── Status de postulación ── */
const APP_STATUS = {
  pending:  { label: "Postulación enviada",   icon: "fi-rr-clock",        color: "text-amber-500",  bg: "bg-amber-50 border-amber-200"  },
  approved: { label: "¡Postulación aprobada!", icon: "fi-rr-check-circle", color: "text-green-600",  bg: "bg-green-50 border-green-200"  },
  rejected: { label: "No seleccionado",        icon: "fi-rr-cross-circle", color: "text-red-500",    bg: "bg-red-50 border-red-200"      },
};

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-gray-100">
        <div className="h-4 bg-gray-100 rounded w-24 mb-4" />
        <div className="h-7 bg-gray-100 rounded w-2/3 mb-3" />
        <div className="flex gap-3 mb-6">
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-5 bg-gray-100 rounded-full w-24" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-4/5" />
          <div className="h-3 bg-gray-100 rounded w-3/5" />
        </div>
      </div>
    </div>
  );
}

/* ── Sección de contenido ── */
function Section({ title, children }) {
  return (
    <div className="mb-7">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ── Item de lista ── */
function ListItem({ text }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700 mb-2">
      <span className="text-[#F26419] font-bold mt-0.5 shrink-0">→</span>
      {text}
    </li>
  );
}

/* ════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════ */
export default function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isCandidate = user?.role === "candidato";

  const [job, setJob]               = useState(null);
  const [steps, setSteps]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [applying, setApplying]     = useState(false);
  const [appStatus, setAppStatus]   = useState(null); // null | pending | approved | rejected
  const [applicationId, setApplicationId] = useState(null);
  const [toast, setToast]           = useState(null);

  const API = import.meta.env.VITE_API_URL;

  /* ── Cargar proyecto ── */
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${id}`);
        if (!res.ok) throw new Error("Proyecto no encontrado.");
        const data = await res.json();
        setJob(data.job);
        setSteps(data.steps || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, API]);

  /* ── Verificar si ya se postuló ── */
  useEffect(() => {
    if (!isCandidate) return;
    const checkApplication = async () => {
      try {
        const res = await fetch("/api/applications/mine", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const existing = data.applications?.find((a) => a.job_id === id);
        if (existing) {
          setAppStatus(existing.status);
          setApplicationId(existing.id);
        }
      } catch {
        // silencioso
      }
    };
    checkApplication();
  }, [id, isCandidate, API]);

  /* ── Postularse ── */
  const handleApply = async () => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    setApplying(true);
    try {
      const res = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ job_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al postularse.");
      setAppStatus("pending");
      setApplicationId(data.application.id);
      showToast("success", "¡Postulación enviada! La empresa revisará tu perfil.");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setApplying(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Ir al timeline si está aprobado ── */
  const goToTimeline = () => {
    navigate(`/candidato/timeline/${applicationId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SideBar />
        <main className="ml-24 flex-1 p-8 max-w-4xl mx-auto">
          <Skeleton />
        </main>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SideBar />
        <main className="ml-24 flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <i className="fi fi-rr-search text-4xl text-gray-300 block mb-4" />
            <p className="text-gray-500 font-medium mb-2">Proyecto no encontrado</p>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-[#F26419] underline cursor-pointer bg-none border-none"
            >
              Volver atrás
            </button>
          </div>
        </main>
      </div>
    );
  }

  const st = APP_STATUS[appStatus];

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <SideBar />

        <main className="ml-24 flex-1 p-8">
          <div className="max-w-4xl mx-auto">

            {/* ── BACK ── */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 bg-none border-none cursor-pointer transition-colors"
            >
              <i className="fi fi-rr-arrow-left text-xs" /> Volver
            </button>

            <div className="grid grid-cols-[1fr_300px] gap-6 max-lg:grid-cols-1">

              {/* ── COLUMNA PRINCIPAL ── */}
              <div className="space-y-5">

                {/* Header del proyecto */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                  <div className="inline-flex items-center gap-1.5 bg-[#FEF0E8] text-[#F26419] text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                    ✨ Generado con IA
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">
                    {job.title}
                  </h1>

                  {/* Meta badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {job.duration && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                        <i className="fi fi-rr-clock text-[#F26419] text-[11px]" /> {job.duration}
                      </span>
                    )}
                    {job.profile_area && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                        <i className="fi fi-rr-tag text-[#F26419] text-[11px]" /> {job.profile_area}
                      </span>
                    )}
                    {job.company_name && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                        <i className="fi fi-rr-building text-[#F26419] text-[11px]" /> {job.company_name}
                      </span>
                    )}
                  </div>

                  {/* Resumen */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {job.summary}
                  </p>
                </div>

                {/* Etapas del timeline — preview */}
                {steps.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <Section title="Etapas del proyecto">
                      <div className="relative">
                        {/* Línea vertical */}
                        <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gray-100" />

                        <div className="space-y-4">
                          {steps.map((step, i) => (
                            <div key={step.id} className="flex gap-4 relative">
                              {/* Nodo */}
                              <div className="w-7 h-7 rounded-full bg-[#FEF0E8] border-2 border-[#F26419]/30 flex items-center justify-center shrink-0 z-10 mt-0.5">
                                <span className="text-[11px] font-bold text-[#F26419]">{i + 1}</span>
                              </div>

                              {/* Contenido */}
                              <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center justify-between mb-1.5">
                                  <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                                  {step.duration && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      <i className="fi fi-rr-clock text-[10px]" /> {step.duration}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed mb-2">
                                  {step.description}
                                </p>
                                {/* Tasks preview */}
                                {step.tasks && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {(typeof step.tasks === "string"
                                      ? JSON.parse(step.tasks)
                                      : step.tasks
                                    ).slice(0, 2).map((t, ti) => (
                                      <span key={ti} className="text-[11px] bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                                        {t.length > 40 ? t.slice(0, 40) + "…" : t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Section>

                    {/* Aviso de acceso */}
                    <div className="mt-4 flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <i className="fi fi-rr-lock text-gray-400 text-sm" />
                      <p className="text-xs text-gray-500">
                        Las tareas completas y los entregables se desbloquean una vez que la empresa apruebe tu postulación.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── SIDEBAR DERECHO ── */}
              <div className="space-y-4">

                {/* Card de postulación */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-8">

                  {/* Estado si ya se postuló */}
                  {appStatus && st && (
                    <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 mb-5 ${st.bg}`}>
                      <i className={`fi ${st.icon} text-sm ${st.color}`} />
                      <p className={`text-sm font-semibold ${st.color}`}>{st.label}</p>
                    </div>
                  )}

                  {/* Botón según estado */}
                  {!appStatus && isCandidate && (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full py-3.5 bg-[#F26419] text-white font-bold text-sm rounded-xl border-none cursor-pointer transition-all hover:bg-[#C94E0D] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,100,25,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mb-3"
                    >
                      {applying ? (
                        <span className="flex items-center justify-center gap-2">
                          <i className="fi fi-rr-spinner animate-spin text-sm" /> Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <i className="fi fi-rr-paper-plane text-sm" /> Postularme
                        </span>
                      )}
                    </button>
                  )}

                  {appStatus === "pending" && (
                    <div className="text-center py-2 mb-3">
                      <p className="text-xs text-gray-400 leading-relaxed">
                        La empresa revisará tu perfil y te notificará su decisión.
                      </p>
                    </div>
                  )}

                  {appStatus === "approved" && (
                    <button
                      onClick={goToTimeline}
                      className="w-full py-3.5 bg-green-500 text-white font-bold text-sm rounded-xl border-none cursor-pointer transition-all hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(34,197,94,0.3)] mb-3"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <i className="fi fi-rr-rocket text-sm" /> Ir al timeline
                      </span>
                    </button>
                  )}

                  {appStatus === "rejected" && (
                    <div className="text-center py-2 mb-3">
                      <p className="text-xs text-gray-400 leading-relaxed">
                        No fuiste seleccionado para este proyecto. Sigue explorando otras oportunidades.
                      </p>
                    </div>
                  )}

                  {!isCandidate && !localStorage.getItem("token") && (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full py-3.5 bg-[#F26419] text-white font-bold text-sm rounded-xl border-none cursor-pointer transition-all hover:bg-[#C94E0D] mb-3"
                    >
                      Inicia sesión para postularte
                    </button>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-50 pt-4 space-y-3">
                    {/* Info del proyecto */}
                    {[
                      { icon: "fi-rr-clock",    label: "Duración",  value: job.duration     },
                      { icon: "fi-rr-tag",       label: "Área",      value: job.profile_area },
                      { icon: "fi-rr-building",  label: "Empresa",   value: job.company_name },
                    ].filter(r => r.value).map(({ icon, label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <i className={`fi ${icon} text-[11px]`} /> {label}
                        </span>
                        <span className="text-xs font-medium text-gray-700">{value}</span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <i className="fi fi-rr-list-check text-[11px]" /> Etapas
                      </span>
                      <span className="text-xs font-medium text-gray-700">{steps.length} etapas</span>
                    </div>
                  </div>
                </div>

                {/* Tips para el candidato */}
                {isCandidate && !appStatus && (
                  <div className="bg-[#FEF0E8] rounded-2xl border border-[#F26419]/15 p-5">
                    <p className="text-[11px] font-bold tracking-wide uppercase text-[#F26419] mb-2">
                      💡 Tip
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Revisa bien las etapas antes de postularte. Asegúrate de tener el tiempo y las habilidades para completarlas.
                    </p>
                  </div>
                )}
              </div>  
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-2xl z-50 animate-[slideUp_0.3s_ease]
          ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}