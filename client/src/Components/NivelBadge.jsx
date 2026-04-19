// Componente reutilizable — importar en perfil, portafolio y cards
export const NIVEL_CONFIG = [
  { min:1,  max:2,  label:"Explorador",      emoji:"🌱", color:"text-gray-600",   bg:"bg-gray-100",   ring:"ring-gray-300",   bar:"bg-gray-400"   },
  { min:3,  max:4,  label:"Aprendiz",        emoji:"📚", color:"text-blue-700",   bg:"bg-blue-50",    ring:"ring-blue-300",   bar:"bg-blue-500"   },
  { min:5,  max:6,  label:"Practicante",     emoji:"🚀", color:"text-green-700",  bg:"bg-green-50",   ring:"ring-green-400",  bar:"bg-green-500"  },
  { min:7,  max:8,  label:"Profesional",     emoji:"💼", color:"text-orange-700", bg:"bg-orange-50",  ring:"ring-orange-400", bar:"bg-orange-500" },
  { min:9,  max:9,  label:"Experto",         emoji:"⭐", color:"text-purple-700", bg:"bg-purple-50",  ring:"ring-purple-400", bar:"bg-purple-500" },
  { min:10, max:10, label:"Impulso Elite",   emoji:"⚡", color:"text-amber-700",  bg:"bg-amber-50",   ring:"ring-amber-400",  bar:"bg-amber-500"  },
];

export function getNivelInfo(nivel = 1) {
  return NIVEL_CONFIG.find((n) => nivel >= n.min && nivel <= n.max) || NIVEL_CONFIG[0];
}

/* Badge pequeño inline */
export function NivelBadge({ nivel = 1 }) {
  const info = getNivelInfo(nivel);
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${info.bg} ${info.color}`}>
      {info.emoji} Nv.{nivel} · {info.label}
    </span>
  );
}

/* Card grande con barra de progreso — para perfil/portafolio */
export function NivelCard({ nivel = 1, puntos = 0 }) {
  const info    = getNivelInfo(nivel);
  const next    = Math.min(nivel + 1, 10);
  const pct     = nivel === 10 ? 100 : Math.round((puntos % 10) * 10);

  return (
    <div className={`rounded-2xl p-5 border ${info.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Nivel Impulso</p>
          <p className={`text-2xl font-black ${info.color}`}>{info.emoji} {info.label}</p>
        </div>
        <div className="text-right">
          <p className={`text-5xl font-black ${info.color}`}>{nivel}</p>
          <p className="text-xs text-gray-400">/10</p>
        </div>
      </div>

      {nivel < 10 && (
        <>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-1.5">
            <div className={`h-full ${info.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-500">{pct}% hacia el nivel {next} — {getNivelInfo(next).label}</p>
        </>
      )}
      {nivel === 10 && <p className={`text-xs font-semibold ${info.color}`}>🎉 ¡Has alcanzado el nivel máximo de Impulso!</p>}

      <div className="mt-4 grid grid-cols-5 gap-1">
        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
          <div key={n} className={`h-1.5 rounded-full transition-all ${n <= nivel ? info.bar : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}