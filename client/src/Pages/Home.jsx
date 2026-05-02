import { motion, useMotionValue, useTransform } from "framer-motion";
import { useAuth } from "../Context/Authcontext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/footer";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🎯 PARALLAX (mouse)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      x.set(e.clientX - innerWidth / 2);
      y.set(e.clientY - innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  const handleCTA = () => {
    user ? navigate("/dashboard") : navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden relative">
      <Navbar />

      {/* 🌈 BACKGROUND ORGÁNICO */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-50 left-35.7 w-125 h-125 bg-[#6651DD]/20 blur-[150px] rounded-full" />
        <div className="absolute -bottom-50 left-35.7 w-125 h-125 bg-orange-400/20 blur-[150px] rounded-full" />
      </div>

      {/* HERO */}
      <section className="min-h-screen flex items-center px-6 md:px-16">
        <div className="grid md:grid-cols-2 gap-12 w-full max-w-7xl mx-auto items-center">
          {/* LEFT */}
          <div className="space-y-6">
            <p className="text-[#6651DD] font-semibold">{user ? "Bienvenido 🚀" : "Experiencia profesional real"}</p>

            <h1 className="text-5xl font-bold leading-tight text-[#252B2B]">
              {user ? (
                <>
                  Controla tus proyectos <br />
                  <span className="text-[#6651DD]">como un producto real</span>
                </>
              ) : (
                <>
                  Construye experiencia <br />
                  <span className="text-[#6651DD]">sin fricción</span>
                </>
              )}
            </h1>

            <p className="text-[#4D4F4E] max-w-md">Plataforma diseñada para jóvenes y empresas que necesitan resultados reales.</p>

            <div className="flex gap-3">
              <button onClick={handleCTA} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition">
                {user ? "Ir al dashboard" : "Empieza ahora"}
              </button>
            </div>
          </div>

          {/* RIGHT - 3D FLOATING DASHBOARD */}
          <motion.div style={{ rotateX, rotateY }} className="relative h-110 perspective-distant mt-10">
            {/* MAIN DASHBOARD */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute w-full h-full bg-white/70 backdrop-blur-2xl rounded-[50px] border border-white/50 shadow-[0_40px_120px_rgba(0,0,0,0.15)] p-6">
              {/* HEADER */}
              <div className="flex justify-between mb-6">
                <p className="font-semibold text-[#252B2B]">Dashboard</p>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
              </div>

              {/* GRID CONTENT */}
              <div className="grid grid-cols-3 gap-4">
                {/* BIG CARD */}
                <div className="col-span-3 bg-lineat-to-r from-[#6651DD] to-indigo-500 text-white p-5 rounded-3xl">
                  <p className="text-sm">Proyecto destacado</p>
                  <h3 className="font-bold text-lg">App fintech</h3>
                </div>

                {/* METRICS */}
                <div className="bg-white/80 p-4 rounded-2xl">
                  <p className="text-xs text-[#4D4F4E]">Postulados</p>
                  <p className="text-xl font-bold text-[#6651DD]">120</p>
                </div>

                <div className="bg-orange-100 p-4 rounded-2xl">
                  <p className="text-xs text-[#4D4F4E]">Activos</p>
                  <p className="text-xl font-bold text-orange-500">8</p>
                </div>

                <div className="bg-[#CCCCCC]/30 p-4 rounded-2xl">
                  <p className="text-xs text-[#4D4F4E]">Completados</p>
                  <p className="text-xl font-bold text-[#252B2B]">32</p>
                </div>

                {/* LIST */}
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

            {/* FLOATING ELEMENTS */}
            {[
              { t: "Usuarios", v: "+500" },
              { t: "Match", v: "87%" },
            ].map((item, i) => (
              <motion.div key={i} animate={{ y: [0, i % 2 === 0 ? -15 : 15, 0] }} transition={{ repeat: Infinity, duration: 5 + i }} className={`absolute ${i === 0 ? "-top-10 -left-8" : "-bottom-10 -right-8"} bg-white/70 backdrop-blur-lg border border-[#CCCCCC] p-4 rounded-2xl shadow-md`}>
                <p className="text-xs text-[#4D4F4E]">{item.t}</p>
                <p className="text-lg font-bold text-[#6651DD]">{item.v}</p>
              </motion.div>
            ))}

            {/* SIDE FLOAT */}
            <motion.div animate={{ x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute top-1/2 -right-14 bg-white/70 backdrop-blur-lg border border-[#CCCCCC] p-3 rounded-xl shadow-md">
              ⭐ 4.8
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* EXTRA VISUAL SECTION */}
      <section className="py-16 px-6 md:px-16 bg-gray-50">
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { text: "Experiencia real", icon: "fi fi-rr-briefcase" },
            { text: "Sin fricción", icon: "fi fi-rr-bolt" },
            { text: "Crecimiento rápido", icon: "fi fi-rr-chart-line-up" },
            { text: "Proyectos cortos", icon: "fi fi-rr-time-fast" },
            { text: "Talento joven", icon: "fi fi-rr-users" },
            { text: "Empresas reales", icon: "fi fi-rr-building" },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y: -6 }} className="p-px rounded-2xl bg-linear-to-br from-[#6651DD]/40 to-orange-400/40">
              <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-3 transition-all duration-300 hover:shadow-md">
                {/* ICONO */}
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#6651DD]/10">
                  <i className={`${item.icon} text-base bg-linear-to-br from-[#6651DD] to-orange-500 bg-clip-text text-transparent`} />
                </div>

                {/* TEXTO */}
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

          {/* LOGOS */}
          <div className="flex flex-wrap justify-center gap-10 opacity-70">
            {["fi fi-rr-building", "fi fi-rr-globe", "fi fi-rr-bullseye", "fi fi-rr-rocket", "fi fi-rr-briefcase"].map((icon, i) => (
              <div key={i} className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition">
                <i className={`${icon} text-xl text-[#4D4F4E]`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-10">
          <div>
            <p className="text-xs text-[#6651DD] font-semibold uppercase tracking-wider">Resultados reales</p>

            <h2 className="text-3xl font-bold text-[#252B2B]">Proyectos que construyen portafolio</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, i) => (
              <motion.div key={i} whileHover={{ y: -6 }} className="rounded-3xl overflow-hidden border border-[#CCCCCC] bg-white">
                {/* IMAGEN / MOCKUP */}
                <div className="h-40 bg-linear-to-br from-[#6651DD]/20 to-orange-400/20 flex items-center justify-center">
                  <i className="fi fi-rr-picture text-3xl text-[#6651DD]" />
                </div>

                {/* INFO */}
                <div className="p-5 space-y-2">
                  <h3 className="font-semibold text-[#252B2B] text-sm">Landing para startup</h3>

                  <p className="text-xs text-[#4D4F4E]">Proyecto real desarrollado en 2 semanas</p>

                  <div className="flex items-center gap-2 text-xs text-[#6651DD] font-medium">
                    <i className="fi fi-rr-user" />
                    Ver perfil del creador
                  </div>
                </div>
              </motion.div>
            ))}
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
              { icon: "fi fi-rr-user-add", text: "Nuevo candidato se unió" },
              { icon: "fi fi-rr-briefcase", text: "Proyecto publicado por startup" },
              { icon: "fi fi-rr-check", text: "Proyecto completado con éxito" },
              { icon: "fi fi-rr-comment", text: "Feedback enviado a un candidato" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-gray-50 border border-[#CCCCCC] rounded-xl px-4 py-3">
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
