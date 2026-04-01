import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SideBar from "../Components/Sidebar";
import StatsCards from "../Components/StatsCards";
import Footer from "../Components/Footer";

const STATUS = {
  published: { label: "Activo", dot: "bg-green-400", pill: "bg-green-50 text-green-600 border border-green-200" },
  draft: { label: "Borrador", dot: "bg-amber-400", pill: "bg-amber-50 text-amber-600 border border-amber-200" },
  closed: { label: "Cerrado", dot: "bg-gray-300", pill: "bg-gray-50 text-gray-500 border border-gray-200" },
};

const CARD_COLORS = ["from-orange-400 to-rose-400", "from-violet-400 to-purple-500", "from-teal-400 to-cyan-500", "from-blue-400 to-indigo-500", "from-green-400 to-emerald-500"];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="h-1 bg-gray-100 rounded w-full mb-5" />
      <div className="flex justify-between mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl" />
          <div>
            <div className="h-3.5 bg-gray-100 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
        </div>
        <div className="h-5 bg-gray-100 rounded-full w-16" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
      <div className="h-3 bg-gray-100 rounded w-3/4 mb-4" />
      <div className="flex gap-3">
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
}

function ProjectCard({ job, navigate }) {
  const st = STATUS[job.status] || STATUS.draft;
  const initials = job.title?.slice(0, 2).toUpperCase() || "PR";
  const color = CARD_COLORS[job.title?.charCodeAt(0) % CARD_COLORS.length] || CARD_COLORS[0];
  const count = parseInt(job.applications_count) || 0;

  return (
    <div onClick={() => navigate("/empresa/timeline")} className="group bg-white rounded-2xl border border-gray-100 hover:border-[#F26419]/30 hover:shadow-[0_8px_30px_rgba(242,100,25,0.1)] transition-all duration-200 cursor-pointer overflow-hidden">
      <div className={`h-1 bg-linear-to-r ${color} w-full`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>{initials}</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-[#F26419] transition-colors">{job.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(job.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1.5 ${st.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>
        {job.summary && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{job.summary}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {job.duration && (
            <span className="flex items-center gap-1">
              <i className="fi fi-rr-clock text-[11px]" /> {job.duration}
            </span>
          )}
          {job.profile_area && (
            <span className="flex items-center gap-1">
              <i className="fi fi-rr-tag text-[11px]" /> {job.profile_area}
            </span>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <i className="fi fi-rr-users text-[11px]" />
            {count} postulante{count !== 1 ? "s" : ""}
          </span>
          <span className="text-xs font-medium text-[#F26419] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver detalle <i className="fi fi-rr-arrow-right text-[11px]" />
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ filter, onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
        <i className="fi fi-rr-folder-open text-3xl text-gray-300" />
      </div>
      <p className="text-gray-600 font-semibold mb-1">{filter === "all" ? "Aún no tienes proyectos" : `Sin proyectos ${filter === "published" ? "activos" : filter === "draft" ? "en borrador" : "cerrados"}`}</p>
      <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">{filter === "all" ? "Crea tu primer proyecto con IA y empieza a encontrar talento." : "Prueba otro filtro o crea un nuevo proyecto."}</p>
      {filter === "all" && (
        <button onClick={onCreateClick} className="flex items-center gap-2 px-5 py-2.5 bg-[#F26419] text-white font-semibold text-sm rounded-xl border-none cursor-pointer transition-all hover:bg-[#C94E0D]">
          <i className="fi fi-rr-plus text-sm" /> Crear primer proyecto
        </button>
      )}
    </div>
  );
}

export default function Empresa() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/jobs/mine", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al cargar proyectos");
        }
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const filterTabs = [
    { key: "all", label: "Todos", count: jobs.length },
    { key: "published", label: "Activos", count: jobs.filter((j) => j.status === "published").length },
    { key: "draft", label: "Borradores", count: jobs.filter((j) => j.status === "draft").length },
    { key: "closed", label: "Cerrados", count: jobs.filter((j) => j.status === "closed").length },
  ];

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <SideBar />
        <main className="ml-24 flex-1 p-8">
          {/* HEADER */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-sm text-gray-400 font-medium mb-0.5">{saludo} 👋</p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{user?.name || "Empresa"}</h1>
              <p className="text-gray-400 text-sm mt-1">Gestiona tus proyectos y encuentra talento joven</p>
            </div>
            <button onClick={() => navigate("/empresa/crear-proyecto")} className="flex items-center gap-2 px-5 py-2.5 bg-[#F26419] text-white font-semibold text-sm rounded-xl border-none cursor-pointer transition-all hover:bg-[#C94E0D] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,100,25,0.35)]">
              <i className="fi fi-rr-plus text-sm" /> Crear proyecto
            </button>
          </div>

          {/* STATS */}
          {!loading && !error && <StatsCards jobs={jobs} />}

          {/* PROYECTOS */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <i className="fi fi-rr-briefcase text-[#F26419]" /> Tus proyectos
              </h2>
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
                {filterTabs.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all flex items-center gap-1.5
                    ${filter === f.key ? "bg-white text-[#F26419] shadow-sm" : "bg-transparent text-gray-400 hover:text-gray-700"}`}
                  >
                    {f.label}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${filter === f.key ? "bg-orange-50 text-[#F26419]" : "bg-gray-100 text-gray-400"}`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                <i className="fi fi-rr-exclamation text-red-400" />
                <p className="text-sm text-red-500">{error}</p>
                <button onClick={() => window.location.reload()} className="ml-auto text-xs text-red-400 underline cursor-pointer bg-none border-none">
                  Reintentar
                </button>
              </div>
            )}

            {/* Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Vacío */}
            {!loading && !error && filtered.length === 0 && <EmptyState filter={filter} onCreateClick={() => navigate("/empresa/crear-proyecto")} />}

            {/* Grid */}
            {!loading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((job) => (
                  <ProjectCard key={job.id} job={job} navigate={navigate} />
                ))}
                <button onClick={() => navigate("/empresa/crear-proyecto")} className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#F26419] hover:text-[#F26419] hover:bg-orange-50/30 transition-all cursor-pointer bg-transparent min-h-45 group">
                  <div className="w-11 h-11 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fi fi-rr-plus text-lg" />
                  </div>
                  <span className="text-sm font-medium">Nuevo proyecto</span>
                </button>
              </div>
            )}
          </div>
        </main>
        <div></div>
      </div>

      <Footer />
    </>
  );
}
