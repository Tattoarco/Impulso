import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import SideBar from "../Components/Sidebar";
import Footer from "../Components/footer";
import Navbar from "../Components/Navbar";

const CARD_COLORS = ["from-orange-400 to-rose-400","from-violet-400 to-purple-500","from-teal-400 to-cyan-500","from-blue-400 to-indigo-500","from-green-400 to-emerald-500"];

const MODALIDAD_BADGE = {
  presencial: { label: "🏢 Presencial", cls: "bg-blue-50 text-blue-600 border-blue-200"   },
  hibrido:    { label: "🔀 Híbrido",    cls: "bg-purple-50 text-purple-600 border-purple-200" },
  remoto:     { label: "🌐 Remoto",     cls: "bg-green-50 text-green-600 border-green-200"  },
};

function Skeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl animate-pulse border border-gray-100">
      <div className="h-1 bg-gray-100 rounded w-full mb-4" />
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="flex-1"><div className="h-3.5 bg-gray-100 rounded w-2/3 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  );
}

function JobCard({ job, role, navigate, appliedIds, onApply, applying }) {
  const initials   = job.title?.slice(0, 2).toUpperCase() || "PR";
  const color      = CARD_COLORS[job.title?.charCodeAt(0) % CARD_COLORS.length] || CARD_COLORS[0];
  const hasApplied = appliedIds.includes(job.id);
  const modalBadge = MODALIDAD_BADGE[job.modalidad] || MODALIDAD_BADGE.remoto;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-[#F26419]/30 hover:shadow-[0_8px_30px_rgba(242,100,25,0.1)] transition-all overflow-hidden">
      <div className={`h-1 bg-linear-to-r ${color}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>{initials}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#F26419] transition-colors line-clamp-1">{job.title}</h3>
            <p className="text-xs text-gray-400">{job.company_name || "Empresa"}</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{job.summary}</p>

        {/* Badges: duración + área + modalidad + pago */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.duration && (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
              <i className="fi fi-rr-clock text-[10px] text-[#F26419]" /> {job.duration}
            </span>
          )}
          {job.profile_area && (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
              <i className="fi fi-rr-tag text-[10px] text-[#F26419]" /> {job.profile_area}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${modalBadge.cls}`}>
            {modalBadge.label}
          </span>
          {job.pago && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
              💰 ${parseInt(job.pago).toLocaleString("es-CO")}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50">
          <button onClick={() => navigate(`/proyecto/${job.id}`)} className="text-xs text-[#F26419] font-medium cursor-pointer bg-none border-none hover:underline">
            Ver detalle
          </button>

          {role === "candidato" && (
            <button
              onClick={() => !hasApplied && onApply(job.id)}
              disabled={hasApplied || applying === job.id}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border-none cursor-pointer transition-all
                ${hasApplied ? "bg-green-50 text-green-600 cursor-default" : "bg-[#F26419] text-white hover:bg-[#C94E0D] hover:-translate-y-0.5"} disabled:opacity-60 disabled:transform-none`}>
              {applying === job.id ? <><i className="fi fi-rr-spinner animate-spin" /> Enviando...</> : hasApplied ? <><i className="fi fi-rr-check" /> Postulado</> : <><i className="fi fi-rr-paper-plane" /> Postular</>}
            </button>
          )}

          {role === "empresa" && (
            <button onClick={() => navigate(`/empresa/proyecto/${job.id}/postulantes`)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 bg-white cursor-pointer hover:border-[#F26419] hover:text-[#F26419] transition-all">
              <i className="fi fi-rr-users text-[10px]" /> Ver postulantes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [appliedIds, setAppliedIds] = useState([]);
  const [applying, setApplying]     = useState(null);
  const [search, setSearch]         = useState("");
  const [toast, setToast]           = useState(null);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const url = user?.role === "empresa" ? `${API}/api/jobs/mine` : `${API}/api/jobs`;
        const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    if (token) fetchJobs();
  }, [token, API, user]);

  useEffect(() => {
    if (user?.role !== "candidato") return;
    const fetchApplied = async () => {
      try {
        const res  = await fetch(`${API}/api/applications/mine`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setAppliedIds((data.applications || []).map((a) => a.job_id));
      } catch { /* silencioso */ }
    };
    fetchApplied();
  }, [token, user, API]);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      const res  = await fetch(`${API}/api/applications`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ job_id: jobId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al postularse.");
      setAppliedIds((prev) => [...prev, jobId]);
      showToast("success", "¡Postulación enviada! La empresa revisará tu perfil.");
    } catch (err) { showToast("error", err.message); } finally { setApplying(null); }
  };

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const filtered = jobs.filter((j) => !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.profile_area?.toLowerCase().includes(search.toLowerCase()) || j.company_name?.toLowerCase().includes(search.toLowerCase()));

  const hora   = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="relative z-50"><Navbar /></div>
        <div className="flex flex-1">
          <SideBar />
          <main className="flex-1 p-8 ml-24 pt-24">
            <div className="mb-8">
              <p className="text-sm text-gray-400">{saludo} 👋</p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{user?.name || "Usuario"}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{user?.role === "candidato" ? "Explora proyectos y empieza a ganar experiencia" : "Gestiona tus proyectos y encuentra talento"}</p>
            </div>

            <div className="relative mb-6">
              <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título, área o empresa..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none focus:border-[#F26419] transition-all" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <i className="fi fi-rr-briefcase text-[#F26419]" />
                  {user?.role === "empresa" ? "Tus proyectos" : "Proyectos disponibles"}
                  {!loading && <span className="text-xs font-normal text-gray-400 ml-1">({filtered.length})</span>}
                </h2>
              </div>

              {loading && <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{[1,2,3,4,5,6].map((i) => <Skeleton key={i} />)}</div>}

              {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <i className="fi fi-rr-search text-3xl text-gray-300 block mb-3" />
                  <p className="text-gray-500 font-medium text-sm mb-1">{search ? "Sin resultados para tu búsqueda" : "No hay proyectos disponibles aún"}</p>
                  {search && <button onClick={() => setSearch("")} className="text-xs text-[#F26419] underline cursor-pointer bg-none border-none mt-1">Limpiar búsqueda</button>}
                </div>
              )}

              {!loading && filtered.length > 0 && (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((job) => (
                    <JobCard key={job.id} job={job} role={user?.role} navigate={navigate} appliedIds={appliedIds} onApply={handleApply} applying={applying} />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
        <Footer />
      </div>

      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-2xl z-50 animate-[slideUp_0.3s_ease] ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}