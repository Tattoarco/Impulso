import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import SideBar from "../Components/Sidebar";
import Footer from "../Components/footer";
import ProfileModal from "../Components/ProfileModal";
import FeedbackFinal from "../Components/FeedbackFinal";

const API = import.meta.env.VITE_API_URL;

const APP_STATUS = {
  pending: { label: "Pendiente", pill: "bg-amber-50 text-amber-600 border-amber-200", icon: "fi-rr-clock" },
  approved: { label: "Aprobado", pill: "bg-green-50 text-green-600 border-green-200", icon: "fi-rr-check-circle" },
  rejected: { label: "Rechazado", pill: "bg-red-50 text-red-500 border-red-200", icon: "fi-rr-cross-circle" },
};

const CARD_COLORS = ["from-orange-400 to-rose-400", "from-violet-400 to-purple-500", "from-teal-400 to-cyan-500", "from-blue-400 to-indigo-500", "from-green-400 to-emerald-500"];

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="h-8 bg-gray-100 rounded-xl w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Avatar({ name, color }) {
  const initials =
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";
  return <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>{initials}</div>;
}

function ApplicantCard({ applicant, index, onApprove, onReject, onViewProgress, onFeedbackFinal, onViewProfile, updating }) {
  const st = APP_STATUS[applicant.status] || APP_STATUS.pending;
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const steps = parseInt(applicant.steps_completed) || 0;
  const totalSteps = parseInt(applicant.total_steps) || 0;
  const allDone = applicant.status === "approved" && totalSteps > 0 && steps >= totalSteps;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all p-5">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Avatar — clickeable para ver perfil */}
        <button onClick={() => onViewProfile(applicant)} className="cursor-pointer bg-transparent border-none p-0" title="Ver perfil">
          <Avatar name={applicant.candidate_name} color={color} />
        </button>

        <div className="flex-1 min-w-0">
          {/* Nombre clickeable */}
          <button onClick={() => onViewProfile(applicant)} className="font-semibold text-gray-900 text-sm truncate cursor-pointer bg-transparent border-none p-0 hover:text-[#F26419] transition-colors text-left">
            {applicant.candidate_name}
          </button>
          <p className="text-xs text-gray-400 truncate">{applicant.candidate_email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Se postuló el{" "}
            {new Date(applicant.created_at).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {applicant.status === "approved" && totalSteps > 0 && (
          <div className="text-center px-3">
            <p className="text-lg font-black text-[#F26419]">
              {steps}/{totalSteps}
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">etapas</p>
          </div>
        )}

        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${st.pill}`}>
          <i className={`fi ${st.icon} text-[10px]`} />
          {st.label}
        </span>

        <div className="flex gap-2 flex-wrap">
          {/* Ver perfil */}
          <button onClick={() => onViewProfile(applicant)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200 text-xs font-semibold rounded-xl cursor-pointer transition-all hover:border-[#F26419] hover:text-[#F26419]">
            <i className="fi fi-rr-user text-[11px]" /> Perfil
          </button>

          {applicant.status === "pending" && (
            <>
              <button onClick={() => onApprove(applicant.id)} disabled={updating === applicant.id} className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-xl border-none cursor-pointer transition-all hover:bg-green-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <i className="fi fi-rr-check text-[11px]" />
                {updating === applicant.id ? "..." : "Aprobar"}
              </button>
              <button onClick={() => onReject(applicant.id)} disabled={updating === applicant.id} className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-500 border border-red-200 text-xs font-semibold rounded-xl cursor-pointer transition-all hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <i className="fi fi-rr-cross text-[11px]" />
                Rechazar
              </button>
            </>
          )}

          {applicant.status === "approved" && (
            <button onClick={() => onViewProgress(applicant.id, applicant.candidate_name)} className="flex items-center gap-1.5 px-4 py-2 bg-[#F26419] text-white text-xs font-semibold rounded-xl border-none cursor-pointer transition-all hover:bg-[#C94E0D] hover:-translate-y-0.5">
              <i className="fi fi-rr-eye text-[11px]" />
              Ver entregas
            </button>
          )}

          {allDone && (
            <button onClick={() => onFeedbackFinal(applicant.id, applicant.candidate_name)} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl border-none cursor-pointer transition-all hover:bg-purple-700 hover:-translate-y-0.5">
              <i className="fi fi-rr-star text-[11px]" />
              Feedback final
            </button>
          )}

          {applicant.status === "rejected" && (
            <span className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-400 text-xs font-semibold rounded-xl border border-red-100">
              <i className="fi fi-rr-cross-circle text-[11px]" />
              Rechazado
            </span>
          )}
        </div>
      </div>

      {applicant.status === "approved" && totalSteps > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
            <span>Progreso del proyecto</span>
            <span>{Math.round((steps / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#F26419] rounded-full transition-all duration-500" style={{ width: `${Math.round((steps / totalSteps) * 100)}%` }} />
          </div>
          {allDone && (
            <p className="text-[10px] text-purple-600 font-semibold mt-1.5 flex items-center gap-1">
              <i className="fi fi-rr-check-circle text-[10px]" /> Proyecto completado — pendiente de feedback final
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressModal({ applicationId, candidateName, jobTitle, onClose, token }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/api/submissions/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSteps(data.steps || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [applicationId, token]);

  const submittedSteps = steps.filter((s) => !!s.submission_id);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-6 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl my-6 overflow-hidden shadow-2xl">
        <div className="bg-[#1C1712] px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#F26419] mb-1">Entregas del candidato</p>
            <h3 className="text-white font-bold text-lg leading-tight">{candidateName}</h3>
            <p className="text-white/40 text-xs mt-0.5">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white bg-transparent border-none cursor-pointer mt-1 text-lg">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-gray-50 rounded-xl p-4">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {!loading && submittedSteps.length === 0 && (
            <div className="text-center py-10">
              <i className="fi fi-rr-inbox text-3xl text-gray-300 block mb-3" />
              <p className="text-gray-500 text-sm font-medium">El candidato aún no ha enviado entregas</p>
            </div>
          )}

          {!loading &&
            submittedSteps.map((step) => (
              <div key={step.step_id} className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#F26419] flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{step.step_order}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{step.step_title}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(step.submitted_at).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Entrega</p>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{step.answer_text}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Postulantes() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const jobRes = await fetch(`${API}/api/jobs/${jobId}`);
        if (!jobRes.ok) throw new Error("Proyecto no encontrado.");
        const jobData = await jobRes.json();
        setJob(jobData.job);
        
        const appRes = await fetch(`${API}/api/applications?job_id=${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
          
        });
        if (!appRes.ok) throw new Error("Error al cargar postulantes.");
        const appData = await appRes.json();

        setApplicants(appData.applicants || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [jobId, token]);

  const updateStatus = async (applicationId, status) => {
    setUpdating(applicationId);
    try {
      const res = await fetch(`${API}/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar.");
      setApplicants((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status } : a)));
      showToast("success", status === "approved" ? "Candidato aprobado ✓" : "Candidato rechazado");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setUpdating(null);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = filter === "all" ? applicants : applicants.filter((a) => a.status === filter);

  const counts = {
    all: applicants.length,
    pending: applicants.filter((a) => a.status === "pending").length,
    approved: applicants.filter((a) => a.status === "approved").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
  };

  const filterTabs = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Pendientes" },
    { key: "approved", label: "Aprobados" },
    { key: "rejected", label: "Rechazados" },
  ];

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <SideBar />
        <main className="ml-24 flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate("/empresa")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 bg-transparent border-none cursor-pointer transition-colors">
              <i className="fi fi-rr-arrow-left text-xs" /> Volver al dashboard
            </button>

            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-[#F26419] mb-1">Gestión de candidatos</p>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{job?.title || "Cargando..."}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {job?.duration && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <i className="fi fi-rr-clock text-[10px]" /> {job.duration}
                    </span>
                  )}
                  {job?.profile_area && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <i className="fi fi-rr-tag text-[10px]" /> {job.profile_area}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <i className="fi fi-rr-users text-[10px]" /> {applicants.length} postulante
                    {applicants.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
                <i className="fi fi-rr-exclamation text-red-400" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <i className="fi fi-rr-users text-[#F26419]" /> Postulantes
                </h2>
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
                  {filterTabs.map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all flex items-center gap-1.5 ${filter === f.key ? "bg-white text-[#F26419] shadow-sm" : "bg-transparent text-gray-400 hover:text-gray-700"}`}>
                      {f.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === f.key ? "bg-orange-50 text-[#F26419]" : "bg-gray-100 text-gray-400"}`}>{counts[f.key]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {loading && <Skeleton />}

              {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <i className="fi fi-rr-users text-2xl text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm mb-1">{filter === "all" ? "Aún no hay postulantes" : `Sin candidatos ${filter === "pending" ? "pendientes" : filter === "approved" ? "aprobados" : "rechazados"}`}</p>
                </div>
              )}

              {!loading && filtered.length > 0 && (
                <div className="space-y-3">
                  {filtered.map((applicant, i) => (
                    <ApplicantCard
                      key={applicant.id}
                      applicant={applicant}
                      index={i}
                      updating={updating}
                      onApprove={(id) => updateStatus(id, "approved")}
                      onReject={(id) => updateStatus(id, "rejected")}
                      onViewProgress={(id, name) => setModal({ type: "progress", applicationId: id, candidateName: name })}
                      onFeedbackFinal={(id, name) => setModal({ type: "feedback", applicationId: id, candidateName: name })}
                      onViewProfile={(applicant) => setModal({ type: "profile", candidate: applicant })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* ✅ Modal de perfil — se pasa candidate con el objeto applicant completo */}
      {modal?.type === "profile" && <ProfileModal candidate={modal.candidate} token={token} onClose={() => setModal(null)} />}

      {modal?.type === "progress" && <ProgressModal applicationId={modal.applicationId} candidateName={modal.candidateName} jobTitle={job?.title || ""} token={token} onClose={() => setModal(null)} />}

      {modal?.type === "feedback" && <FeedbackFinal applicationId={modal.applicationId} candidateName={modal.candidateName} jobTitle={job?.title || ""} token={token} onClose={() => setModal(null)} onSaved={() => showToast("success", "Feedback final enviado ✓ El nivel del candidato ha sido actualizado.")} />}

      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-2xl z-50 animate-[slideUp_0.3s_ease] ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
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
