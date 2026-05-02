import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import Footer from "../Components/footer";

const API = import.meta.env.VITE_API_URL;

const HABILIDADES_SUGERIDAS = ["Figma", "Canva", "Adobe Illustrator", "Photoshop", "React", "JavaScript", "Python", "Node.js", "SQL", "Excel", "Power BI", "Google Analytics", "Comunicación", "Trabajo en equipo", "Gestión de proyectos", "Marketing digital", "SEO", "Redes sociales"];

// ─── Mensajes de IA por campo ─────────────────────────────────────────────────
const AI_PROMPTS = {
  bio: (text) => `Eres un coach de carrera amigable para estudiantes universitarios en Colombia. El estudiante escribió esta bio: "${text}". 
Analiza brevemente si está bien (máximo 2 oraciones de elogio o sugerencia concreta). 
Si está vacía, motívalo a escribirla con un tip específico. 
Responde en español, tono cálido, máximo 2 oraciones. Sin formateo markdown.`,

  universidad: (text) => `Eres un coach de carrera. El estudiante puso universidad: "${text}". 
Dame un mensaje de motivación muy breve (1 oración) relacionado con destacar desde su institución. 
Si está vacío dile que lo complete. En español, sin markdown.`,

  habilidades: (habs) => `Eres un coach de carrera para estudiantes. Tiene estas habilidades: ${habs.join(", ") || "ninguna aún"}.
Sugiere 1 habilidad complementaria específica que le vendría bien agregar y por qué (1-2 oraciones). 
En español, tono motivador, sin markdown.`,

  proyectos: (proyectos) => `Eres un coach de carrera. El estudiante tiene ${proyectos.length} proyecto(s) en su hoja de vida.
${proyectos.length === 0 ? "Motívalo a agregar su primer proyecto, aunque sea pequeño. Explica en 1-2 oraciones por qué los proyectos son clave." : `El último proyecto se llama "${proyectos[proyectos.length - 1]?.titulo || "sin nombre"}". Dale un tip para describirlo mejor. Máximo 2 oraciones.`}
En español, sin markdown.`,
};

// ─── Hook para llamar a la IA ─────────────────────────────────────────────────
function useAIGuide() {
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState({});
  const timers = useRef({});

  const getGuide = useCallback(async (field, promptFn, value) => {
    // Debounce por campo
    if (timers.current[field]) clearTimeout(timers.current[field]);

    timers.current[field] = setTimeout(async () => {
      setLoading((prev) => ({ ...prev, [field]: true }));
      try {
        const res = await fetch(`${API}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 120,
            messages: [{ role: "user", content: promptFn(value) }],
          }),
        });
        const data = await res.json();
        const text = data?.content?.[0]?.text || "";
        if (text) setMessages((prev) => ({ ...prev, [field]: text }));
      } catch {
        // Silencioso
      } finally {
        setLoading((prev) => ({ ...prev, [field]: false }));
      }
    }, 1200);
  }, []);

  return { messages, loading, getGuide };
}

// ─── Burbuja de mensaje IA ────────────────────────────────────────────────────
function AIBubble({ message, loading }) {
  if (!loading && !message) return null;

  return (
    <div className="flex items-start gap-2.5 mt-2 animate-[fadeIn_0.4s_ease]">
      <div className="w-6 h-6 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
        <span className="text-white text-[10px] font-bold">✦</span>
      </div>
      <div className="flex-1 bg-violet-50 border border-violet-100 rounded-xl px-3.5 py-2.5">
        {loading ? (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span className="text-xs text-violet-400">Analizando...</span>
          </div>
        ) : (
          <p className="text-xs text-violet-700 leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
}

// ─── Preview CV ───────────────────────────────────────────────────────────────
function CVPreview({ form }) {
  const habilidades = Array.isArray(form.habilidades) ? form.habilidades : [];
  const proyectos = Array.isArray(form.proyectos) ? form.proyectos : [];
  const initials =
    form.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const isEmpty = !form.bio && !form.universidad && !form.carrera && habilidades.length === 0 && proyectos.length === 0;

  return (
    <div id="cv-preview" className="bg-white font-sans text-gray-900 w-full min-h-[500px] shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#F26419] px-8 py-7 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-black shrink-0">{initials}</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-xl font-black leading-tight">{form.name || <span className="opacity-40">Tu nombre</span>}</h1>
          {form.carrera && <p className="text-white/80 text-sm font-medium mt-0.5">{form.carrera}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
            {form.ciudad && <span className="text-white/70 text-xs">📍 {form.ciudad}</span>}
            {form.linkedin && <span className="text-white/70 text-xs truncate max-w-[180px]">🔗 {form.linkedin.replace(/https?:\/\/(www\.)?/, "")}</span>}
            {form.portafolio && <span className="text-white/70 text-xs truncate max-w-[180px]">🌐 {form.portafolio.replace(/https?:\/\/(www\.)?/, "")}</span>}
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-8 py-6 space-y-5">
        {isEmpty && (
          <div className="text-center py-10 text-gray-300">
            <p className="text-4xl mb-2">📄</p>
            <p className="text-sm">Completa los campos para ver tu hoja de vida</p>
          </div>
        )}

        {/* Bio */}
        {form.bio && (
          <section>
            <CVSectionTitle>Perfil profesional</CVSectionTitle>
            <p className="text-sm text-gray-600 leading-relaxed">{form.bio}</p>
          </section>
        )}

        {/* Formación */}
        {(form.universidad || form.carrera) && (
          <section>
            <CVSectionTitle>Formación académica</CVSectionTitle>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">🎓</div>
              <div>
                {form.carrera && <p className="text-sm font-bold text-gray-900">{form.carrera}</p>}
                {form.universidad && <p className="text-sm text-gray-500">{form.universidad}</p>}
                {form.año_graduacion && <p className="text-xs text-gray-400 mt-0.5">Graduación: {form.año_graduacion}</p>}
              </div>
            </div>
          </section>
        )}

        {/* Proyectos */}
        {proyectos.filter((p) => p.titulo).length > 0 && (
          <section>
            <CVSectionTitle>Proyectos y experiencia</CVSectionTitle>
            <div className="space-y-3">
              {proyectos
                .filter((p) => p.titulo)
                .map((p, i) => (
                  <div key={i} className="border-l-2 border-orange-200 pl-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900">{p.titulo}</p>
                      {p.fecha && <span className="text-xs text-gray-400 shrink-0">{p.fecha}</span>}
                    </div>
                    {p.descripcion && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.descripcion}</p>}
                    {p.link && <p className="text-xs text-[#F26419] mt-0.5 truncate">🔗 {p.link.replace(/https?:\/\/(www\.)?/, "")}</p>}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Habilidades */}
        {habilidades.length > 0 && (
          <section>
            <CVSectionTitle>Habilidades</CVSectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {habilidades.map((h, i) => (
                <span key={i} className="bg-orange-50 text-[#F26419] text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-100">
                  {h}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="px-8 pb-5">
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] text-gray-300 text-center">Generado en Impulso</p>
        </div>
      </div>
    </div>
  );
}

function CVSectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <div className="w-1 h-4 bg-[#F26419] rounded-full" />
      <h2 className="text-[10px] font-black uppercase tracking-widest text-[#F26419]">{children}</h2>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function EditarPerfil() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const { messages: aiMsg, loading: aiLoad, getGuide } = useAIGuide();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    universidad: "",
    carrera: "",
    año_graduacion: "",
    habilidades: [],
    linkedin: "",
    portafolio: "",
    ciudad: "",
    proyectos: [],
  });

  const [habilidadInput, setHabilidadInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("editar");

  useEffect(() => {
    if (user) {
      let proyectos = [];
      try {
        proyectos = Array.isArray(user.proyectos) ? user.proyectos : JSON.parse(user.proyectos || "[]");
      } catch {
        proyectos = [];
      }

      setForm({
        name: user.name || "",
        bio: user.bio || "",
        universidad: user.universidad || "",
        carrera: user.carrera || "",
        año_graduacion: user.año_graduacion || "",
        habilidades: Array.isArray(user.habilidades) ? user.habilidades : typeof user.habilidades === "string" ? JSON.parse(user.habilidades || "[]") : [],
        linkedin: user.linkedin || "",
        portafolio: user.portafolio || "",
        ciudad: user.ciudad || "",
        proyectos,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Disparar guía IA
    if (name === "bio" && value.length > 20) getGuide("bio", AI_PROMPTS.bio, value);
    if (name === "universidad" && value.length > 3) getGuide("universidad", AI_PROMPTS.universidad, value);
  };

  const addHabilidad = (hab) => {
    const clean = hab.trim();
    if (!clean || form.habilidades.includes(clean)) return;
    const nuevas = [...form.habilidades, clean];
    setForm((prev) => ({ ...prev, habilidades: nuevas }));
    setHabilidadInput("");
    getGuide("habilidades", AI_PROMPTS.habilidades, nuevas);
  };

  const removeHabilidad = (hab) => {
    const nuevas = form.habilidades.filter((h) => h !== hab);
    setForm((prev) => ({ ...prev, habilidades: nuevas }));
  };

  // ── Proyectos ──
  const addProyecto = () => {
    const nuevos = [...form.proyectos, { titulo: "", descripcion: "", fecha: "", link: "" }];
    setForm((prev) => ({ ...prev, proyectos: nuevos }));
    getGuide("proyectos", AI_PROMPTS.proyectos, nuevos);
  };

  const updateProyecto = (i, field, value) => {
    const nuevos = form.proyectos.map((p, idx) => (idx === i ? { ...p, [field]: value } : p));
    setForm((prev) => ({ ...prev, proyectos: nuevos }));
    if (field === "titulo" && value.length > 3) {
      getGuide("proyectos", AI_PROMPTS.proyectos, nuevos);
    }
  };

  const removeProyecto = (i) => setForm((prev) => ({ ...prev, proyectos: prev.proyectos.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/auth/me/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          habilidades: form.habilidades,
          proyectos: form.proyectos,
          año_graduacion: form.año_graduacion ? parseInt(form.año_graduacion) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar.");
      updateUser(data.user);
      showToast("success", "Perfil guardado correctamente ✓");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => window.print();

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const completado = [form.bio, form.universidad, form.carrera, form.habilidades.length > 0, form.ciudad, form.proyectos.filter((p) => p.titulo).length > 0].filter(Boolean).length;

  const inputCls = "w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all";

  const printStyles = `
    @media print {
      body * { visibility: hidden !important; }
      #cv-preview, #cv-preview * { visibility: visible !important; }
      #cv-preview {
        position: fixed !important; top: 0 !important; left: 0 !important;
        width: 210mm !important; min-height: 297mm !important;
        margin: 0 !important; padding: 0 !important;
        box-shadow: none !important; border-radius: 0 !important;
      }
      @page { size: A4; margin: 0; }
    }
  `;

  return (
    <>
      <style>{`
        ${printStyles}
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(4px)}  to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="flex min-h-screen bg-gray-50">
        <main className="ml-24 flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Back */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 bg-transparent border-none cursor-pointer transition-colors">
              <i className="fi fi-rr-arrow-left text-xs" /> Volver
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white text-xl font-black shrink-0">{form.name?.[0]?.toUpperCase() || "?"}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mi hoja de vida</h1>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">✦ Con guía IA</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Edita, recibe sugerencias y descarga tu CV</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-1.5 w-28 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#F26419] rounded-full transition-all duration-500" style={{ width: `${(completado / 6) * 100}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-400">{completado}/6 completado</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer hover:border-[#F26419] hover:text-[#F26419] transition-all">
                  <i className="fi fi-rr-download text-[13px]" /> Descargar PDF
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#F26419] text-white font-semibold text-sm rounded-xl border-none cursor-pointer transition-all hover:bg-[#C94E0D] hover:-translate-y-0.5 hover:shadow-[0_5px_16px_rgba(242,100,25,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? (
                    <>
                      <i className="fi fi-rr-spinner animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fi fi-rr-check" /> Guardar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tabs mobile */}
            <div className="flex lg:hidden bg-white border border-gray-100 rounded-xl p-1 mb-4">
              {["editar", "preview"].map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all border-none cursor-pointer ${tab === t ? "bg-[#F26419] text-white" : "bg-transparent text-gray-400"}`}>
                  {t === "editar" ? "✏️ Editar" : "👁 Vista previa"}
                </button>
              ))}
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ── FORMULARIO ─────────────────────────────────────────────── */}
              <div className={`space-y-4 ${tab === "preview" ? "hidden lg:block" : ""}`}>
                {/* Info básica */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <SectionHeader icon="👤" title="Información básica" />
                  <div className="space-y-3 mt-4">
                    <Field label="Nombre completo">
                      <input name="name" value={form.name} onChange={handleChange} className={inputCls} />
                    </Field>
                    <Field label="Bio profesional">
                      <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Cuéntale a las empresas quién eres, qué te apasiona y qué buscas..." className={`${inputCls} resize-none leading-relaxed`} />
                      <AIBubble message={aiMsg.bio} loading={aiLoad.bio} />
                    </Field>
                    <Field label="Ciudad">
                      <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Medellín, Colombia" className={inputCls} />
                    </Field>
                  </div>
                </div>

                {/* Formación */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <SectionHeader icon="🎓" title="Formación académica" />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Field label="Universidad">
                      <input name="universidad" value={form.universidad} onChange={handleChange} placeholder="Univ. de Antioquia" className={inputCls} />
                    </Field>
                    <Field label="Carrera">
                      <input name="carrera" value={form.carrera} onChange={handleChange} placeholder="Diseño Gráfico" className={inputCls} />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Año de graduación">
                        <input name="año_graduacion" value={form.año_graduacion} onChange={handleChange} type="number" placeholder="2025" className={inputCls} />
                      </Field>
                    </div>
                  </div>
                  <AIBubble message={aiMsg.universidad} loading={aiLoad.universidad} />
                </div>

                {/* Proyectos */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <SectionHeader icon="💼" title="Proyectos y experiencia" />
                    <button onClick={addProyecto} className="flex items-center gap-1.5 text-xs font-bold text-[#F26419] bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-orange-100 transition-all border-none">
                      + Agregar proyecto
                    </button>
                  </div>

                  <AIBubble message={aiMsg.proyectos} loading={aiLoad.proyectos} />

                  {form.proyectos.length === 0 && (
                    <div className="mt-4 border-2 border-dashed border-gray-100 rounded-xl p-6 text-center">
                      <p className="text-2xl mb-1">💼</p>
                      <p className="text-sm text-gray-400 font-medium">Sin proyectos aún</p>
                      <p className="text-xs text-gray-300 mt-0.5">Agrega trabajos académicos, freelance o personales</p>
                      <button onClick={addProyecto} className="mt-3 text-xs font-semibold text-[#F26419] bg-transparent border-none cursor-pointer hover:underline">
                        + Agregar primer proyecto
                      </button>
                    </div>
                  )}

                  <div className="mt-3 space-y-3">
                    {form.proyectos.map((p, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2.5 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Proyecto {i + 1}</span>
                          <button onClick={() => removeProyecto(i)} className="text-xs text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">
                            Eliminar
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <input value={p.titulo} onChange={(e) => updateProyecto(i, "titulo", e.target.value)} placeholder="Nombre del proyecto *" className={`${inputCls} font-semibold`} />
                          </div>
                          <input value={p.fecha} onChange={(e) => updateProyecto(i, "fecha", e.target.value)} placeholder="Fecha (ej: 2024)" className={inputCls} />
                          <input value={p.link} onChange={(e) => updateProyecto(i, "link", e.target.value)} placeholder="Link (opcional)" className={inputCls} />
                          <div className="col-span-2">
                            <textarea value={p.descripcion} onChange={(e) => updateProyecto(i, "descripcion", e.target.value)} placeholder="Describe brevemente qué hiciste, qué aprendiste y cuál fue el resultado..." rows={2} className={`${inputCls} resize-none`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Habilidades */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <SectionHeader icon="⭐" title="Habilidades" />
                  <div className="mt-4 space-y-3">
                    {form.habilidades.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.habilidades.map((h) => (
                          <span key={h} className="flex items-center gap-1.5 bg-[#FEF0E8] text-[#F26419] border border-[#F26419]/20 text-xs font-medium px-3 py-1.5 rounded-full">
                            {h}
                            <button onClick={() => removeHabilidad(h)} className="hover:text-red-500 cursor-pointer bg-transparent border-none p-0 text-base leading-none">
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input value={habilidadInput} onChange={(e) => setHabilidadInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHabilidad(habilidadInput))} placeholder="Escribe y presiona Enter..." className={`${inputCls} flex-1`} />
                      <button onClick={() => addHabilidad(habilidadInput)} className="px-3 py-2.5 bg-[#F26419] text-white text-xs font-bold rounded-xl border-none cursor-pointer hover:bg-[#C94E0D] whitespace-nowrap">
                        + Agregar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {HABILIDADES_SUGERIDAS.filter((h) => !form.habilidades.includes(h)).map((h) => (
                        <button key={h} onClick={() => addHabilidad(h)} className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full cursor-pointer hover:border-[#F26419] hover:text-[#F26419] transition-all">
                          + {h}
                        </button>
                      ))}
                    </div>
                    <AIBubble message={aiMsg.habilidades} loading={aiLoad.habilidades} />
                  </div>
                </div>

                {/* Links */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <SectionHeader icon="🔗" title="Links profesionales" />
                  <div className="mt-4 space-y-3">
                    <Field
                      label={
                        <>
                          <i className="fi fi-brands-linkedin text-blue-600" /> LinkedIn
                        </>
                      }
                    >
                      <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/tu-perfil" className={inputCls} />
                    </Field>
                    <Field
                      label={
                        <>
                          <i className="fi fi-rr-globe text-[#F26419]" /> Portafolio / GitHub / Behance
                        </>
                      }
                    >
                      <input name="portafolio" value={form.portafolio} onChange={handleChange} placeholder="https://mi-portafolio.com" className={inputCls} />
                    </Field>
                  </div>
                </div>

                {/* Botones mobile */}
                <div className="flex gap-2 lg:hidden pb-4">
                  <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer hover:border-[#F26419] hover:text-[#F26419] transition-all">
                    <i className="fi fi-rr-download" /> PDF
                  </button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#F26419] text-white font-semibold text-sm rounded-xl border-none cursor-pointer hover:bg-[#C94E0D] disabled:opacity-50">
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>

              {/* ── PREVIEW ─────────────────────────────────────────────────── */}
              <div className={`${tab === "editar" ? "hidden lg:block" : ""}`}>
                <div className="sticky top-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vista previa · Hoja de vida</p>
                    <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-[#F26419] font-semibold bg-transparent border-none cursor-pointer hover:underline">
                      <i className="fi fi-rr-download text-[11px]" /> Descargar
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
                    <CVPreview form={form} />
                  </div>
                  <p className="text-center text-[11px] text-gray-300 mt-3">Se actualiza en tiempo real mientras editas</p>
                </div>
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
    </>
  );
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────
function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center text-sm shrink-0">{icon}</span>
      <h2 className="text-xs font-black text-gray-900 uppercase tracking-wide">{title}</h2>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">{label}</label>
      {children}
    </div>
  );
}
