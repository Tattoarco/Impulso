import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";
import Mascota from "../../Public/MascotaImage.PNG";

const API = import.meta.env.VITE_API_URL;

function MascotaTip({ candidate }) {
  const tips = [
    `✨ ${candidate.name?.split(" ")[0]} tiene potencial para crecer rápidamente.`,
    "🚀 Revisa sus proyectos destacados.",
    "💡 Las habilidades blandas también marcan diferencia.",
    "🎯 Este perfil podría encajar con equipos junior o trainee.",
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      <div className="relative flex items-start gap-4">
        {/* Mascota */}
        <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-4xl shrink-0 animate-bounce">
          <img src={Mascota} alt="Mascota" />
        </div>

        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-white/70 font-bold mb-1">
            Impulso AI Coach
          </p>

          <h3 className="text-lg font-black mb-2">
            Perfil recomendado
          </h3>

          <p className="text-sm text-white/90 leading-relaxed">
            {randomTip}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PerfilTalento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        const res = await fetch(`${API}/api/auth/candidates/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setCandidate(data.candidate);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) loadCandidate();
  }, [id, token]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-28 px-6">
          <div className="max-w-5xl mx-auto animate-pulse">
            <div className="h-52 bg-white rounded-3xl mb-6" />
            <div className="h-96 bg-white rounded-3xl" />
          </div>
        </div>
      </>
    );
  }

  if (!candidate) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Perfil no encontrado</p>
        </div>
      </>
    );
  }

  const habilidades = (() => {
    try {
      return Array.isArray(candidate.habilidades)
        ? candidate.habilidades
        : JSON.parse(candidate.habilidades || "[]");
    } catch {
      return [];
    }
  })();

  const proyectos = (() => {
    try {
      return Array.isArray(candidate.proyectos)
        ? candidate.proyectos
        : JSON.parse(candidate.proyectos || "[]");
    } catch {
      return [];
    }
  })();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="mb-5 text-sm text-gray-400 hover:text-gray-700 transition-all"
          >
            ← Volver
          </button>

          {/* Hero */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center text-3xl font-black shadow-lg">
                  {candidate.name?.[0]?.toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-black text-gray-900">
                      {candidate.name}
                    </h1>

                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                      Nivel {candidate.nivel_impulso || 1}
                    </span>
                  </div>

                  <p className="text-gray-500 mt-2">
                    {candidate.carrera || "Profesional"}
                  </p>

                  {candidate.ciudad && (
                    <p className="text-sm text-gray-400 mt-1">
                      📍 {candidate.ciudad}
                    </p>
                  )}

                  {candidate.bio && (
                    <p className="mt-5 text-gray-600 leading-relaxed max-w-3xl">
                      {candidate.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-5">
                    {habilidades.map((h, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mascota IA */}
            <MascotaTip candidate={candidate} />
          </div>

          {/* Proyectos */}
          <div className="bg-white rounded-3xl border border-gray-100 p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">
                Proyectos y experiencia
              </h2>

              {candidate.portafolio && (
                <a
                  href={candidate.portafolio}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#F26419] text-white text-sm font-semibold hover:opacity-90 transition-all"
                >
                  Ver portafolio
                </a>
              )}
            </div>

            {proyectos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-300 text-5xl mb-3">📂</p>
                <p className="text-gray-400">
                  Este candidato aún no agrega proyectos
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {proyectos.map((p, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-2xl p-5 hover:border-orange-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-gray-900">
                        {p.titulo}
                      </h3>

                      {p.fecha && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {p.fecha}
                        </span>
                      )}
                    </div>

                    {p.descripcion && (
                      <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                        {p.descripcion}
                      </p>
                    )}

                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#F26419]"
                      >
                        🔗 Ver proyecto
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}