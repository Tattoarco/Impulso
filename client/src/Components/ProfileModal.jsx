export default function ProfileModal({ candidate, onClose }) {
  if (!candidate) return null;

  const habilidades = (() => {
    try {
      return Array.isArray(candidate.habilidades)
        ? candidate.habilidades
        : JSON.parse(candidate.habilidades || "[]");
    } catch {
      return [];
    }
  })();

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#1C1712] px-6 py-5 flex justify-between items-start">
          <div>
            <h2 className="text-white text-xl font-bold">
              {candidate.candidate_name || candidate.name}
            </h2>
            <p className="text-white/40 text-sm">
              {candidate.candidate_email || candidate.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Bio */}
          {candidate.bio && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Sobre mí
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {candidate.bio}
              </p>
            </div>
          )}

          {/* Formación */}
          {(candidate.universidad || candidate.carrera) && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Formación
              </p>
              <p className="text-sm text-gray-700">
                {candidate.carrera} — {candidate.universidad}
              </p>
              {candidate.año_graduacion && (
                <p className="text-xs text-gray-400">
                  Graduación: {candidate.año_graduacion}
                </p>
              )}
            </div>
          )}

          {/* Ciudad */}
          {candidate.ciudad && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Ubicación
              </p>
              <p className="text-sm text-gray-700">
                {candidate.ciudad}
              </p>
            </div>
          )}

          {/* Habilidades */}
          {habilidades.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                Habilidades
              </p>
              <div className="flex flex-wrap gap-2">
                {habilidades.map((h, i) => (
                  <span
                    key={i}
                    className="bg-[#FEF0E8] text-[#F26419] text-xs px-3 py-1 rounded-full border border-[#F26419]/20"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {candidate.portafolio && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                Links
              </p>
              <div className="flex flex-col gap-2">
                {candidate.linkedin && (
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
                {candidate.portafolio && (
                  <a
                    href={candidate.portafolio}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#F26419] text-sm hover:underline"
                  >
                    Portafolio
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Mensaje si no hay datos de perfil */}
          {!candidate.bio && !candidate.universidad && !candidate.carrera &&
           !candidate.ciudad && habilidades.length === 0 && !candidate.portafolio && (
            <div className="text-center py-8">
              <i className="fi fi-rr-user text-3xl text-gray-200 block mb-3" />
              <p className="text-sm text-gray-400">
                Este candidato aún no ha completado su perfil.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}