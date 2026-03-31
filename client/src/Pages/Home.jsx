import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400..700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --orange:      #F26419;
  --orange-dark: #C94E0D;
  --orange-soft: #FEF0E8;
  --gray-900:    #1C1C1E;
  --gray-700:    #3A3A3C;
  --gray-500:    #6B6B6E;
  --gray-200:    #E5E5EA;
  --gray-100:    #F5F5F7;
  --white:       #FFFFFF;
  --r:           12px;
  --ease:        0.22s cubic-bezier(.4,0,.2,1);
  --font:        'AR One Sans', sans-serif;
}

body { margin:0; font-family: var(--font); background: var(--white); color: var(--gray-900); }

/* ── NAVBAR ── */
.nav {
  position: sticky; top:0; z-index:100;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--gray-200);
  padding: 0 5%;
  height: 64px;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
.nav-logo-mark {
  width:34px; height:34px;
  background: var(--orange);
  border-radius:9px;
  display:flex; align-items:center; justify-content:center;
}
.nav-logo-mark svg { width:18px; height:18px; }
.nav-logo-name { font-weight:700; font-size:20px; color:var(--gray-900); letter-spacing:-.3px; }
.nav-links { display:flex; align-items:center; gap:8px; }
.nav-link {
  font-size:14px; font-weight:500; color:var(--gray-500);
  padding:8px 14px; border-radius:8px;
  text-decoration:none; background:none; border:none; cursor:pointer;
  font-family:var(--font);
  transition: color var(--ease), background var(--ease);
}
.nav-link:hover { color:var(--gray-900); background:var(--gray-100); }
.nav-cta {
  padding:9px 20px;
  background:var(--orange); color:var(--white);
  border:none; border-radius:100px;
  font-family:var(--font); font-size:14px; font-weight:600;
  cursor:pointer; transition:all var(--ease);
}
.nav-cta:hover { background:var(--orange-dark); transform:translateY(-1px); box-shadow:0 4px 16px rgba(242,100,25,.28); }

/* ── HERO ── */
.hero {
  padding: 96px 5% 80px;
  display:flex; align-items:center; justify-content:space-between; gap:48px;
  max-width:1200px; margin:0 auto;
}
.hero-content { flex:1; }
.hero-badge {
  display:inline-flex; align-items:center; gap:6px;
  background:var(--orange-soft); color:var(--orange);
  font-size:12px; font-weight:600; letter-spacing:.6px; text-transform:uppercase;
  padding:5px 14px; border-radius:100px; margin-bottom:24px;
}
.hero-badge::before { content:''; width:6px; height:6px; background:var(--orange); border-radius:50%; }
.hero h1 {
  font-size:clamp(38px,5vw,64px); font-weight:700;
  line-height:1.05; letter-spacing:-1.5px;
  color:var(--gray-900); margin-bottom:20px;
}
.hero h1 em { color:var(--orange); font-style:normal; }
.hero-sub {
  font-size:17px; color:var(--gray-500); line-height:1.7;
  max-width:500px; margin-bottom:36px;
}
.hero-actions { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.btn-primary {
  padding:14px 28px;
  background:var(--orange); color:var(--white);
  border:none; border-radius:100px;
  font-family:var(--font); font-size:15px; font-weight:600;
  cursor:pointer; display:flex; align-items:center; gap:8px;
  transition:all var(--ease);
}
.btn-primary:hover { background:var(--orange-dark); transform:translateY(-2px); box-shadow:0 8px 24px rgba(242,100,25,.3); }
.btn-secondary {
  padding:14px 28px;
  background:transparent; color:var(--gray-700);
  border:1.5px solid var(--gray-200); border-radius:100px;
  font-family:var(--font); font-size:15px; font-weight:500;
  cursor:pointer; transition:all var(--ease);
}
.btn-secondary:hover { border-color:var(--gray-500); background:var(--gray-100); }

.hero-visual {
  flex:1; max-width:480px;
  background: linear-gradient(135deg, var(--orange-soft) 0%, #FFF6F0 100%);
  border-radius:24px; padding:32px;
  border:1px solid rgba(242,100,25,.1);
  display:flex; flex-direction:column; gap:16px;
}
.hero-card {
  background:var(--white); border-radius:14px; padding:18px 20px;
  border:1px solid var(--gray-200);
  box-shadow:0 2px 12px rgba(0,0,0,.06);
  display:flex; align-items:center; gap:14px;
}
.hero-card-icon {
  width:42px; height:42px; border-radius:10px;
  background:var(--orange-soft);
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; font-size:20px;
}
.hero-card-body { flex:1; }
.hero-card-title { font-size:13px; font-weight:600; color:var(--gray-900); margin-bottom:3px; }
.hero-card-sub { font-size:12px; color:var(--gray-500); }
.hero-card-badge {
  font-size:11px; font-weight:600;
  padding:4px 10px; border-radius:100px;
  background:var(--orange-soft); color:var(--orange);
}

/* ── STATS ── */
.stats-bar {
  background:var(--gray-900);
  padding:40px 5%;
}
.stats-inner {
  max-width:1200px; margin:0 auto;
  display:flex; justify-content:space-around; align-items:center; flex-wrap:wrap; gap:32px;
}
.stat-item { text-align:center; }
.stat-value { font-size:clamp(28px,3vw,40px); font-weight:700; color:var(--orange); letter-spacing:-1px; }
.stat-label { font-size:13px; color:rgba(255,255,255,.5); margin-top:4px; }
.stat-sep { width:1px; height:48px; background:rgba(255,255,255,.1); }

/* ── HOW IT WORKS ── */
.section { padding:80px 5%; max-width:1200px; margin:0 auto; }
.section-tag {
  font-size:12px; font-weight:600; letter-spacing:.7px; text-transform:uppercase;
  color:var(--orange); margin-bottom:12px;
}
.section-title {
  font-size:clamp(28px,3vw,40px); font-weight:700;
  letter-spacing:-1px; color:var(--gray-900); margin-bottom:12px;
}
.section-sub { font-size:16px; color:var(--gray-500); max-width:500px; line-height:1.7; margin-bottom:56px; }

.steps { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:24px; }
.step-card {
  background:var(--gray-100); border-radius:20px; padding:32px 28px;
  border:1px solid var(--gray-200);
  transition:all var(--ease); position:relative; overflow:hidden;
}
.step-card::before {
  content:''; position:absolute;
  top:0; left:0; right:0; height:3px;
  background:var(--orange); transform:scaleX(0); transform-origin:left;
  transition:transform .35s var(--ease);
}
.step-card:hover { background:var(--white); box-shadow:0 8px 32px rgba(0,0,0,.09); transform:translateY(-4px); }
.step-card:hover::before { transform:scaleX(1); }
.step-num {
  font-size:13px; font-weight:700; color:var(--orange);
  background:var(--orange-soft); padding:4px 12px;
  border-radius:100px; display:inline-block; margin-bottom:20px;
}
.step-icon { font-size:32px; margin-bottom:14px; }
.step-title { font-size:17px; font-weight:700; color:var(--gray-900); margin-bottom:8px; }
.step-desc { font-size:14px; color:var(--gray-500); line-height:1.65; }

/* ── FOR WHO ── */
.forwho-wrap { background:var(--gray-100); padding:80px 5%; }
.forwho { max-width:1200px; margin:0 auto; }
.forwho-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.fw-card {
  background:var(--white); border-radius:20px; padding:32px;
  border:1px solid var(--gray-200);
  transition:all var(--ease);
}
.fw-card:hover { box-shadow:0 8px 32px rgba(0,0,0,.08); transform:translateY(-2px); }
.fw-card-icon { font-size:36px; margin-bottom:16px; }
.fw-card-title { font-size:20px; font-weight:700; color:var(--gray-900); margin-bottom:10px; }
.fw-card-desc { font-size:14px; color:var(--gray-500); line-height:1.7; margin-bottom:20px; }
.fw-list { list-style:none; display:flex; flex-direction:column; gap:8px; }
.fw-list li {
  font-size:14px; color:var(--gray-700);
  display:flex; align-items:center; gap:8px;
}
.fw-list li::before { content:'→'; color:var(--orange); font-weight:700; }

/* ── CTA SECTION ── */
.cta-section {
  background:var(--orange); padding:80px 5%;
  text-align:center;
}
.cta-section h2 {
  font-size:clamp(28px,3.5vw,44px); font-weight:700;
  color:var(--white); letter-spacing:-1px; margin-bottom:16px;
}
.cta-section p { font-size:16px; color:rgba(255,255,255,.75); margin-bottom:36px; }
.btn-white {
  padding:15px 36px;
  background:var(--white); color:var(--orange);
  border:none; border-radius:100px;
  font-family:var(--font); font-size:15px; font-weight:700;
  cursor:pointer; transition:all var(--ease);
  display:inline-flex; align-items:center; gap:8px;
}
.btn-white:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.15); }

/* ── FOOTER ── */
.footer {
  background:var(--gray-900); padding:40px 5%;
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:20px;
}
.footer-logo { display:flex; align-items:center; gap:10px; }
.footer-logo-mark {
  width:28px; height:28px; background:var(--orange);
  border-radius:7px; display:flex; align-items:center; justify-content:center;
}
.footer-logo-mark svg { width:14px; height:14px; }
.footer-name { font-weight:700; font-size:16px; color:var(--white); }
.footer-copy { font-size:13px; color:rgba(255,255,255,.35); }

@media (max-width:768px) {
  .hero { flex-direction:column; padding:60px 5% 48px; }
  .hero-visual { max-width:100%; }
  .forwho-grid { grid-template-columns:1fr; }
  .nav-links .nav-link { display:none; }
  .stat-sep { display:none; }
}
`;

const BoltIcon = () => (
  <svg viewBox="0 0 20 20" fill="none">
    <path d="M10 2L3 11h7l-1 7 8-10h-7l1-8z" fill="white"/>
  </svg>
);
const ArrowRight = ({ color = "white" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{CSS}</style>

      {/* NAVBAR */}
      <nav className="nav">
        <a href="/" className="nav-logo">
          <div className="nav-logo-mark"><BoltIcon /></div>
          <span className="nav-logo-name">Impulso</span>
        </a>
        <div className="nav-links">
          <a href="#como-funciona" className="nav-link">Cómo funciona</a>
          <a href="#para-quien" className="nav-link">Para quién</a>
          <button className="nav-link" onClick={() => navigate("/login")}>Iniciar sesión</button>
          <button className="nav-cta" onClick={() => navigate("/registro")}>Registrarse gratis</button>
        </div>
      </nav>

      {/* HERO */}
      <section>
        <div className="hero">
          <div className="hero-content">
            <div className="hero-badge">Plataforma de experiencia profesional</div>
            <h1>Tu primera<br/>experiencia<br/><em>empieza aquí</em></h1>
            <p className="hero-sub">
              Conectamos jóvenes talentosos con microproyectos reales
              de empresas, para que construyan su trayectoria
              profesional desde el primer día.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("/registro")}>
                Empieza ahora <ArrowRight />
              </button>
              <button className="btn-secondary" onClick={() => navigate("/login")}>
                Ya tengo cuenta
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-icon">🎯</div>
              <div className="hero-card-body">
                <div className="hero-card-title">Diagnóstico de redes sociales</div>
                <div className="hero-card-sub">Startup local · 2 semanas</div>
              </div>
              <div className="hero-card-badge">Nivel 1</div>
            </div>
            <div className="hero-card">
              <div className="hero-card-icon">📊</div>
              <div className="hero-card-body">
                <div className="hero-card-title">Análisis de mercado</div>
                <div className="hero-card-sub">Agencia digital · 3 semanas</div>
              </div>
              <div className="hero-card-badge">Nivel 2</div>
            </div>
            <div className="hero-card">
              <div className="hero-card-icon">⚡</div>
              <div className="hero-card-body">
                <div className="hero-card-title">Plan de contenidos</div>
                <div className="hero-card-sub">ONG Medellín · 2 semanas</div>
              </div>
              <div className="hero-card-badge">Nivel 1</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-value">+500</div>
            <div className="stat-label">Jóvenes activos</div>
          </div>
          <div className="stat-sep" />
          <div className="stat-item">
            <div className="stat-value">+120</div>
            <div className="stat-label">Proyectos publicados</div>
          </div>
          <div className="stat-sep" />
          <div className="stat-item">
            <div className="stat-value">87%</div>
            <div className="stat-label">Tasa de satisfacción</div>
          </div>
          <div className="stat-sep" />
          <div className="stat-item">
            <div className="stat-value">+60</div>
            <div className="stat-label">Empresas aliadas</div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="como-funciona">
        <div className="section">
          <div className="section-tag">Cómo funciona</div>
          <div className="section-title">Simple, rápido y real</div>
          <p className="section-sub">
            En 4 pasos pasas de no tener experiencia a tener proyectos
            certificados en tu portafolio.
          </p>
          <div className="steps">
            {[
              { n:"01", icon:"👤", t:"Crea tu perfil", d:"Cuéntanos qué sabes hacer, qué herramientas manejas y qué tipo de proyectos te interesan. Sin pedirnos años de experiencia." },
              { n:"02", icon:"🔍", t:"Explora proyectos", d:"Navega microproyectos reales publicados por startups, ONGs y empresas locales filtrados por tu nivel y área." },
              { n:"03", icon:"🚀", t:"Postúlate y trabaja", d:"Aplica con una breve propuesta. Si eres seleccionado, desarrollas el proyecto con entregables claros y acompañamiento." },
              { n:"04", icon:"🏆", t:"Certifica tu experiencia", d:"Recibe evaluación profesional y un certificado verificable que puedes agregar a tu LinkedIn y portafolio." },
            ].map(s => (
              <div className="step-card" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-title">{s.t}</div>
                <div className="step-desc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOR WHO */}
      <div id="para-quien" className="forwho-wrap">
        <div className="forwho">
          <div className="section-tag">Para quién es</div>
          <div className="section-title">Dos lados, un mismo ecosistema</div>
          <p className="section-sub" style={{marginBottom:48}}>
            Impulso conecta a quienes necesitan experiencia con quienes
            necesitan talento fresco.
          </p>
          <div className="forwho-grid">
            <div className="fw-card">
              <div className="fw-card-icon">🎓</div>
              <div className="fw-card-title">Jóvenes profesionales</div>
              <p className="fw-card-desc">
                Estudiantes próximos a graduarse o recién egresados que
                necesitan una primera oportunidad real.
              </p>
              <ul className="fw-list">
                <li>Sin exigencia de experiencia previa</li>
                <li>Proyectos por nivel de habilidad</li>
                <li>Portafolio y certificados verificables</li>
                <li>Acompañamiento y feedback real</li>
              </ul>
            </div>
            <div className="fw-card">
              <div className="fw-card-icon">🏢</div>
              <div className="fw-card-title">Empresas y organizaciones</div>
              <p className="fw-card-desc">
                Startups, ONGs y pequeñas empresas que necesitan
                talento para proyectos específicos sin contratar de planta.
              </p>
              <ul className="fw-list">
                <li>Publica proyectos de forma gratuita</li>
                <li>Accede a talento emergente validado</li>
                <li>Evalúa antes de contratar</li>
                <li>Impacto social verificable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <h2>¿Listo para tu primera experiencia?</h2>
        <p>Únete a más de 500 jóvenes que ya están construyendo su trayectoria.</p>
        <button className="btn-white" onClick={() => navigate("/registro")}>
          Empieza gratis <ArrowRight color="#F26419" />
        </button>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">
          <div className="footer-logo-mark"><BoltIcon /></div>
          <span className="footer-name">Impulso</span>
        </div>
        <span className="footer-copy">© 2025 Impulso · Medellín, Colombia</span>
      </footer>
    </>
  );
}
