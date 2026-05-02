import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { useAuth } from "../Context/Authcontext";
import StatsCards from "../Components/StatsCards";
import Footer from "../Components/footer";
import Navbar from "../Components/Navbar";

const API = import.meta.env.VITE_API_URL;

const STATUS = {
  published: { label: "Activo", dot: "bg-green-400", pill: "bg-green-50 text-green-600 border border-green-200" },
  draft: { label: "Borrador", dot: "bg-amber-400", pill: "bg-amber-50 text-amber-600 border border-amber-200" },
  closed: { label: "Cerrado", dot: "bg-gray-300", pill: "bg-gray-50 text-gray-500 border border-gray-200" },
};

const CARD_COLORS = ["from-orange-400 to-rose-400", "from-violet-400 to-purple-500", "from-teal-400 to-cyan-500", "from-blue-400 to-indigo-500", "from-green-400 to-emerald-500"];

const MODALIDAD_BADGE = {
  presencial: { label: "Presencial", icon: "🏢", cls: "bg-blue-50 text-blue-600 border-blue-100" },
  hibrido: { label: "Híbrido", icon: "🔀", cls: "bg-purple-50 text-purple-600 border-purple-100" },
  remoto: { label: "Remoto", icon: "🌐", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
};

/* ── Stat Card ────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F26419]/20 px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <i className={`fi ${icon} text-lg ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="h-1.5 bg-gray-100 rounded w-full mb-5" />
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

/* ── Mi proyecto card ─────────────────────────────────────────────────── */
function MyProjectCard({ job, navigate }) {
  const st = STATUS[job.status] || STATUS.draft;
  const initials = job.title?.slice(0, 2).toUpperCase() || "PR";
  const color = CARD_COLORS[job.title?.charCodeAt(0) % CARD_COLORS.length] || CARD_COLORS[0];
  const count = parseInt(job.applications_count) || 0;

  return (
    <div onClick={() => navigate(`/empresa/proyecto/${job.id}/postulantes`)} className="group bg-white rounded-2xl border border-gray-100 hover:border-[#F26419]/30 hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden flex flex-col">
      <div className={`h-1.5 bg-linear-to-r ${color} w-full`} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md`}>{initials}</div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-[#F26419] transition-colors">{job.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(job.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1.5 ${st.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>

        {job.summary && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1">{job.summary}</p>}

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          {job.duration && <span>⏱ {job.duration}</span>}
          {job.profile_area && <span>🏷 {job.profile_area}</span>}
        </div>

        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            👥 {count} postulante{count !== 1 ? "s" : ""}
          </span>
          <span className="text-xs font-semibold text-[#F26419] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Ver detalle →</span>
        </div>
      </div>
    </div>
  );
}

/* ── Public job card (explorar) ───────────────────────────────────────── */
function PublicJobCard({ job, navigate }) {
  const initials = job.title?.slice(0, 2).toUpperCase() || "PR";
  const color = CARD_COLORS[job.title?.charCodeAt(0) % CARD_COLORS.length] || CARD_COLORS[0];
  const modal = MODALIDAD_BADGE[job.modalidad] || MODALIDAD_BADGE.remoto;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all overflow-hidden">
      <div className={`h-1.5 bg-linear-to-r ${color}`} />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}>{initials}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#F26419] transition-colors">{job.title}</h3>
            <p className="text-xs text-gray-400">{job.company_name || "Empresa"}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{job.summary}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.duration && <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">⏱ {job.duration}</span>}
          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${modal.cls}`}>
            {modal.icon} {modal.label}
          </span>
          {job.pago > 0 && <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold">💰 ${parseInt(job.pago).toLocaleString("es-CO")}</span>}
        </div>
        <div className="pt-3 border-t border-gray-50">
          <button onClick={() => navigate(`/proyecto/${job.id}`)} className="text-xs text-[#F26419] font-semibold bg-transparent border-none cursor-pointer hover:underline">
            Ver detalle →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────── */
function EmptyState({ filter, onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">📂</div>
      <p className="text-gray-600 font-semibold text-sm mb-1">{filter === "all" ? "Aún no tienes proyectos" : `Sin proyectos ${filter === "published" ? "activos" : filter === "draft" ? "en borrador" : "cerrados"}`}</p>
      <p className="text-xs text-gray-400 mb-5 max-w-xs leading-relaxed">{filter === "all" ? "Crea tu primer proyecto y empieza a encontrar talento." : "Prueba otro filtro o crea un nuevo proyecto."}</p>
      {filter === "all" && (
        <button onClick={onCreateClick} className="flex items-center gap-2 px-5 py-2.5 bg-[#F26419] text-white font-semibold text-sm rounded-xl border-none cursor-pointer hover:bg-[#C94E0D] transition-all">
          + Crear primer proyecto
        </button>
      )}
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────────────────── */
export default function Empresa() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [myJobs, setMyJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showExplore, setShowExplore] = useState(false);
  const [searchExplore, setSearchExplore] = useState("");

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
  const firstName = user?.name?.split(" ")[0] || "Empresa";

  /* Cargar mis proyectos */
  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/jobs/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar proyectos");
        setMyJobs(data.jobs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetch_();
  }, [token]);

  /* Cargar todos los proyectos al abrir explorar */
  useEffect(() => {
    if (!showExplore || allJobs.length > 0) return;
    const fetch_ = async () => {
      setLoadingAll(true);
      try {
        const res = await fetch(`${API}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAllJobs(data.jobs || []);
      } catch {
        /* silencioso */
      } finally {
        setLoadingAll(false);
      }
    };
    fetch_();
  }, [showExplore, token, allJobs.length]);

  const filtered = filter === "all" ? myJobs : myJobs.filter((j) => j.status === filter);

  const filteredAll = allJobs.filter((j) => !searchExplore || j.title?.toLowerCase().includes(searchExplore.toLowerCase()) || j.profile_area?.toLowerCase().includes(searchExplore.toLowerCase()) || j.company_name?.toLowerCase().includes(searchExplore.toLowerCase()));

  const filterTabs = [
    { key: "all", label: "Todos", count: myJobs.length },
    { key: "published", label: "Activos", count: myJobs.filter((j) => j.status === "published").length },
    { key: "draft", label: "Borradores", count: myJobs.filter((j) => j.status === "draft").length },
    { key: "closed", label: "Cerrados", count: myJobs.filter((j) => j.status === "closed").length },
  ];

  const totalPostulantes = myJobs.reduce((acc, j) => acc + (parseInt(j.applications_count) || 0), 0);
  const activos = myJobs.filter((j) => j.status === "published").length;

  return (
    <>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        .proj-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:1rem; }
      `}</style>

      <Navbar />

      <div className="min-h-screen bg-[#F7F7F8] flex flex-col">
        <main className="mt-16 flex-1 px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* ── Welcome Banner ─────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1C1712] via-[#2a1f14] to-[#1C1712] p-7 shadow-2xl">
              <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-[#F26419]/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-20 w-36 h-36 rounded-full bg-orange-400/8 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between flex-wrap gap-5">
                <div>
                  <p className="text-white/50 text-sm mb-1">{saludo} 👋</p>
                  <h1 className="text-white text-3xl font-black tracking-tight leading-none">{firstName}</h1>
                  <p className="text-white/40 text-sm mt-2 max-w-md">Gestiona tus proyectos, revisa postulantes y descubre el talento que busca tu empresa.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Botón explorar todos los trabajos */}
                  <button
                    onClick={() => {
                      setShowExplore(!showExplore);
                      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl border transition-all cursor-pointer ${showExplore ? "bg-white text-[#1C1712] border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}
                  >
                    🌐 {showExplore ? "Ocultar explorador" : "Explorar todos los trabajos"}
                  </button>

                  <button onClick={() => navigate("/empresa/crear-proyecto")} className="flex items-center gap-2 px-5 py-2.5 bg-[#F26419] text-white font-bold text-sm rounded-xl border-none cursor-pointer hover:bg-[#C94E0D] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,100,25,0.4)] transition-all">
                    + Crear proyecto
                  </button>
                </div>
              </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────────────────── */}
            {!loading && !error && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total proyectos" value={myJobs.length} icon="fi-rr-folder" iconBg="bg-orange-50" iconColor="text-[#F26419]" />
                <StatCard label="Activos" value={activos} icon="fi-rr-check-circle" iconBg="bg-green-50" iconColor="text-green-500" />
                <StatCard label="Postulantes" value={totalPostulantes} icon="fi-rr-users" iconBg="bg-violet-50" iconColor="text-violet-500" />
                <StatCard label="Borradores" value={myJobs.filter((j) => j.status === "draft").length} icon="fi-rr-edit" iconBg="bg-amber-50" iconColor="text-amber-500" />
              </div>
            )}

            {/* ── Mis proyectos ───────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">📋 Mis proyectos</h2>
                  {!loading && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {/* Filtros */}
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

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                  <span className="text-red-400">⚠️</span>
                  <p className="text-sm text-red-500">{error}</p>
                  <button onClick={() => window.location.reload()} className="ml-auto text-xs text-red-400 underline cursor-pointer bg-transparent border-none">
                    Reintentar
                  </button>
                </div>
              )}

              {loading && (
                <div className="proj-grid">
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {!loading && !error && filtered.length === 0 && <EmptyState filter={filter} onCreateClick={() => navigate("/empresa/crear-proyecto")} />}

              {!loading && !error && filtered.length > 0 && (
                <div className="proj-grid">
                  {filtered.map((job) => (
                    <MyProjectCard key={job.id} job={job} navigate={navigate} />
                  ))}
                  {/* Card para crear nuevo */}
                  <button onClick={() => navigate("/empresa/crear-proyecto")} className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#F26419] hover:text-[#F26419] hover:bg-orange-50/30 transition-all cursor-pointer bg-transparent min-h-45 group">
                    <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform text-xl">+</div>
                    <span className="text-sm font-semibold">Nuevo proyecto</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── Explorar todos los trabajos (desplegable) ───────────── */}
            {showExplore && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-[fadeIn_0.3s_ease]">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">🌐 Explorar todos los trabajos</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Proyectos publicados por todas las empresas en Impulso</p>
                  </div>
                  <button onClick={() => setShowExplore(false)} className="text-xs text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer flex items-center gap-1">
                    ✕ Cerrar
                  </button>
                </div>

                {/* Buscador */}
                <div className="relative mb-5">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input value={searchExplore} onChange={(e) => setSearchExplore(e.target.value)} placeholder="Buscar por título, área o empresa..." className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all" />
                </div>

                {loadingAll && (
                  <div className="proj-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                )}

                {!loadingAll && filteredAll.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="text-sm text-gray-400 font-medium">{searchExplore ? "Sin resultados para tu búsqueda" : "No hay proyectos publicados aún"}</p>
                    {searchExplore && (
                      <button onClick={() => setSearchExplore("")} className="mt-2 text-xs text-[#F26419] underline bg-transparent border-none cursor-pointer">
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                )}

                {!loadingAll && filteredAll.length > 0 && (
                  <>
                    <p className="text-xs text-gray-400 mb-4">
                      {filteredAll.length} proyecto{filteredAll.length !== 1 ? "s" : ""} encontrado{filteredAll.length !== 1 ? "s" : ""}
                    </p>
                    <div className="proj-grid">
                      {filteredAll.map((job) => (
                        <PublicJobCard key={job.id} job={job} navigate={navigate} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
