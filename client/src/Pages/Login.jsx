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
  --error:       #FF3B30;
  --r:           12px;
  --ease:        0.22s cubic-bezier(.4,0,.2,1);
  --font:        'AR One Sans', sans-serif;
}

body { margin:0; font-family: var(--font); }

.page {
  min-height:100vh;
  display:flex;
  font-family: var(--font);
  background: var(--gray-100);
}

/* ── LEFT ── */
.left {
  flex:1;
  background: var(--orange);
  display:flex; flex-direction:column; justify-content:space-between;
  padding: 48px 52px;
  position:relative; overflow:hidden;
}
.left::before {
  content:'';
  position:absolute; width:500px; height:500px; border-radius:50%;
  background:rgba(255,255,255,.08);
  top:-180px; right:-140px; pointer-events:none;
}
.left::after {
  content:'';
  position:absolute; width:320px; height:320px; border-radius:50%;
  background:rgba(255,255,255,.05);
  bottom:40px; left:-80px; pointer-events:none;
}

.logo { display:flex; align-items:center; gap:10px; z-index:1; cursor:pointer; }
.logo-mark {
  width:36px; height:36px;
  background:rgba(255,255,255,.2);
  border-radius:10px;
  display:flex; align-items:center; justify-content:center;
}
.logo-mark svg { width:18px; height:18px; }
.logo-name { font-weight:700; font-size:22px; color:var(--white); letter-spacing:-.3px; }

.hero { z-index:1; }
.hero-tag {
  display:inline-flex; align-items:center; gap:6px;
  background:rgba(255,255,255,.15);
  border:1px solid rgba(255,255,255,.25);
  color:var(--white);
  font-size:11px; font-weight:600; letter-spacing:.7px; text-transform:uppercase;
  padding:6px 14px; border-radius:100px; margin-bottom:28px;
}
.hero-tag::before { content:''; width:6px; height:6px; background:var(--white); border-radius:50%; }
.hero h1 {
  font-size:clamp(30px,3.2vw,46px); font-weight:700;
  color:var(--white); line-height:1.1; letter-spacing:-1px; margin-bottom:20px;
}
.hero h1 em { color:rgba(255,255,255,.7); font-style:normal; }
.hero p { font-size:15px; color:rgba(255,255,255,.65); line-height:1.75; max-width:380px; }

.stats { display:flex; gap:32px; z-index:1; }
.stat { display:flex; flex-direction:column; gap:4px; }
.stat-v { font-size:26px; font-weight:700; color:var(--white); letter-spacing:-.5px; }
.stat-l { font-size:12px; color:rgba(255,255,255,.5); }
.stat-sep { width:1px; background:rgba(255,255,255,.2); align-self:stretch; }

/* ── RIGHT ── */
.right {
  width:480px;
  background:var(--white);
  display:flex; flex-direction:column; justify-content:center;
  padding: 60px 52px;
}

.rh { margin-bottom:32px; }
.rh h2 { font-size:26px; font-weight:700; color:var(--gray-900); letter-spacing:-.5px; margin-bottom:8px; }
.rh p { font-size:14px; color:var(--gray-500); }
.rh a { color:var(--orange); font-weight:600; text-decoration:none; transition:opacity var(--ease); }
.rh a:hover { opacity:.7; }

/* oauth */
.oauth { display:flex; gap:12px; margin-bottom:24px; }
.oauth-btn {
  flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
  padding:11px 16px;
  border:1.5px solid var(--gray-200); border-radius:var(--r);
  background:transparent; cursor:pointer;
  font-family:var(--font); font-size:13.5px; font-weight:500; color:var(--gray-700);
  transition:all var(--ease);
}
.oauth-btn:hover { background:var(--gray-100); border-color:#c4c4cc; }
.oauth-btn svg { width:18px; height:18px; flex-shrink:0; }

.divider { display:flex; align-items:center; gap:14px; margin-bottom:24px; }
.divider::before,.divider::after { content:''; flex:1; height:1px; background:var(--gray-200); }
.divider span { font-size:12px; color:var(--gray-500); white-space:nowrap; }

.form { display:flex; flex-direction:column; gap:18px; }

.fg { display:flex; flex-direction:column; gap:7px; }
.fg label { font-size:13px; font-weight:600; color:var(--gray-700); }

.fw { position:relative; }
.fi {
  position:absolute; left:14px; top:50%; transform:translateY(-50%);
  color:var(--gray-500); display:flex; pointer-events:none;
}
.fi svg { width:16px; height:16px; }

.fw input {
  width:100%; padding:12px 14px 12px 42px;
  border:1.5px solid var(--gray-200); border-radius:var(--r);
  background:var(--gray-100);
  font-family:var(--font); font-size:14px; color:var(--gray-900);
  outline:none; transition:all var(--ease);
}
.fw input::placeholder { color:#b0b0bc; }
.fw input:focus { border-color:var(--orange); background:var(--white); box-shadow:0 0 0 3px rgba(242,100,25,.1); }
.fw input.err { border-color:var(--error); background:#fff5f5; }

.eye-btn {
  position:absolute; right:14px; top:50%; transform:translateY(-50%);
  background:none; border:none; cursor:pointer;
  color:var(--gray-500); display:flex; padding:2px; transition:color var(--ease);
}
.eye-btn:hover { color:var(--gray-900); }
.eye-btn svg { width:16px; height:16px; }

.ferr { font-size:12px; color:var(--error); }

.row { display:flex; align-items:center; justify-content:space-between; }
.ck-label {
  display:flex; align-items:center; gap:8px;
  cursor:pointer; font-size:13px; color:var(--gray-500); user-select:none;
}
.ck-label input { width:15px; height:15px; accent-color:var(--orange); cursor:pointer; }
.forgot { font-size:13px; color:var(--orange); text-decoration:none; font-weight:500; transition:opacity var(--ease); }
.forgot:hover { opacity:.7; }

.btn-sub {
  width:100%; padding:14px;
  background:var(--orange); color:var(--white);
  border:none; border-radius:100px;
  font-family:var(--font); font-weight:700; font-size:15px;
  cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
  transition:all var(--ease); margin-top:4px;
}
.btn-sub:hover { background:var(--orange-dark); transform:translateY(-1px); box-shadow:0 6px 20px rgba(242,100,25,.3); }
.btn-sub:active { transform:translateY(0); }
.btn-sub:disabled { opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }

.toast {
  position:fixed; bottom:28px; right:28px;
  background:var(--gray-900); color:var(--white);
  padding:14px 22px; border-radius:var(--r);
  font-size:14px; font-weight:500;
  display:flex; align-items:center; gap:10px;
  box-shadow:0 8px 32px rgba(0,0,0,.18);
  animation:slideUp .3s ease forwards; z-index:9999;
}
.toast-dot { width:8px; height:8px; background:var(--orange); border-radius:50%; flex-shrink:0; }
@keyframes slideUp {
  from { opacity:0; transform:translateY(12px); }
  to   { opacity:1; transform:translateY(0); }
}

@media (max-width:860px) {
  .left { display:none; }
  .right { width:100%; padding:40px 28px; }
}
`;

/* Icons */
const BoltIcon = () => (
  <svg viewBox="0 0 20 20" fill="none">
    <path d="M10 2L3 11h7l-1 7 8-10h-7l1-8z" fill="white"/>
  </svg>
);
const Mail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m2 7 10 7 10-7"/>
  </svg>
);
const Lock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const Eye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

function validate(email, password) {
  const e = {};
  if (!email) e.email = "El correo es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Correo inválido";
  if (!password) e.password = "La contraseña es requerida";
  else if (password.length < 6) e.password = "Mínimo 6 caracteres";
  return e;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    // 👉 Reemplaza con: await fetch('/api/auth/login', { method:'POST', body: JSON.stringify({email,password}) })
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setToast(true);
    setTimeout(() => { setToast(false); navigate("/"); }, 2500);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="page">

        {/* LEFT */}
        <div className="left">
          <div className="logo" onClick={() => navigate("/")}>
            <div className="logo-mark"><BoltIcon /></div>
            <span className="logo-name">Impulso</span>
          </div>
          <div className="hero">
            <div className="hero-tag">Plataforma de experiencia profesional</div>
            <h1>Tu primera<br/>experiencia<br/><em>empieza aquí</em></h1>
            <p>Conectamos jóvenes talentosos con microproyectos reales para construir trayectoria profesional desde el primer día.</p>
          </div>
          <div className="stats">
            <div className="stat">
              <span className="stat-v">+500</span>
              <span className="stat-l">Jóvenes activos</span>
            </div>
            <div className="stat-sep" />
            <div className="stat">
              <span className="stat-v">+120</span>
              <span className="stat-l">Proyectos</span>
            </div>
            <div className="stat-sep" />
            <div className="stat">
              <span className="stat-v">87%</span>
              <span className="stat-l">Satisfacción</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="rh">
            <h2>Bienvenido de nuevo</h2>
            <p>¿No tienes cuenta? <a href="/registro">Regístrate gratis</a></p>
          </div>

          <div className="oauth">
            <button className="oauth-btn" type="button"><GoogleIcon /> Google</button>
            <button className="oauth-btn" type="button"><LinkedInIcon /> LinkedIn</button>
          </div>

          <div className="divider"><span>o continúa con tu correo</span></div>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="fg">
              <label htmlFor="lg-email">Correo electrónico</label>
              <div className="fw">
                <span className="fi"><Mail /></span>
                <input
                  id="lg-email" type="email" placeholder="tu@correo.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className={errors.email ? "err" : ""} autoComplete="email"
                />
              </div>
              {errors.email && <span className="ferr">{errors.email}</span>}
            </div>

            <div className="fg">
              <label htmlFor="lg-pw">Contraseña</label>
              <div className="fw">
                <span className="fi"><Lock /></span>
                <input
                  id="lg-pw" type={showPw ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className={errors.password ? "err" : ""} autoComplete="current-password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && <span className="ferr">{errors.password}</span>}
            </div>

            <div className="row">
              <label className="ck-label">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Recordarme
              </label>
              <a href="/recuperar" className="forgot">¿Olvidaste tu contraseña?</a>
            </div>

            <button className="btn-sub" type="submit" disabled={loading}>
              {loading ? "Ingresando…" : <><span>Ingresar</span><ArrowRight /></>}
            </button>
          </form>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <span className="toast-dot" />
          ¡Bienvenido! Redirigiendo…
        </div>
      )}
    </>
  );
}
