import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";
import { NivelCard, NivelBadge } from "../Components/NivelBadge";

const API = import.meta.env.VITE_API_URL;

const PALETTES = [
  { id: "naranja", bg: "#FEF0E8", accent: "#F26419", dark: "#1C1712", label: "Impulso"  },
  { id: "oscuro",  bg: "#0F172A", accent: "#6366F1", dark: "#1E293B", label: "Oscuro"   },
  { id: "verde",   bg: "#F0FDF4", accent: "#16A34A", dark: "#14532D", label: "Natural"  },
  { id: "violeta", bg: "#F5F3FF", accent: "#7C3AED", dark: "#2E1065", label: "Creativo" },
  { id: "rosa",    bg: "#FFF1F2", accent: "#E11D48", dark: "#4C0519", label: "Rosa"     },
];

const ST = {
  approved: { label: "Completado",    cls: "bg-green-100 text-green-700" },
  pending:  { label: "En revisión",   cls: "bg-amber-100 text-amber-700" },
  rejected: { label: "No seleccionado", cls: "bg-red-100 text-red-500"  },
};

/* ── Asistente IA ────────────────────────────────────── */
function AIModal({ palette, onClose, onApply }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "¡Hola! 👋 Soy tu asistente de portafolio. Voy a ayudarte a crear una presentación profesional.\n\n¿Cuál es tu nombre completo y en qué área te especializas?" },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft]     = useState(null);
  const endRef                = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const SYSTEM = `Eres un asistente que ayuda a jóvenes profesionales a crear su portafolio en Impulso.
Haz preguntas conversacionales (una a la vez) para obtener:
- Nombre y rol profesional
- Descripción/bio profesional (2-3 oraciones)
- 5-8 habilidades técnicas y blandas
- Links relevantes (LinkedIn, GitHub, Behance, etc.)

Cuando tengas suficiente información genera un JSON con esta estructura exacta y termina con [GENERAR_PORTFOLIO]:
{"name":"...","role":"...","description":"...","skills":["skill1","skill2"],"links":[{"label":"LinkedIn","url":"https://..."}]}

Sé cálido, motivador y profesional. Responde siempre en español.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    const newMsgs = [...messages, { role: "user", text: userText }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM, messages: newMsgs.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })) }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      if (text.includes("[GENERAR_PORTFOLIO]")) {
        const match = text.replace("[GENERAR_PORTFOLIO]", "").match(/\{[\s\S]*\}/);
        if (match) {
          setDraft(JSON.parse(match[0]));
          setMessages((prev) => [...prev, { role: "ai", text: "¡Perfecto! He generado tu portafolio. Revísalo abajo y aplícalo. 🎉" }]);
        }
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: text }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Hubo un error. Intenta de nuevo." }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col" style={{ height: "600px" }}>
        <div className="px-6 py-4 flex items-center gap-3" style={{ background: palette.accent }}>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🤖</div>
          <div><p className="text-white font-bold text-sm">Asistente IA</p><p className="text-white/70 text-xs">Te ayuda a crear tu portafolio</p></div>
          <button onClick={onClose} className="ml-auto text-white/60 hover:text-white bg-none border-none cursor-pointer text-lg">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 [scrollbar-width:thin]">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${m.role === "ai" ? "text-white" : "bg-gray-200 text-gray-600"}`} style={m.role === "ai" ? { background: palette.accent } : {}}>
                {m.role === "ai" ? "🤖" : "😊"}
              </div>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${m.role === "ai" ? "bg-gray-100 text-gray-900 rounded-bl-sm" : "text-white rounded-br-sm"}`} style={m.role === "user" ? { background: palette.accent } : {}}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white" style={{ background: palette.accent }}>🤖</div>
              <div className="bg-gray-100 px-3.5 py-2.5 rounded-2xl flex gap-1 items-center">
                {[0,150,300].map((d) => <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        {draft && (
          <div className="mx-5 mb-3 p-3 rounded-2xl border-2 text-sm" style={{ borderColor: palette.accent, background: palette.bg }}>
            <p className="font-semibold mb-1" style={{ color: palette.accent }}>✨ Portafolio generado</p>
            <p className="text-gray-700 text-xs mb-2">{draft.name} · {draft.role}</p>
            <button onClick={() => { onApply(draft); onClose(); }} className="w-full py-2 rounded-xl text-white text-xs font-semibold cursor-pointer border-none hover:opacity-90" style={{ background: palette.accent }}>
              Aplicar al portafolio
            </button>
          </div>
        )}
        <div className="px-5 pb-4 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escribe aquí..."
            className="flex-1 px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-full bg-gray-50 text-sm outline-none focus:border-gray-400 transition-all" />
          <button onClick={send} disabled={loading || !input.trim()} className="w-10 h-10 rounded-full text-white border-none cursor-pointer hover:opacity-90 disabled:opacity-40 flex items-center justify-center" style={{ background: palette.accent }}>
            <i className="fi fi-sr-paper-plane-launch text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ImpulsoJobCard({ job, palette }) {
  const pct = job.total_steps > 0 ? Math.round((job.steps_completed / job.total_steps) * 100) : 0;
  const st  = ST[job.status] || ST.pending;
  return (
    <div className="rounded-2xl border bg-white overflow-hidden hover:shadow-md transition-all">
      <div className="h-1.5 rounded-t-full" style={{ background: palette.accent }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{job.job_title}</h4>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${st.cls}`}>{st.label}</span>
        </div>
        <p className="text-xs text-gray-400 mb-2">{job.company_name} · {job.profile_area}</p>
        {job.status === "approved" && job.total_steps > 0 && (
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>Progreso</span><span>{job.steps_completed}/{job.total_steps} etapas</span></div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: palette.accent }} />
            </div>
          </div>
        )}
        <p className="text-[10px] text-gray-400 mt-2">{new Date(job.created_at).toLocaleDateString("es-CO", { month: "short", year: "numeric" })}</p>
      </div>
    </div>
  );
}

function CustomProjectCard({ project, palette, onEdit, onDelete, editMode }) {
  return (
    <div className="rounded-2xl overflow-hidden border bg-white hover:shadow-lg transition-all">
      {project.img ? (
        <img src={project.img} alt={project.title} className="h-36 w-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
      ) : (
        <div className="h-36 flex items-center justify-center text-4xl" style={{ background: palette.bg }}>🚀</div>
      )}
      <div className="p-4">
        <h4 className="font-semibold text-sm text-gray-900 mb-1">{project.title}</h4>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{project.description}</p>
        {project.url && (
          <a href={project.url} target="_blank" rel="noreferrer" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: palette.accent }}>
            <i className="fi fi-rr-link text-[10px]" /> Ver proyecto
          </a>
        )}
        {editMode && (
          <div className="flex gap-2 mt-3">
            <button onClick={onEdit} className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-600 cursor-pointer hover:border-gray-400">Editar</button>
            <button onClick={onDelete} className="flex-1 text-xs py-1.5 rounded-lg border border-red-200 text-red-500 cursor-pointer hover:bg-red-50">Eliminar</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════ */
export default function Portfolio() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  const isOwner = !id || id === user?.id;

  const [portfolio, setPortfolio]       = useState(null);
  const [jobs, setJobs]                 = useState([]);
  const [candidateData, setCandidateData] = useState(null); // nivel + puntos
  const [loading, setLoading]           = useState(true);
  const [editMode, setEditMode]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [showAI, setShowAI]             = useState(false);
  const [toast, setToast]               = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [skillInput, setSkillInput]     = useState("");

  const activePalette = PALETTES.find((p) => p.id === portfolio?.bg_color) || PALETTES[0];

  useEffect(() => {
    const load = async () => {
      try {
        if (isOwner) {
          const [pRes, jRes, uRes] = await Promise.all([
            fetch(`${API}/api/portfolio/me`,      { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API}/api/portfolio/me/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API}/api/auth/me`,           { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          const [pData, jData, uData] = await Promise.all([pRes.json(), jRes.json(), uRes.json()]);
          setPortfolio(pData.portfolio ? parse(pData.portfolio) : defaultPortfolio(user));
          setJobs(jData.applications || []);
          setCandidateData(uData.user);
          if (!pData.portfolio) setShowAI(true);
        } else {
          // Vista pública — cargar portafolio + jobs del candidato
          const [pRes] = await Promise.all([
            fetch(`${API}/api/portfolio/${id}`),
            fetch(`${API}/api/portfolio/${id}/jobs`).catch(() => ({ json: () => ({ applications: [] }) })),
          ]);
          const pData = await pRes.json();
          if (!pData.portfolio) { navigate("/404"); return; }
          setPortfolio(parse(pData.portfolio));
          // Intentar cargar datos del usuario dueño (nivel)
          const ownerRes = await fetch(`${API}/api/auth/candidate/${pData.portfolio.user_id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
          if (ownerRes?.ok) { const ownerData = await ownerRes.json(); setCandidateData(ownerData.candidate); }
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    if (token || !isOwner) load();
  }, [token, id]);

  const parse = (p) => ({
    ...p,
    skills:         Array.isArray(p.skills)         ? p.skills         : JSON.parse(p.skills         || "[]"),
    links:          Array.isArray(p.links)           ? p.links          : JSON.parse(p.links          || "[]"),
    customprojects: Array.isArray(p.customprojects)  ? p.customprojects : JSON.parse(p.customprojects || "[]"),
  });

  const defaultPortfolio = (u) => ({
    name: u?.name || "", role: "", description: "", bg_color: "naranja",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || "U")}&background=F26419&color=fff&size=128`,
    skills: [], links: [], customprojects: [],
  });

  const save = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/portfolio`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(portfolio) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPortfolio(parse(data.portfolio));
      setEditMode(false);
      showToast("success", "Portafolio guardado ✓");
    } catch (err) { showToast("error", err.message); } finally { setSaving(false); }
  };

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };
  const set = (field, val) => setPortfolio((p) => ({ ...p, [field]: val }));

  const applyAI = (draft) => {
    setPortfolio((p) => ({ ...p, name: draft.name || p.name, role: draft.role || p.role, description: draft.description || p.description, skills: draft.skills || p.skills, links: draft.links || p.links }));
    setEditMode(true);
    showToast("success", "Portafolio generado por IA ✨ Revisa y guarda.");
  };

  const saveProject = (proj, idx) => {
    const list = [...(portfolio.customprojects || [])];
    if (idx === "new") list.push(proj); else list[idx] = proj;
    set("customprojects", list); setEditingProject(null);
  };
  const deleteProject = (idx) => { const list = [...(portfolio.customprojects || [])]; list.splice(idx, 1); set("customprojects", list); };
  const addSkill = (s) => { const v = s.trim(); if (!v || (portfolio.skills || []).includes(v)) return; set("skills", [...(portfolio.skills || []), v]); setSkillInput(""); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-[#F26419] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Cargando portafolio...</p>
      </div>
    </div>
  );

  if (!portfolio) return null;

  const pal    = activePalette;
  const isDark = pal.id === "oscuro";
  const nivel  = candidateData?.nivel_impulso  || 1;
  const puntos = candidateData?.puntos_totales || 0;

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen" style={{ background: pal.bg }}>
        <main className="flex-1 ml-24 pt-20 pb-16 px-8 max-w-5xl">

          {/* HERO */}
          <div className="relative rounded-3xl overflow-hidden mb-8 shadow-xl" style={{ background: `linear-gradient(135deg, ${pal.accent}, ${pal.dark})` }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-white" style={{ transform: "translate(30%,-30%)" }} />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10 bg-white" style={{ transform: "translate(-30%,30%)" }} />
            <div className="relative z-10 p-8 flex items-end justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-5">
                <img src={portfolio.avatar} alt={portfolio.name}
                  className="w-20 h-20 rounded-2xl border-4 border-white/30 object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(portfolio.name)}&background=ffffff&color=333`; }} />
                <div>
                  {editMode ? (
                    <>
                      <input value={portfolio.name} onChange={(e) => set("name", e.target.value)} placeholder="Tu nombre"
                        className="bg-white/10 text-white font-bold text-xl border border-white/20 rounded-xl px-3 py-1 outline-none mb-1 block w-full placeholder-white/40" />
                      <input value={portfolio.role} onChange={(e) => set("role", e.target.value)} placeholder="Tu rol profesional"
                        className="bg-white/10 text-white/80 text-sm border border-white/20 rounded-xl px-3 py-1 outline-none block w-full placeholder-white/40" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-white font-bold text-2xl tracking-tight">{portfolio.name || "Tu nombre"}</h1>
                      <p className="text-white/70 text-sm mt-0.5">{portfolio.role || "Tu rol profesional"}</p>
                      {/* Nivel badge en el hero */}
                      <div className="mt-2">
                        <NivelBadge nivel={nivel} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-2 flex-wrap">
                  {!editMode && <button onClick={() => setShowAI(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-xl border border-white/20 cursor-pointer hover:bg-white/20">✨ Asistente IA</button>}
                  <button onClick={() => editMode ? save() : setEditMode(true)} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-sm font-semibold rounded-xl cursor-pointer hover:bg-white/90 disabled:opacity-60" style={{ color: pal.accent }}>
                    {saving ? <><i className="fi fi-rr-spinner animate-spin" /> Guardando...</> : editMode ? <><i className="fi fi-rr-check" /> Guardar</> : <><i className="fi fi-rr-edit" /> Editar</>}
                  </button>
                  {editMode && <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-xl border border-white/20 cursor-pointer hover:bg-white/20">Cancelar</button>}
                </div>
              )}
              {isOwner && portfolio.id && !editMode && (
                <div className="w-full flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 mt-1">
                  <i className="fi fi-rr-link text-white/60 text-xs" />
                  <span className="text-white/60 text-xs truncate flex-1">Comparte tu portafolio:</span>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/portafolio/${portfolio.id}`); showToast("success", "¡Link copiado!"); }}
                    className="text-xs text-white font-medium cursor-pointer bg-none border-none hover:text-white/80">Copiar link</button>
                </div>
              )}
            </div>
          </div>

          {/* Paleta */}
          {editMode && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Tema del portafolio</p>
              <div className="flex gap-3 flex-wrap">
                {PALETTES.map((p) => (
                  <button key={p.id} onClick={() => set("bg_color", p.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer text-sm font-medium ${portfolio.bg_color === p.id ? "border-gray-900" : "border-gray-200 hover:border-gray-400"}`}>
                    <span className="w-4 h-4 rounded-full" style={{ background: p.accent }} />{p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-[1fr_280px] gap-6 max-lg:grid-cols-1">
            {/* Columna principal */}
            <div className="space-y-6">

              {/* Bio */}
              <section className={`rounded-2xl p-6 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-100"} shadow-sm`}>
                <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Sobre mí</h2>
                {editMode ? (
                  <textarea value={portfolio.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Cuéntale al mundo quién eres..."
                    className="w-full px-3.5 py-3 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-gray-400 resize-none leading-relaxed" />
                ) : (
                  <p className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}>
                    {portfolio.description || <span className="italic text-gray-400">{isOwner ? "¡Edita tu portafolio o usa el asistente IA!" : "Sin descripción aún."}</span>}
                  </p>
                )}
              </section>

              {/* Proyectos en Impulso */}
              {jobs.length > 0 && (
                <section className={`rounded-2xl p-6 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-100"} shadow-sm`}>
                  <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ background: pal.accent }}>I</span>
                    Experiencia en Impulso
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {jobs.map((j, i) => <ImpulsoJobCard key={i} job={j} palette={pal} />)}
                  </div>
                </section>
              )}

              {/* Proyectos externos */}
              <section className={`rounded-2xl p-6 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-100"} shadow-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-400"}`}>Proyectos personales</h2>
                  {editMode && (
                    <button onClick={() => setEditingProject({ title: "", description: "", url: "", img: "" })}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl text-white cursor-pointer border-none hover:opacity-90" style={{ background: pal.accent }}>
                      <i className="fi fi-rr-plus text-[10px]" /> Agregar
                    </button>
                  )}
                </div>
                {(portfolio.customprojects || []).length === 0 && !editMode && (
                  <p className={`text-sm italic ${isDark ? "text-white/30" : "text-gray-400"}`}>{isOwner ? "Agrega proyectos personales para mostrar tu trabajo." : "Sin proyectos agregados aún."}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(portfolio.customprojects || []).map((proj, i) => (
                    <CustomProjectCard key={i} project={proj} palette={pal} editMode={editMode}
                      onEdit={() => setEditingProject({ ...proj, _idx: i })}
                      onDelete={() => deleteProject(i)} />
                  ))}
                  {editMode && (
                    <button onClick={() => setEditingProject({ title: "", description: "", url: "", img: "" })}
                      className="h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-400 hover:text-gray-600 cursor-pointer bg-transparent">
                      <i className="fi fi-rr-plus text-2xl" /><span className="text-sm font-medium">Nuevo proyecto</span>
                    </button>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar derecha */}
            <div className="space-y-5">

              {/* NIVEL IMPULSO — nuevo */}
              <NivelCard nivel={nivel} puntos={puntos} />

              {/* Skills */}
              <section className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-100"} shadow-sm`}>
                <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Habilidades</h2>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(portfolio.skills || []).map((s, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full text-white" style={{ background: pal.accent }}>
                      {s}
                      {editMode && <button onClick={() => set("skills", portfolio.skills.filter((_, j) => j !== i))} className="ml-0.5 opacity-70 hover:opacity-100 cursor-pointer bg-none border-none text-white leading-none">×</button>}
                    </span>
                  ))}
                  {!(portfolio.skills || []).length && <span className="text-xs text-gray-400 italic">Sin habilidades aún</span>}
                </div>
                {editMode && (
                  <div className="flex gap-1.5">
                    <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))} placeholder="Ej: Figma"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl bg-gray-50 text-xs outline-none focus:border-gray-400" />
                    <button onClick={() => addSkill(skillInput)} className="px-3 py-1.5 rounded-xl text-white text-xs font-medium cursor-pointer border-none hover:opacity-90" style={{ background: pal.accent }}>+</button>
                  </div>
                )}
              </section>

              {/* Links */}
              <section className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-100"} shadow-sm`}>
                <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Links</h2>
                <div className="space-y-2">
                  {(portfolio.links || []).map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {editMode ? (
                        <>
                          <input value={l.label} onChange={(e) => { const list = [...portfolio.links]; list[i] = { ...l, label: e.target.value }; set("links", list); }} placeholder="Nombre" className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-xs outline-none" />
                          <input value={l.url}   onChange={(e) => { const list = [...portfolio.links]; list[i] = { ...l, url: e.target.value }; set("links", list); }}   placeholder="https://..." className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-xs outline-none" />
                          <button onClick={() => set("links", portfolio.links.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xs cursor-pointer bg-none border-none">×</button>
                        </>
                      ) : (
                        <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium hover:underline" style={{ color: pal.accent }}>
                          <i className="fi fi-rr-link text-[10px]" />{l.label || l.url}
                        </a>
                      )}
                    </div>
                  ))}
                  {!(portfolio.links || []).length && !editMode && <span className="text-xs text-gray-400 italic">Sin links</span>}
                  {editMode && <button onClick={() => set("links", [...(portfolio.links || []), { label: "", url: "" }])} className="text-xs mt-1 cursor-pointer bg-none border-none font-medium" style={{ color: pal.accent }}>+ Agregar link</button>}
                </div>
              </section>

              {/* Stats */}
              {jobs.length > 0 && (
                <section className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-100"} shadow-sm`}>
                  <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Estadísticas</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ label: "Proyectos", value: jobs.length },{ label: "Completados", value: jobs.filter((j) => j.status === "approved").length }].map(({ label, value }) => (
                      <div key={label} className={`rounded-xl p-3 text-center ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                        <p className="text-2xl font-black" style={{ color: pal.accent }}>{value}</p>
                        <p className={`text-[10px] font-medium mt-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>{label}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {showAI && isOwner && <AIModal palette={pal} onClose={() => setShowAI(false)} onApply={applyAI} />}

      {editingProject !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4">{editingProject._idx !== undefined ? "Editar proyecto" : "Nuevo proyecto"}</h3>
            <div className="space-y-3">
              {[{ field:"title", label:"Título", ph:"Mi proyecto" },{ field:"description", label:"Descripción", ph:"De qué trata...", textarea:true },{ field:"url", label:"Link", ph:"https://..." },{ field:"img", label:"Imagen URL", ph:"https://... (opcional)" }].map(({ field, label, ph, textarea }) => (
                <div key={field}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
                  {textarea ? (
                    <textarea value={editingProject[field] || ""} onChange={(e) => setEditingProject((p) => ({ ...p, [field]: e.target.value }))} placeholder={ph} rows={3} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-gray-400 resize-none" />
                  ) : (
                    <input value={editingProject[field] || ""} onChange={(e) => setEditingProject((p) => ({ ...p, [field]: e.target.value }))} placeholder={ph} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-gray-400" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditingProject(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50">Cancelar</button>
              <button onClick={() => saveProject({ title: editingProject.title, description: editingProject.description, url: editingProject.url, img: editingProject.img }, editingProject._idx !== undefined ? editingProject._idx : "new")}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer border-none hover:opacity-90" style={{ background: pal.accent }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-2xl z-50 animate-[slideUp_0.3s_ease] ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}