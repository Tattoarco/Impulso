import { motion, useMotionValue, useTransform } from "framer-motion";
import { useAuth } from "../Context/Authcontext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";
import Mascota from "../../Public/MascotaImagen.PNG";

const FRASES_CANDIDATO = [
  { sub: "Estás exactamente donde debes estar 🌱", h1a: "Tu primera experiencia", h1b: "ya está esperándote", p: "Cada proyecto en Impulso es un paso real hacia tu carrera. Sin presión, a tu ritmo, con acompañamiento en cada etapa." },
  { sub: "El comienzo siempre parece difícil 💛",  h1a: "Pero aquí no estás",   h1b: "solo/a en esto",      p: "Construye experiencia real mientras cuidas tu bienestar. Impulso está diseñado para crecer contigo, no por encima de ti." },
  { sub: "Tu carrera vale la pena 🚀",             h1a: "Proyectos reales,",     h1b: "crecimiento tuyo",    p: "No necesitas años de experiencia para empezar. Solo necesitas dar el primer paso — y nosotros lo hacemos contigo." },
];
const FRASES_EMPRESA = [
  { sub: "Talento joven, resultados reales 💼",       h1a: "Reduce tiempos,",    h1b: "impulsa proyectos",  p: "Conecta con profesionales en formación que traen energía fresca y creatividad. Tú defines el reto, ellos lo resuelven." },
  { sub: "Tu pipeline de talento comienza aquí ⚡",   h1a: "Proyectos creativos", h1b: "sin burocracia",     p: "Publica un proyecto en minutos con ayuda de IA. Recibe postulaciones de jóvenes comprometidos y da feedback que les cambia la vida." },
];
const FRASES_GUEST = [
  { sub: "¿Buscas experiencia o talento? 👀",        h1a: "La plataforma donde", h1b: "el trabajo tiene sentido", p: "Impulso conecta empresas con jóvenes profesionales a través de microproyectos reales. Gana experiencia, construye portafolio y crece sin límites." },
  { sub: "Tu carrera o tu equipo, aquí empieza 🌟", h1a: "Experiencia real,",    h1b: "sin barreras",             p: "Únete a cientos de jóvenes que ya están construyendo su futuro y empresas que están encontrando talento diferente. Gratis para empezar." },
];

function useHeroText(user) {
  const [idx] = useState(() => Math.floor(Math.random() * 3));
  if (user?.role === "candidato") return FRASES_CANDIDATO[idx % FRASES_CANDIDATO.length];
  if (user?.role === "empresa")   return FRASES_EMPRESA[idx % FRASES_EMPRESA.length];
  return FRASES_GUEST[idx % FRASES_GUEST.length];
}

export default function Home() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const hero      = useHeroText(user);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  useEffect(() => {
    const onMove = (e) => {
      const { innerWidth, innerHeight } = window;
      x.set(e.clientX - innerWidth  / 2);
      y.set(e.clientY - innerHeight / 2);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  const handleCTA = () => user ? navigate("/dashboard") : navigate("/login");
  const ctaLabel  = user?.role === "empresa" ? "Ver mis proyectos" : user?.role === "candidato" ? "Explorar oportunidades" : "Empieza gratis ahora";

  return (
    <div className="min-h-screen bg-white overflow-x-hidden relative">
      <Navbar />

      {/* Fondo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-50 left-1/3 w-[500px] h-[500px] bg-[#6651DD]/20 blur-[150px] rounded-full" />
        <div className="absolute -bottom-50 left-1/3 w-[500px] h-[500px] bg-orange-400/20 blur-[150px] rounded-full" />
      </div>

      {/* ── HERO ── */}
      <section className="min-h-screen flex items-center px-6 md:px-16">
        <div className="grid md:grid-cols-2 gap-12 w-full max-w-7xl mx-auto items-center">

          {/* Texto */}
          <motion.div key={hero.sub} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} className="space-y-6">
            <p className="text-[#6651DD] font-semibold">{hero.sub}</p>
            <h1 className="text-5xl font-bold leading-tight text-[#252B2B]">
              {hero.h1a} <br />
              <span className="text-[#6651DD]">{hero.h1b}</span>
            </h1>
            <p className="text-[#4D4F4E] max-w-md leading-relaxed">{hero.p}</p>

            <div className="flex gap-3 flex-wrap">
              <button onClick={handleCTA} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition">
                {ctaLabel}
              </button>
              {!user && (
                <button onClick={() => navigate("/registro")} className="border border-[#6651DD] text-[#6651DD] px-6 py-3 rounded-2xl font-semibold hover:bg-[#6651DD]/5 transition">
                  Ver cómo funciona
                </button>
              )}
              {user?.role === "candidato" && (
                <button onClick={() => navigate("/portafolio")} className="border border-gray-200 text-gray-600 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition">
                  Mi portafolio
                </button>
              )}
              {user?.role === "empresa" && (
                <button onClick={() => navigate("/talento")} className="border border-gray-200 text-gray-600 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition">
                  Explorar talento
                </button>
              )}
            </div>
          </motion.div>

          {/* ── 3D card + MASCOTA flotando ── */}
          <motion.div style={{ rotateX, rotateY }} className="relative h-[440px] perspective-distant mt-10">

            {/* Card dashboard */}
            <motion.div animate={{ y:[0,-10,0] }} transition={{ repeat:Infinity, duration:6 }}
              className="absolute w-full h-full bg-white/70 backdrop-blur-2xl rounded-[50px] border border-white/50 shadow-[0_40px_120px_rgba(0,0,0,0.15)] p-6">
              <div className="flex justify-between mb-6">
                <p className="font-semibold text-[#252B2B]">Dashboard</p>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 bg-gradient-to-r from-[#6651DD] to-indigo-500 text-white p-5 rounded-3xl">
                  <p className="text-sm">Proyecto destacado</p>
                  <h3 className="font-bold text-lg">App fintech</h3>
                </div>
                <div className="bg-white/80 p-4 rounded-2xl"><p className="text-xs text-[#4D4F4E]">Postulados</p><p className="text-xl font-bold text-[#6651DD]">120</p></div>
                <div className="bg-orange-100 p-4 rounded-2xl"><p className="text-xs text-[#4D4F4E]">Activos</p><p className="text-xl font-bold text-orange-500">8</p></div>
                <div className="bg-[#CCCCCC]/30 p-4 rounded-2xl"><p className="text-xs text-[#4D4F4E]">Completados</p><p className="text-xl font-bold text-[#252B2B]">32</p></div>
                <div className="col-span-3 bg-white/80 p-4 rounded-2xl">
                  <p className="text-sm font-medium text-[#252B2B] mb-2">Actividad reciente</p>
                  <div className="space-y-2 text-xs text-[#4D4F4E]">
                    <p>• Nuevo candidato aplicado</p>
                    <p>• Proyecto aprobado</p>
                    <p>• Feedback enviado</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating badges */}
            {[{ t:"Usuarios", v:"+500" },{ t:"Match", v:"87%" }].map((item, i) => (
              <motion.div key={i} animate={{ y:[0, i%2===0 ? -15 : 15, 0] }} transition={{ repeat:Infinity, duration:5+i }}
                className={`absolute ${i===0 ? "-top-10 -left-8" : "-bottom-10 -right-8"} bg-white/70 backdrop-blur-lg border border-[#CCCCCC] p-4 rounded-2xl shadow-md`}>
                <p className="text-xs text-[#4D4F4E]">{item.t}</p>
                <p className="text-lg font-bold text-[#6651DD]">{item.v}</p>
              </motion.div>
            ))}

            <motion.div animate={{ x:[0,15,0] }} transition={{ repeat:Infinity, duration:6 }}
              className="absolute top-1/2 -right-14 bg-white/70 backdrop-blur-lg border border-[#CCCCCC] p-3 rounded-xl shadow-md">
              ⭐ 4.8
            </motion.div>

            {/* ── MASCOTA flotando sobre la card ── */}
            <motion.img
              src={Mascota}
              alt="Mascota Impulso"
              animate={{ y:[0,-12,0], rotate:[-1,1,-1] }}
              transition={{ repeat:Infinity, duration:4, ease:"easeInOut" }}
              className="absolute -top-16 -right-10 w-28 md:w-36 object-contain drop-shadow-2xl pointer-events-none select-none z-20"
              style={{ filter:"drop-shadow(0 12px 24px rgba(242,100,25,0.25))" }}
            />
          </motion.div>
        </div>
      </section>

      {/* Secciones inferiores */}
      <section className="py-16 px-6 md:px-16 bg-gray-50">
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { text:"Experiencia real",   icon:"fi fi-rr-briefcase"     },
            { text:"Sin fricción",       icon:"fi fi-rr-bolt"          },
            { text:"Crecimiento rápido", icon:"fi fi-rr-chart-line-up" },
            { text:"Proyectos cortos",   icon:"fi fi-rr-time-fast"     },
            { text:"Talento joven",      icon:"fi fi-rr-users"         },
            { text:"Empresas reales",    icon:"fi fi-rr-building"      },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y:-6 }} className="p-px rounded-2xl bg-gradient-to-br from-[#6651DD]/40 to-orange-400/40">
              <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-3 hover:shadow-md transition-all duration-300">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#6651DD]/10">
                  <i className={`${item.icon} text-base`} style={{ background:"linear-gradient(135deg,#6651DD,#f97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }} />
                </div>
                <p className="text-[#252B2B] text-sm font-medium">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <p className="text-xs text-[#6651DD] font-semibold uppercase tracking-wider">Empresas que confían</p>
          <h2 className="text-2xl font-bold text-[#252B2B]">Startups y organizaciones trabajando con talento joven</h2>
          <div className="flex flex-wrap justify-center gap-10 opacity-70">
            {["fi fi-rr-building","fi fi-rr-globe","fi fi-rr-bullseye","fi fi-rr-rocket","fi fi-rr-briefcase"].map((icon, i) => (
              <div key={i} className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition">
                <i className={`${icon} text-xl text-[#4D4F4E]`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final con mascota */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-br from-[#FEF0E8] to-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <motion.img
            src={Mascota}
            alt="Mascota Impulso"
            animate={{ y:[0,-8,0] }}
            transition={{ repeat:Infinity, duration:3.5, ease:"easeInOut" }}
            className="w-40 md:w-56 object-contain drop-shadow-2xl shrink-0 select-none"
            style={{ filter:"drop-shadow(0 12px 24px rgba(242,100,25,0.2))" }}
          />
          <div className="text-center md:text-left">
            <p className="text-xs text-[#6651DD] font-semibold uppercase tracking-wider mb-2">Únete ahora</p>
            <h2 className="text-3xl font-bold text-[#252B2B] mb-3">¿Listo para dar el salto?</h2>
            <p className="text-[#4D4F4E] mb-6 leading-relaxed">Miles de jóvenes ya están construyendo su futuro en Impulso. Tú puedes ser el siguiente.</p>
            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              <button onClick={() => navigate(user ? "/dashboard" : "/registro")} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition">
                {user ? "Ver experiencias" : "Crear mi cuenta gratis"}
              </button>
              {!user && (
                <button onClick={() => navigate("/login")} className="border border-gray-300 text-gray-600 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition">
                  Ya tengo cuenta
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-16 bg-white">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <p className="text-xs text-[#6651DD] font-semibold uppercase tracking-wider">En tiempo real</p>
            <h2 className="text-2xl font-bold text-[#252B2B]">Lo que está pasando ahora</h2>
          </div>
          <div className="space-y-4">
            {[
              { icon:"fi fi-rr-user-add",  text:"Nuevo candidato se unió"           },
              { icon:"fi fi-rr-briefcase", text:"Proyecto publicado por startup"    },
              { icon:"fi fi-rr-check",     text:"Proyecto completado con éxito"     },
              { icon:"fi fi-rr-comment",   text:"Feedback enviado a un candidato"   },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }}
                className="flex items-center gap-3 bg-gray-50 border border-[#CCCCCC] rounded-xl px-4 py-3">
                <i className={`${item.icon} text-[#6651DD]`} />
                <p className="text-sm text-[#4D4F4E]">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}