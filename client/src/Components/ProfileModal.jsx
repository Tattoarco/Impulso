import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

export default function ProfileModal({ candidate, token, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // candidate_id es la FK a users.id que viene en el objeto applicant
  const candidateId = candidate?.candidate_id;

  useEffect(() => {
    if (!candidateId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/users/${candidateId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar el perfil.");
        const data = await res.json();
        // Acepta tanto { user: {...} } como el objeto directo
        setProfile(data.user || data);
      } catch (err) {
        console.error("ProfileModal fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [candidateId, token]);

  if (!candidate) return null;

  const habilidades = (() => {
    try {
      const h = profile?.habilidades;
      if (!h) return [];
      return Array.isArray(h) ? h : JSON.parse(h);
    } catch {
      return [];
    }
  })();

  const hasProfile =
    profile?.bio ||
    profile?.universidad ||
    profile?.carrera ||
    profile?.ciudad ||
    habilidades.length > 0 ||
    profile?.portafolio ||
    profile?.linkedin;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">

        {/* Header — siempre disponible desde el objeto applicant */}
        <div className="bg-[#1C1712] px-6 py-5 flex justify-between items-start">
          <div>
            <h2 className="text-white text-xl font-bold">
              {candidate.candidate_name}
            </h2>
            <p className="text-white/40 text-sm">
              {candidate.candidate_email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white bg-transparent border-none cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Skeleton de carga */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/4 mb-1" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-1/4 mt-4 mb-1" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="flex gap-2 mt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-16 bg-gray-100 rounded-full" />
                ))}
              </div>
            </div>
          )}

          {/* Sin perfil completado */}
          {!loading && !hasProfile && (
            <div className="text-center py-10">
              <i className="fi fi-rr-user text-3xl text-gray-200 block mb-3" />
              <p className="text-sm text-gray-400">
                Este candidato aún no ha completado su perfil.
              </p>
            </div>
          )}

          {/* Datos del perfil */}
          {!loading && hasProfile && (
            <>
              {/* Bio */}
              {profile.bio && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Sobre mí
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Formación */}
              {(profile.universidad || profile.carrera) && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Formación
                  </p>
                  <p className="text-sm text-gray-700">
                    {[profile.carrera, profile.universidad]
                      .filter(Boolean)
                      .join(" — ")}
                  </p>
                  {profile.año_graduacion && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Graduación: {profile.año_graduacion}
                    </p>
                  )}
                </div>
              )}

              {/* Ciudad */}
              {profile.ciudad && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Ubicación
                  </p>
                  <p className="text-sm text-gray-700">{profile.ciudad}</p>
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
              {(profile.linkedin || profile.portafolio) && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Links
                  </p>
                  <div className="flex flex-col gap-2">
                    {profile.linkedin && (
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 text-sm hover:underline flex items-center gap-1.5"
                      >
                        <i className="fi fi-brands-linkedin text-[13px]" />
                        LinkedIn
                      </a>
                    )}
                    {profile.portafolio && (
                      <a
                        href={profile.portafolio}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#F26419] text-sm hover:underline flex items-center gap-1.5"
                      >
                        <i className="fi fi-rr-globe text-[13px]" />
                        Portafolio
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200 cursor-pointer border-none"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}