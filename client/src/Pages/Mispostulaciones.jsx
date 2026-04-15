import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import SideBar from "../Components/Sidebar";
import Footer from "../Components/footer";

const APP_STATUS = {
  pending:  { label: "Pendiente",  pill: "bg-amber-50 text-amber-600 border border-amber-200",  icon: "fi-rr-clock"        },
  approved: { label: "Aprobado",   pill: "bg-green-50 text-green-600 border border-green-200",  icon: "fi-rr-check-circle" },
  rejected: { label: "Rechazado",  pill: "bg-red-50 text-red-500 border border-red-200",        icon: "fi-rr-cross-circle" },
};

const CARD_COLORS = [
  "from-orange-400 to-rose-400",
  "from-violet-400 to-purple-500",
  "from-teal-400 to-cyan-500",
  "from-blue-400 to-indigo-500",
];

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="h-1 bg-gray-100 rounded w-full mb-4" />
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="flex-1">
          <div className="h-3.5 bg-gray-100 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  );
}

function ApplicationCard({ app, navigate }) {
  const st      = APP_STATUS[app.status] || APP_STATUS.pending;
  const initials = app.title?.slice(0, 2).toUpperCase() || "PR";
  const color   = CARD_COLORS[app.title?.charCodeAt(0) % CARD_COLORS.length] || CARD_COLORS[0];
  const steps   = parseInt(app.steps_completed) || 0;
  const total   = parseInt(app.total_steps)     || 0;
  const pct     = total > 0 ? Math.round((steps / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-[#F26419]/20 hover:shadow-sm transition-all overflow-hidden">
      <div className={`h-1 bg-linear-to-r ${color}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
              {initials}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{app.title}</h3>
              <p className="text-xs text-gray-400">{app.company_name || "Empresa"}</p>
            </div>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 ${st.pill}`}>
            <i className={`fi ${st.icon} text-[10px]`} />{st.label}
          </span>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{app.summary}</p>

        <div className="flex gap-3 text-xs text-gray-400 mb-4">
          {app.duration     && <span className="flex items-center gap-1"><i className="fi fi-rr-clock text-[10px]" /> {app.duration}</span>}
          {app.profile_area && <span className="flex items-center gap-1"><i className="fi fi-rr-tag text-[10px]" /> {app.profile_area}</span>}
        </div>

        {/* Progreso si está aprobado */}
        {app.status === "approved" && total > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progreso</span>
              <span>{steps}/{total} etapas</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#F26419] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50">
          <p className="text-[10px] text-gray-400">
            Postulado el {new Date(app.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          {app.status === "approved" && (
            <button
              onClick={() => navigate(`/candidato/timeline/${app.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F26419] text-white text-xs font-semibold rounded-xl border-none cursor-pointer hover:bg-[#C94E0D] transition-all"
            >
              <i className="fi fi-rr-rocket text-[10px]" /> Ir al timeline
            </button>
          )}
          {app.status === "pending" && (
            <span className="text-xs text-amber-500 font-medium">Esperando aprobación...</span>
          )}
          {app.status === "rejected" && (
            <span className="text-xs text-red-400">No seleccionado</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MisPostulaciones() {
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res  = await fetch("/api/applications/mine", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setApplications(data.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetch_();
  }, [token]);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const counts = {
    all:      applications.length,
    pending:  applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const hora   = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <SideBar />
        <main className="ml-24 flex-1 p-8">

          <div className="mb-8">
            <p className="text-sm text-gray-400">{saludo} 👋</p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{user?.name || "Candidato"}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Proyectos a los que te has postulado</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <i className="fi fi-rr-paper-plane text-[#F26419]" /> Mis postulaciones
              </h2>
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
                {[
                  { key: "all",      label: "Todas"      },
                  { key: "pending",  label: "Pendientes" },
                  { key: "approved", label: "Aprobadas"  },
                  { key: "rejected", label: "Rechazadas" },
                ].map((f) => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all flex items-center gap-1.5
                      ${filter === f.key ? "bg-white text-[#F26419] shadow-sm" : "bg-transparent text-gray-400 hover:text-gray-700"}`}>
                    {f.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                      ${filter === f.key ? "bg-orange-50 text-[#F26419]" : "bg-gray-100 text-gray-400"}`}>
                      {counts[f.key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} />)}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <i className="fi fi-rr-paper-plane text-3xl text-gray-300 block mb-3" />
                <p className="text-gray-500 font-medium text-sm mb-1">
                  {filter === "all" ? "Aún no te has postulado a ningún proyecto" : `Sin postulaciones ${filter === "pending" ? "pendientes" : filter === "approved" ? "aprobadas" : "rechazadas"}`}
                </p>
                {filter === "all" && (
                  <button onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#F26419] text-white font-semibold text-sm rounded-xl border-none cursor-pointer hover:bg-[#C94E0D] transition-all">
                    <i className="fi fi-rr-search" /> Explorar proyectos
                  </button>
                )}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((app) => (
                  <ApplicationCard key={app.id} app={app} navigate={navigate} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}