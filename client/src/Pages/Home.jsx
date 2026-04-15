import { Button, Chip } from "@heroui/react";

import Footer from "../Components/footer";
import Navbar from "../Components/Navbar";
import ProjectCard from "../Components/Card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* HERO + STATS (FIRST SCREEN) */}
      <section className="h-screen">
        {/* HERO */}
        <section className="h-[75%] flex items-center justify-center px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* LEFT */}
            <div className="space-y-7">
              <Chip className="bg-orange-100 text-orange-500">Plataforma de experiencia profesional</Chip>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Tu primera <br />
                experiencia <br />
                <span className="text-orange-500">empieza aquí</span>
              </h1>

              <p className="text-gray-500 max-w-md text-sm md:text-base">Conectamos jóvenes talentosos con microproyectos reales de empresas.</p>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => (window.location.href = "/login")} className="bg-orange-500 text-white font-semibold hover:bg-orange-600 transition hover:-translate-y-1 hover:shadow-lg flex items-center gap-2">
                  Empieza ahora
                  <i className="fi fi-rr-arrow-right"></i>
                </Button>

                <Button variant="outline">Ya tengo cuenta</Button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-3 w-full max-w-sm mx-auto bg-orange-100 p-6 rounded-2xl">
              <ProjectCard icon="fi fi-rr-bullseye" title="Diagnóstico de redes sociales" subtitle="Startup local · 2 semanas" level="Nivel 1" />

              <ProjectCard icon="fi fi-rr-chart-line-up" title="Análisis de mercado" subtitle="Agencia digital · 3 semanas" level="Nivel 2" variant="highlighted" />

              <ProjectCard icon="fi fi-rr-bolt" title="Plan de contenidos" subtitle="ONG Medellín · 2 semanas" level="Nivel 1" />
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="bg-gray-900 py-4 px-6 h-24">
          <div className="max-w-5xl mx-auto flex justify-between items-center text-white flex-wrap gap-6">
            <div className="text-center flex-1 min-w-20">
              <p className="text-xl md:text-2xl font-bold text-orange-500">+500</p>
              <p className="text-xs text-gray-400">Jóvenes</p>
            </div>

            <div className="text-center flex-1 min-w-20">
              <p className="text-xl md:text-2xl font-bold text-orange-500">+120</p>
              <p className="text-xs text-gray-400">Proyectos</p>
            </div>

            <div className="text-center flex-1 min-w-20">
              <p className="text-xl md:text-2xl font-bold text-orange-500">87%</p>
              <p className="text-xs text-gray-400">Satisfacción</p>
            </div>

            <div className="text-center flex-1 min-w-20">
              <p className="text-xl md:text-2xl font-bold text-orange-500">+60</p>
              <p className="text-xs text-gray-400">Empresas</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="px-20">
        <div className="space-y-3">
          <p className="text-orange-600 font-semibold">¿Cómo funciona?</p>
          <p className="text-4xl font-bold">Simple, rápido y real</p>
          <p className="text-gray-500 mb-10">En 4 pasos pasas de no tener experiencia a tener proyectos reales.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {/* CARD 1 */}
          <div className="group bg-gray-100 hover:bg-white p-6 rounded-xl border hover:shadow-lg transition space-y-3">
            <Chip className="text-orange-500 bg-orange-100 font-bold w-fit">01</Chip>

            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-lg">
              <i className="fi fi-rr-user text-orange-500 text-xl"></i>
            </div>

            <h3 className="font-semibold text-lg">Crea tu perfil</h3>

            <p className="text-sm text-gray-600 leading-relaxed">Cuéntanos qué sabes hacer, qué herramientas manejas y qué tipo de proyectos te interesan. Sin pedir años de experiencia.</p>
          </div>

          {/* CARD 2 */}
          <div className="group bg-gray-100 hover:bg-white p-6 rounded-xl border hover:shadow-lg transition space-y-3">
            <Chip className="text-orange-500 bg-orange-100 font-bold w-fit">02</Chip>

            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-lg">
              <i className="fi fi-rr-search text-orange-500 text-xl"></i>
            </div>

            <h3 className="font-semibold text-lg">Explora proyectos</h3>

            <p className="text-sm text-gray-600 leading-relaxed">Navega microproyectos reales publicados por emprendimientos y empresas, filtrados por tu nivel y área.</p>
          </div>

          {/* CARD 3 */}
          <div className="group bg-gray-100 hover:bg-white p-6 rounded-xl border hover:shadow-lg transition space-y-3">
            <Chip className="text-orange-500 bg-orange-100 font-bold w-fit">03</Chip>

            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-lg">
              <i className="fi fi-rr-rocket text-orange-500 text-xl"></i>
            </div>

            <h3 className="font-semibold text-lg">Postúlate y trabaja</h3>

            <p className="text-sm text-gray-600 leading-relaxed">Aplica con una propuesta breve. Si eres seleccionado, desarrollas el proyecto con entregables claros.</p>
          </div>

          {/* CARD 4 */}
          <div className="group bg-gray-100 hover:bg-white p-6 rounded-xl border hover:shadow-lg transition space-y-3">
            <Chip className="text-orange-500 bg-orange-100 font-bold w-fit">04</Chip>

            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-lg">
              <i className="fi fi-rr-diploma text-orange-500 text-xl"></i>
            </div>

            <h3 className="font-semibold text-lg">Certifica tu experiencia</h3>

            <p className="text-sm text-gray-600 leading-relaxed">Recibe evaluación profesional y un certificado verificable para tu LinkedIn y portafolio.</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 px-20 pt-10 space-y-3">
        <h3 className="text-3xl font-bold">Dos lados un mismo ecosistema</h3>

        <p className="text-gray-500">Impulso conecta a quienes necesitan experiencia con quieres necesitan talento fresco</p>

        <div className="grid grid-cols-2 gap-x-10">
          {/* card 1 */}
          <ProjectCard icon="fi fi-rr-corporate" title="Jovenes profesionales" subtitle="Estudiantes próximos a graduarse o recien egresados que necesitan una primera oportunidad real">
          </ProjectCard>
          {/* Card 2 */}
          <ProjectCard icon="fi fi-rr-people-line" title="Emprendimientos y organizaciones">
          </ProjectCard>
        </div>
      </section>

      {/* CTA */}
      <div className="bg-orange-500 text-white text-center py-20 px-[5%]">
        <h2 className="text-3xl font-bold mb-4">¿Listo para tu primera experiencia?</h2>
        <p className="mb-6 text-white/80">Únete a cientos de jóvenes construyendo su futuro.</p>

        <Button onClick={() => (window.location.href = "/login")} className="bg-white text-orange-500 px-8 py-3 rounded-full font-bold hover:-translate-y-1 transition shadow">
          Empieza gratis
        </Button>
      </div>

      <Footer />
    </div>
  );
}
