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

export default function EditarPerfil() {
  const navigate          = useNavigate();
  const { user, token, updateUser } = useAuth();

  const [form, setForm] = useState({
    name:            "",
    bio:             "",
    universidad:     "",
    carrera:         "",
    año_graduacion:  "",
    habilidades:     [],
    linkedin:        "",
    portafolio:      "",
    ciudad:          "",
  });

  const [habilidadInput, setHabilidadInput] = useState("");
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  // Cargar datos actuales del usuario
  useEffect(() => {
    if (user) {
      setForm({
        name:           user.name           || "",
        bio:            user.bio            || "",
        universidad:    user.universidad    || "",
        carrera:        user.carrera        || "",
        año_graduacion: user.año_graduacion || "",
        habilidades:    Array.isArray(user.habilidades)
          ? user.habilidades
          : (typeof user.habilidades === "string" ? JSON.parse(user.habilidades || "[]") : []),
        linkedin:       user.linkedin    || "",
        portafolio:     user.portafolio  || "",
        ciudad:         user.ciudad      || "",
      });
    }
  }, [user]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Agregar habilidad desde input
  const addHabilidad = (hab) => {
    const clean = hab.trim();
    if (!clean || form.habilidades.includes(clean)) return;
    setForm((prev) => ({ ...prev, habilidades: [...prev.habilidades, clean] }));
    setHabilidadInput("");
  };

  const removeHabilidad = (hab) => {
    setForm((prev) => ({ ...prev, habilidades: prev.habilidades.filter((h) => h !== hab) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          habilidades: form.habilidades, // Enviar como array, el backend se encarga de stringify
          año_graduacion: form.año_graduacion ? parseInt(form.año_graduacion) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar.");

      // Actualizar el contexto con los datos frescos
      updateUser(data.user);

      showToast("success", "Perfil actualizado correctamente.");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const completado = [
    form.bio, form.universidad, form.carrera,
    form.habilidades.length > 0, form.ciudad,
  ].filter(Boolean).length;

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <SideBar />
        <main className="ml-24 flex-1 p-8">
          <div className="max-w-3xl mx-auto">

            {/* Back */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 bg-none border-none cursor-pointer transition-colors"
            >
              <i className="fi fi-rr-arrow-left text-xs" /> Volver
            </button>

            {/* Header */}
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white text-2xl font-black">
                {form.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mi perfil</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Completa tu perfil para que las empresas conozcan tu potencial
                </p>
                {/* Barra de completitud */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F26419] rounded-full transition-all duration-500"
                      style={{ width: `${(completado / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{completado}/5 secciones completadas</span>
                </div>
              </div>
            </div>

            <div className="space-y-5">

              {/* Información básica */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fi fi-rr-user text-[#F26419]" /> Información básica
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre completo</label>
                    <input name="name" value={form.name} onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all" />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio profesional</label>
                    <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                      placeholder="Cuéntale a las empresas quién eres, qué te apasiona y qué buscas..."
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all resize-none leading-relaxed" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ciudad</label>
                    <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Medellín, Colombia"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {/* Formación */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fi fi-rr-graduation-cap text-[#F26419]" /> Formación académica
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Universidad / Institución</label>
                    <input name="universidad" value={form.universidad} onChange={handleChange} placeholder="Universidad de Antioquia"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Carrera</label>
                    <input name="carrera" value={form.carrera} onChange={handleChange} placeholder="Diseño Gráfico"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Año de graduación</label>
                    <input name="año_graduacion" value={form.año_graduacion} onChange={handleChange}
                      type="number" placeholder="2024" min="2000" max="2030"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {/* Habilidades */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fi fi-rr-star text-[#F26419]" /> Habilidades
                </h2>

                {/* Tags seleccionados */}
                {form.habilidades.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.habilidades.map((h) => (
                      <span key={h} className="flex items-center gap-1.5 bg-[#FEF0E8] text-[#F26419] border border-[#F26419]/20 text-xs font-medium px-3 py-1.5 rounded-full">
                        {h}
                        <button onClick={() => removeHabilidad(h)} className="hover:text-red-500 transition-colors cursor-pointer bg-none border-none p-0 leading-none">×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input para agregar */}
                <div className="flex gap-2 mb-4">
                  <input
                    value={habilidadInput}
                    onChange={(e) => setHabilidadInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHabilidad(habilidadInput))}
                    placeholder="Escribe una habilidad y presiona Enter..."
                    className="flex-1 px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all"
                  />
                  <button
                    onClick={() => addHabilidad(habilidadInput)}
                    className="px-4 py-2.5 bg-[#F26419] text-white text-sm font-semibold rounded-xl border-none cursor-pointer hover:bg-[#C94E0D] transition-all"
                  >
                    Agregar
                  </button>
                </div>

                {/* Sugerencias */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Sugerencias:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {HABILIDADES_SUGERIDAS.filter((h) => !form.habilidades.includes(h)).map((h) => (
                      <button key={h} onClick={() => addHabilidad(h)}
                        className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full cursor-pointer hover:border-[#F26419] hover:text-[#F26419] transition-all border-none">
                        + {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fi fi-rr-link text-[#F26419]" /> Links profesionales
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                      <i className="fi fi-brands-linkedin text-blue-600" /> LinkedIn
                    </label>
                    <input name="linkedin" value={form.linkedin} onChange={handleChange}
                      placeholder="https://linkedin.com/in/tu-perfil"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                      <i className="fi fi-rr-globe text-[#F26419]" /> Portafolio / Behance / GitHub
                    </label>
                    <input name="portafolio" value={form.portafolio} onChange={handleChange}
                      placeholder="https://mi-portafolio.com"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:border-[#F26419] focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {/* Botón guardar */}
              <div className="flex justify-end gap-3">
                <button onClick={() => navigate(-1)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#F26419] text-white font-semibold text-sm rounded-xl border-none cursor-pointer transition-all hover:bg-[#C94E0D] hover:-translate-y-0.5 hover:shadow-[0_5px_16px_rgba(242,100,25,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  {saving ? <><i className="fi fi-rr-spinner animate-spin" /> Guardando...</> : <><i className="fi fi-rr-check" /> Guardar perfil</>}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-2xl z-50 animate-[slideUp_0.3s_ease]
          ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:translateY(0);}}
      `}</style>
    </>
  );
}