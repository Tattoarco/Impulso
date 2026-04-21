import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import SideBar from "../Components/Sidebar";
import Footer from "../Components/footer";

const HABILIDADES_SUGERIDAS = [
  "Figma", "Canva", "Adobe Illustrator", "Photoshop",
  "React", "JavaScript", "Python", "Node.js", "SQL",
  "Excel", "Power BI", "Google Analytics",
  "Comunicación", "Trabajo en equipo", "Gestión de proyectos",
  "Marketing digital", "SEO", "Redes sociales",
];

// ─── Preview de hoja de vida (se imprime como PDF) ───────────────────────────
function CVPreview({ form }) {
  const habilidades = Array.isArray(form.habilidades) ? form.habilidades : [];
  const initials = form.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div id="cv-preview" className="bg-white font-sans text-gray-900 w-full min-h-[297mm] shadow-xl rounded-2xl overflow-hidden">

      {/* Header naranja */}
      <div className="bg-[#F26419] px-10 py-8 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-black shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-white text-2xl font-black leading-tight tracking-tight">
            {form.name || "Tu nombre aquí"}
          </h1>
          {form.carrera && (
            <p className="text-white/80 text-sm font-medium mt-0.5">{form.carrera}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {form.ciudad && (
              <span className="text-white/70 text-xs flex items-center gap-1">
                📍 {form.ciudad}
              </span>
            )}
            {form.linkedin && (
              <span className="text-white/70 text-xs flex items-center gap-1 break-all">
                🔗 {form.linkedin.replace("https://", "")}
              </span>
            )}
            {form.portafolio && (
              <span className="text-white/70 text-xs flex items-center gap-1 break-all">
                🌐 {form.portafolio.replace("https://", "")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-10 py-7 space-y-6">

        {/* Bio */}
        {form.bio && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-[#F26419] rounded-full" />
              <h2 className="text-xs font-black uppercase tracking-widest text-[#F26419]">Perfil profesional</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{form.bio}</p>
          </section>
        )}

        {/* Formación */}
        {(form.universidad || form.carrera) && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#F26419] rounded-full" />
              <h2 className="text-xs font-black uppercase tracking-widest text-[#F26419]">Formación académica</h2>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm">🎓</span>
              </div>
              <div>
                {form.carrera && <p className="text-sm font-bold text-gray-900">{form.carrera}</p>}
                {form.universidad && <p className="text-sm text-gray-600">{form.universidad}</p>}
                {form.año_graduacion && (
                  <p className="text-xs text-gray-400 mt-0.5">Graduación: {form.año_graduacion}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Habilidades */}
        {habilidades.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#F26419] rounded-full" />
              <h2 className="text-xs font-black uppercase tracking-widest text-[#F26419]">Habilidades</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {habilidades.map((h, i) => (
                <span key={i} className="bg-orange-50 text-[#F26419] text-xs font-semibold px-3 py-1 rounded-full border border-orange-100">
                  {h}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Sin datos */}
        {!form.bio && !form.universidad && !form.carrera && habilidades.length === 0 && (
          <div className="text-center py-12 text-gray-300">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-sm font-medium">Completa los campos para ver tu hoja de vida</p>
          </div>
        )}
      </div>

      {/* Footer sutil */}
      <div className="px-10 pb-6">
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[10px] text-gray-300 text-center">Hoja de vida generada en Impulso</p>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function EditarPerfil() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const API = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    name: "", bio: "", universidad: "", carrera: "",
    año_graduacion: "", habilidades: [],
    linkedin: "", portafolio: "", ciudad: "",
  });

  const [habilidadInput, setHabilidadInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("editar"); // "editar" | "preview" (mobile)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        universidad: user.universidad || "",
        carrera: user.carrera || "",
        año_graduacion: user.año_graduacion || "",
        habilidades: Array.isArray(user.habilidades)
          ? user.habilidades
          : (typeof user.habilidades === "string" ? JSON.parse(user.habilidades || "[]") : []),
        linkedin: user.linkedin || "",
        portafolio: user.portafolio || "",
        ciudad: user.ciudad || "",
      });
    }
  }, [user]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addHabilidad = (hab) => {
    const clean = hab.trim();
    if (!clean || form.habilidades.includes(clean)) return;
    setForm((prev) => ({ ...prev, habilidades: [...prev.habilidades, clean] }));
    setHabilidadInput("");
  };

  const removeHabilidad = (hab) =>
    setForm((prev) => ({ ...prev, habilidades: prev.habilidades.filter((h) => h !== hab) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/auth/me/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          habilidades: form.habilidades,
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

  // Descarga como PDF usando el área de impresión
  const handleDownload = () => {
    window.print();
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const completado = [
    form.bio, form.universidad, form.carrera,
    form.habilidades.length > 0, form.ciudad,
  ].filter(Boolean).length;

  // ─── Estilos de impresión inyectados en el head ──────────────────────────
  const printStyles = `
    @media print {
      body * { visibility: hidden !important; }
      #cv-preview, #cv-preview * { visibility: visible !important; }
      #cv-preview {
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        font-size: 12px !important;
      }
      @page { size: A4; margin: 0; }
    }
  `;

  const inputCls = "w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all";
  const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide";

  return (
    <>
      <style>{printStyles}</style>

      <div className="flex min-h-screen bg-gray-50">
        <SideBar />

        <main className="ml-24 flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Back */}
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 bg-transparent border-none cursor-pointer transition-colors">
              <i className="fi fi-rr-arrow-left text-xs" /> Volver
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white text-xl font-black shrink-0">
                  {form.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mi hoja de vida</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Edita y descarga tu CV profesional</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-1.5 w-28 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#F26419] rounded-full transition-all duration-500"
                        style={{ width: `${(completado / 5) * 100}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-400">{completado}/5 completado</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2">
                <button onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer hover:border-[#F26419] hover:text-[#F26419] transition-all">
                  <i className="fi fi-rr-download text-[13px]" /> Descargar PDF
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F26419] text-white font-semibold text-sm rounded-xl border-none cursor-pointer transition-all hover:bg-[#C94E0D] hover:-translate-y-0.5 hover:shadow-[0_5px_16px_rgba(242,100,25,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  {saving ? <><i className="fi fi-rr-spinner animate-spin" /> Guardando...</> : <><i className="fi fi-rr-check" /> Guardar</>}
                </button>
              </div>
            </div>

            {/* Tabs mobile */}
            <div className="flex lg:hidden bg-white border border-gray-100 rounded-xl p-1 mb-4">
              {["editar", "preview"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all border-none cursor-pointer capitalize ${tab === t ? "bg-[#F26419] text-white shadow-sm" : "bg-transparent text-gray-400"}`}>
                  {t === "editar" ? "✏️ Editar" : "👁 Vista previa"}
                </button>
              ))}
            </div>

            {/* Layout principal: formulario + preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ── Formulario ─────────────────────────────────────────────── */}
              <div className={`space-y-4 ${tab === "preview" ? "hidden lg:block" : ""}`}>

                {/* Info básica */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h2 className="text-xs font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-5 h-5 bg-orange-50 rounded-lg flex items-center justify-center text-[#F26419] text-[10px]">👤</span>
                    Información básica
                  </h2>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Nombre completo</label>
                      <input name="name" value={form.name} onChange={handleChange} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Bio profesional</label>
                      <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                        placeholder="Cuéntale a las empresas quién eres, qué te apasiona y qué buscas..."
                        className={`${inputCls} resize-none leading-relaxed`} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Ciudad</label>
                      <input name="ciudad" value={form.ciudad} onChange={handleChange}
                        placeholder="Medellín, Colombia" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Formación */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h2 className="text-xs font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-5 h-5 bg-orange-50 rounded-lg flex items-center justify-center text-[11px]">🎓</span>
                    Formación académica
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Universidad</label>
                      <input name="universidad" value={form.universidad} onChange={handleChange}
                        placeholder="Univ. de Antioquia" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Carrera</label>
                      <input name="carrera" value={form.carrera} onChange={handleChange}
                        placeholder="Diseño Gráfico" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className={labelCls}>Año de graduación</label>
                      <input name="año_graduacion" value={form.año_graduacion} onChange={handleChange}
                        type="number" placeholder="2025" min="2000" max="2035" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Habilidades */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h2 className="text-xs font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-5 h-5 bg-orange-50 rounded-lg flex items-center justify-center text-[11px]">⭐</span>
                    Habilidades
                  </h2>

                  {form.habilidades.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {form.habilidades.map((h) => (
                        <span key={h} className="flex items-center gap-1.5 bg-[#FEF0E8] text-[#F26419] border border-[#F26419]/20 text-xs font-medium px-3 py-1.5 rounded-full">
                          {h}
                          <button onClick={() => removeHabilidad(h)}
                            className="hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none p-0 leading-none text-base">×</button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mb-3">
                    <input value={habilidadInput} onChange={(e) => setHabilidadInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHabilidad(habilidadInput))}
                      placeholder="Escribe y presiona Enter..."
                      className={`${inputCls} flex-1`} />
                    <button onClick={() => addHabilidad(habilidadInput)}
                      className="px-3 py-2.5 bg-[#F26419] text-white text-xs font-bold rounded-xl border-none cursor-pointer hover:bg-[#C94E0D] transition-all whitespace-nowrap">
                      + Agregar
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {HABILIDADES_SUGERIDAS.filter((h) => !form.habilidades.includes(h)).map((h) => (
                      <button key={h} onClick={() => addHabilidad(h)}
                        className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full cursor-pointer hover:border-[#F26419] hover:text-[#F26419] transition-all">
                        + {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h2 className="text-xs font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-5 h-5 bg-orange-50 rounded-lg flex items-center justify-center text-[11px]">🔗</span>
                    Links profesionales
                  </h2>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className={`${labelCls} flex items-center gap-1.5`}>
                        <i className="fi fi-brands-linkedin text-blue-600" /> LinkedIn
                      </label>
                      <input name="linkedin" value={form.linkedin} onChange={handleChange}
                        placeholder="https://linkedin.com/in/tu-perfil" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={`${labelCls} flex items-center gap-1.5`}>
                        <i className="fi fi-rr-globe text-[#F26419]" /> Portafolio / GitHub / Behance
                      </label>
                      <input name="portafolio" value={form.portafolio} onChange={handleChange}
                        placeholder="https://mi-portafolio.com" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Botones mobile */}
                <div className="flex gap-2 lg:hidden pb-4">
                  <button onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer hover:border-[#F26419] hover:text-[#F26419] transition-all">
                    <i className="fi fi-rr-download text-[13px]" /> Descargar PDF
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#F26419] text-white font-semibold text-sm rounded-xl border-none cursor-pointer hover:bg-[#C94E0D] transition-all disabled:opacity-50">
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>

              {/* ── Preview de la hoja de vida ──────────────────────────────── */}
              <div className={`${tab === "editar" ? "hidden lg:block" : ""}`}>
                <div className="sticky top-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Vista previa · Hoja de vida
                    </p>
                    <button onClick={handleDownload}
                      className="flex items-center gap-1.5 text-xs text-[#F26419] font-semibold bg-transparent border-none cursor-pointer hover:underline">
                      <i className="fi fi-rr-download text-[11px]" /> Descargar
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
                    <CVPreview form={form} />
                  </div>
                  <p className="text-center text-[11px] text-gray-300 mt-3">
                    La vista previa se actualiza en tiempo real
                  </p>
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

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:translateY(0);}}
      `}</style>
    </>
  );
}