// Página donde las empresas ven y filtran candidatos con sus portafolios
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";
import MascotaImagenPNG from "../../Public/MascotaImagen.PNG";

const API = import.meta.env.VITE_API_URL;

const NIVEL_CONFIG = [
  { min: 1, max: 2, label: "Explorador", color: "bg-gray-100 text-gray-600", ring: "ring-gray-300" },
  { min: 3, max: 4, label: "Aprendiz", color: "bg-blue-100 text-blue-700", ring: "ring-blue-300" },
  { min: 5, max: 6, label: "Practicante", color: "bg-green-100 text-green-700", ring: "ring-green-400" },
  { min: 7, max: 8, label: "Profesional", color: "bg-orange-100 text-orange-700", ring: "ring-orange-400" },
  { min: 9, max: 9, label: "Experto", color: "bg-purple-100 text-purple-700", ring: "ring-purple-400" },
  { min: 10, max: 10, label: "Impulso Elite ⚡", color: "bg-amber-100 text-amber-700", ring: "ring-amber-400" },
];

function getNivelInfo(nivel) {
  return NIVEL_CONFIG.find((n) => nivel >= n.min && nivel <= n.max) || NIVEL_CONFIG[0];
}

function NivelBadge({ nivel = 1, size = "sm" }) {
  const info = getNivelInfo(nivel);
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${info.color}
      ${size === "sm" ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1"}`}
    >
      Nv.{nivel} {info.label}
    </span>
  );
}

function CandidateCard({ candidate, navigate }) {
  const habilidades = (() => {
    try {
      return Array.isArray(candidate.habilidades) ? candidate.habilidades : JSON.parse(candidate.habilidades || "[]");
    } catch {
      return [];
    }
  })();
  const nivelInfo = getNivelInfo(candidate.nivel_impulso || 1);

  return (
    <div className="relative bg-white rounded-2xl border ...border-gray-100 hover:border-[#F26419]/30 hover:shadow-[0_8px_30px_rgba(242,100,25,0.08)] transition-all overflow-hidden group">
      {/* Barra superior con color por nivel */}
      <div className={`h-1.5 w-full ${nivelInfo.ring.replace("ring-", "bg-")}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl ring-2 ${nivelInfo.ring} flex items-center justify-center text-white font-bold text-sm flex-link-0`} style={{ background: "linear-gradient(135deg, #F26419, #C94E0D)" }}>
            {candidate.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#F26419] transition-colors truncate">{candidate.name}</h3>
            <p className="text-xs text-gray-400 truncate">
              {candidate.carrera || "Profesional"}
              {candidate.ciudad ? ` · ${candidate.ciudad}` : ""}
            </p>
          </div>
        </div>

        {candidate.bio && <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{candidate.bio}</p>}

        {habilidades.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {habilidades.slice(0, 4).map((h, i) => (
              <span key={i} className="text-[10px] bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                {h}
              </span>
            ))}
            {habilidades.length > 4 && <span className="text-[10px] text-gray-400">+{habilidades.length - 4}</span>}
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-gray-50">
          <button onClick={() => navigate(`/talento/${candidate.id}`)} className="flex-1 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 bg-white cursor-pointer hover:border-[#F26419] hover:text-[#F26419] transition-all">
            Ver perfil
          </button>
          {candidate.portfolio_id && (
            <button onClick={() => navigate(`/portafolio/${candidate.portfolio_id}`)} className="flex-1 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer border-none hover:opacity-90 transition-all" style={{ background: "#F26419" }}>
              Portafolio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TalentoHub() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterNivel, setFilterNivel] = useState("all");
  const [filterArea, setFilterArea] = useState("all");

  const AREAS = ["Marketing y Comunicación", "Diseño Gráfico / UX", "Desarrollo de Software", "Administración", "Derecho", "Ingeniería", "Psicología", "Contabilidad / Finanzas", "Educación", "Otro"];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/auth/candidates`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setCandidates(data.candidates || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const filtered = candidates
    .filter((c) => {
      const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.carrera?.toLowerCase().includes(search.toLowerCase()) || c.ciudad?.toLowerCase().includes(search.toLowerCase()) || (Array.isArray(c.habilidades) ? c.habilidades : []).some((h) => h.toLowerCase().includes(search.toLowerCase()));
      const matchNivel = filterNivel === "all" || String(c.nivel_impulso || 1) === filterNivel;
      const matchArea = filterArea === "all" || c.carrera?.toLowerCase().includes(filterArea.toLowerCase());
      return matchSearch && matchNivel && matchArea;
    })
    .sort((a, b) => (a.nivel_impulso || 1) - (b.nivel_impulso || 1));

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        <main className="pt-24 flex-1 p-8">
          {/* Header */}
          <div
            className="
  relative overflow-hidden
  rounded-[28px]
  bg-[#151515]
  border border-white/5
  p-5 sm:p-6
  mb-8
"
          >
            {/* glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 blur-3xl rounded-full" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              {/* LEFT */}
              <div className="flex items-start gap-4">
                {/* mascota */}
                <div
                  className="
        relative shrink-0
        w-20 h-20
        rounded-2xl
        bg-white/5
        border border-white/10
        flex items-center justify-center
        backdrop-blur-xl
      "
                >
                  <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full" />

                  <img
                    src={MascotaImagenPNG}
                    alt="Mascota"
                    className="
            relative z-10
            w-14 h-14
            object-contain
            animate-[float_5s_ease-in-out_infinite]
            select-none
            pointer-events-none
          "
                  />
                </div>

                {/* textos */}
                <div>
                  <p className="text-[#F26419] text-xs font-bold uppercase tracking-[0.2em] mb-1">Talent assistant</p>

                  <h1 className="text-2xl font-black text-white tracking-tight">Talento Hub</h1>

                  <p className="text-sm text-white/50 mt-2 max-w-xl leading-relaxed">Descubre perfiles destacados, revisa habilidades y encuentra candidatos alineados con las necesidades de tu empresa.</p>
                </div>
              </div>

              {/* right badge */}
              <div
                className="
      self-start lg:self-center
      px-4 py-3
      rounded-2xl
      bg-white/5
      border border-white/10
      backdrop-blur-xl
    "
              >
                <p className="text-white/40 text-xs mb-1">Talento disponible</p>

                <h3 className="text-white text-2xl font-black">{filtered.length}</h3>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="relative bg-white rounded-2xl border ...border-gray-100 p-5 mb-6 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, carrera, ciudad o habilidad..." className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#F26419] transition-all" />
            </div>
            <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#F26419] bg-white cursor-pointer">
              <option value="all">Todas las áreas</option>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <span className="text-xs text-gray-400 ml-auto">
              {filtered.length} candidato{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className=" flex items-center gap-3 mb-6 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
            <img src={MascotaImagenPNG} alt="Mascota" className="w-12 h-12 object-contain shrink-0" />

            <div>
              <p className="text-sm font-semibold text-[#C94E0D]">Consejo de Impulso AI</p>

              <p className="text-xs text-orange-700/80 leading-relaxed">Usa filtros por habilidades y carrera para encontrar candidatos más rápido.</p>
            </div>
          </div>

          {/* Grid */}
          {loading && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-orange-200 blur-3xl rounded-full opacity-40" />

                <img
                  src={MascotaImagenPNG}
                  alt="Mascota"
                  className="
        relative
        w-28 h-28
        object-contain
        animate-[float_5s_ease-in-out_infinite]
      "
                />
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-1">No encontramos candidatos</h3>

              <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-4">Intenta ajustar los filtros o buscar otras habilidades para descubrir más talento.</p>

              <button
                onClick={() => {
                  setSearch("");
                  setFilterNivel("all");
                  setFilterArea("all");
                }}
                className="
      px-4 py-2
      rounded-xl
      bg-[#F26419]
      text-white
      text-sm
      font-semibold
      border-none
      cursor-pointer
      hover:scale-[1.03]
      transition-all
    "
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <CandidateCard key={c.id} candidate={c} navigate={navigate} />
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
