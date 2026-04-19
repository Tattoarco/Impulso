// Modal de feedback final — reemplaza el sistema de feedback por etapas
// Se usa en Postulantes.jsx cuando el candidato completó todas las etapas
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

const CRITERIOS = [
  { key: "score_calidad",      label: "Calidad del trabajo",   icon: "fi-rr-star",       desc: "Nivel de excelencia del entregable final" },
  { key: "score_puntualidad",  label: "Puntualidad",           icon: "fi-rr-clock",      desc: "Cumplimiento de plazos en cada etapa"     },
  { key: "score_comunicacion", label: "Comunicación",          icon: "fi-rr-comment",    desc: "Claridad y proactividad en las entregas"   },
  { key: "score_creatividad",  label: "Creatividad",           icon: "fi-rr-bulb",       desc: "Originalidad y valor agregado del trabajo"  },
];

const NIVEL_CONFIG = [
  { min:1,  max:2,  label:"Explorador",      color:"text-gray-500",   bg:"bg-gray-100"   },
  { min:3,  max:4,  label:"Aprendiz",        color:"text-blue-600",   bg:"bg-blue-50"    },
  { min:5,  max:6,  label:"Practicante",     color:"text-green-600",  bg:"bg-green-50"   },
  { min:7,  max:8,  label:"Profesional",     color:"text-orange-600", bg:"bg-orange-50"  },
  { min:9,  max:9,  label:"Experto",         color:"text-purple-600", bg:"bg-purple-50"  },
  { min:10, max:10, label:"Impulso Elite ⚡", color:"text-amber-600",  bg:"bg-amber-50"   },
];

function getNivel(n) { return NIVEL_CONFIG.find((c) => n >= c.min && n <= c.max) || NIVEL_CONFIG[0]; }

function ScoreSlider({ criterio, value, onChange, disabled }) {
  const pct = ((value - 1) / 9) * 100;
  const color = value <= 3 ? "#EF4444" : value <= 6 ? "#F59E0B" : "#22C55E";
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <i className={`fi ${criterio.icon} text-sm text-gray-400`} />
          <span className="text-sm font-semibold text-gray-900">{criterio.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black" style={{ color }}>{value}</span>
          <span className="text-xs text-gray-400">/10</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-2">{criterio.desc}</p>
      <div className="relative">
        <input type="range" min="1" max="10" value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(to right, ${color} ${pct}%, #E5E7EB ${pct}%)` }} />
        <div className="flex justify-between text-[9px] text-gray-300 mt-1 px-0.5">
          {[1,2,3,4,5,6,7,8,9,10].map((n) => <span key={n}>{n}</span>)}
        </div>
      </div>
    </div>
  );
}

export default function FeedbackFinal({ applicationId, candidateName, jobTitle, token, onClose, onSaved }) {
  const [scores, setScores] = useState({ score_calidad: 5, score_puntualidad: 5, score_comunicacion: 5, score_creatividad: 5 });
  const [feedbackText, setFeedbackText] = useState("");
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API}/api/project-feedback/${applicationId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.feedback) {
          setScores({ score_calidad: data.feedback.score_calidad, score_puntualidad: data.feedback.score_puntualidad, score_comunicacion: data.feedback.score_comunicacion, score_creatividad: data.feedback.score_creatividad });
          setFeedbackText(data.feedback.feedback_text || "");
        }
      } catch (error) {
        console.error("Error loading feedback", error);
      }
    };
    load();
  }, [applicationId, token]);

  const promedio = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 4);
  const nivelInfo = getNivel(promedio);

  const handleSave = async () => {
    if (!feedbackText.trim()) return;
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/project-feedback/${applicationId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ ...scores, feedback_text: feedbackText }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      onSaved?.();
      setTimeout(onClose, 1500);
    } catch { alert("Error al guardar el feedback."); } finally { setSaving(false); }
  };

  const disabled = saving || saved;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-6 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-xl my-6 overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-[#1C1712] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#F26419] mb-1">Feedback final del proyecto</p>
              <h3 className="text-white font-bold text-lg">{candidateName}</h3>
              <p className="text-white/40 text-xs mt-0.5">{jobTitle}</p>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white bg-none border-none cursor-pointer text-lg">✕</button>
          </div>
        </div>

        <div className="p-6">

          {/* Score promedio en tiempo real */}
          <div className={`flex items-center gap-4 p-4 rounded-2xl mb-6 ${nivelInfo.bg}`}>
            <div className="text-center">
              <p className="text-4xl font-black" style={{ color: promedio <= 3 ? "#EF4444" : promedio <= 6 ? "#F59E0B" : "#22C55E" }}>{promedio}</p>
              <p className="text-xs text-gray-500 mt-0.5">/10</p>
            </div>
            <div>
              <p className={`font-bold text-sm ${nivelInfo.color}`}>{nivelInfo.label}</p>
              <p className="text-xs text-gray-500">Esta calificación contribuirá al nivel del candidato en la plataforma</p>
            </div>
          </div>

          {/* Sliders */}
          {CRITERIOS.map((c) => (
            <ScoreSlider key={c.key} criterio={c} value={scores[c.key]}
              onChange={(v) => setScores((prev) => ({ ...prev, [c.key]: v }))} disabled={disabled} />
          ))}

          {/* Feedback textual */}
          <div className="mt-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
              Feedback general del proyecto *
            </label>
            <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
              disabled={disabled}
              placeholder="Escribe un feedback honesto y constructivo sobre el trabajo del candidato durante todo el proyecto. Este mensaje lo verá en su portafolio..."
              className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-2xl bg-gray-50 text-sm outline-none resize-y min-h-28 leading-relaxed transition-all focus:border-[#F26419] focus:bg-white disabled:opacity-60"
              rows={4} />
            <p className="text-xs text-gray-400 mt-1">{feedbackText.length} caracteres</p>
          </div>

          {/* Aviso niveles */}
          <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mt-4">
            <i className="fi fi-rr-info text-[#F26419] text-sm mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Esta puntuación actualiza el <strong>nivel Impulso</strong> del candidato. El candidato verá este feedback en su portafolio como parte de su historial de proyectos.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={disabled || !feedbackText.trim()}
            className={`flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl border-none cursor-pointer transition-all
              ${saved ? "bg-green-500" : "bg-[#F26419] hover:bg-[#C94E0D] hover:-translate-y-0.5"} disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none`}>
            {saving ? <><i className="fi fi-rr-spinner animate-spin" /> Guardando...</> : saved ? <><i className="fi fi-rr-check" /> ¡Guardado!</> : <><i className="fi fi-rr-paper-plane" /> Enviar feedback</>}
          </button>
        </div>
      </div>
    </div>
  );
}