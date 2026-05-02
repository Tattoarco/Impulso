// Página donde las empresas ven y filtran candidatos con sus portafolios
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";

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
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-[#F26419]/30 hover:shadow-[0_8px_30px_rgba(242,100,25,0.08)] transition-all overflow-hidden group">
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
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#F26419] mb-1">Directorio de talento</p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Talento Hub</h1>
            <p className="text-sm text-gray-400 mt-1">Descubre y conecta con los mejores profesionales de Impulso</p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-wrap gap-3 items-center">
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
              <i className="fi fi-rr-users text-4xl text-gray-300 block mb-4" />
              <p className="text-gray-500 font-medium mb-1">No se encontraron candidatos</p>
              <button
                onClick={() => {
                  setSearch("");
                  setFilterNivel("all");
                  setFilterArea("all");
                }}
                className="text-sm text-[#F26419] underline cursor-pointer bg-none border-none mt-2"
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
