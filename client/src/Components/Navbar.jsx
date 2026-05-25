import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import { Button, Dropdown, Label } from "@heroui/react";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import logo from "../../Public/Logo.jpeg";

const API = import.meta.env.VITE_API_URL;

const NavItem = ({ text, path, isActive, navigate }) => {
  const active = isActive(path);
  return (
    <button onClick={() => navigate(path)}
      className="relative px-4 py-2 text-sm transition-all duration-200 cursor-pointer border-none group">
      <span className={active ? "text-white" : "text-gray-300 group-hover:text-white"}>{text}</span>
      <span className={`absolute left-0 -bottom-1 h-0.5 bg-orange-500 transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
    </button>
  );
};

/* ── Panel de notificaciones ─────────────────────────────────────────── */
function NotificationsPanel({ messages, onClose, navigate, user }) {
  if (messages.length === 0) {
    return (
      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
        <div className="bg-[#1C1712] px-4 py-3 flex items-center justify-between">
          <p className="text-white font-bold text-sm">Mensajes</p>
          <button onClick={onClose} className="text-white/40 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
        </div>
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <i className="fi fi-rr-envelope text-3xl text-gray-200" />
          <p className="text-sm text-gray-400 font-medium">Sin mensajes nuevos</p>
        </div>
      </div>
    );
  }

  const formatTime = (dateStr) => {
    const d    = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now - d) / 60000); // minutos
    if (diff < 1)  return "Ahora";
    if (diff < 60) return `hace ${diff}m`;
    if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`;
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  };

  // Agrupar por application_id + step_id para no mostrar duplicados del mismo chat
  const grouped = messages.reduce((acc, msg) => {
    const key = `${msg.application_id}_${msg.step_id}`;
    if (!acc[key]) acc[key] = { ...msg, count: 1 };
    else acc[key].count++;
    return acc;
  }, {});

  const items = Object.values(grouped);

  const goToTimeline = (msg) => {
    onClose();
    // Candidato va al timeline, empresa va a postulantes del job
    if (user?.role === "candidato") {
      navigate(`/candidato/timeline/${msg.application_id}`);
    } else {
      navigate(`/empresa/proyecto/${msg.job_id}/postulantes`);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-88 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      style={{ width: "360px" }}>

      {/* Header */}
      <div className="bg-[#1C1712] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-white font-bold text-sm">Mensajes nuevos</p>
          <span className="text-[10px] font-bold bg-[#E26000] text-white px-2 py-0.5 rounded-full">
            {messages.length}
          </span>
        </div>
        <button onClick={onClose}
          className="text-white/40 hover:text-white bg-transparent border-none cursor-pointer text-xl leading-none">
          ×
        </button>
      </div>

      {/* Lista */}
      <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        {items.map((msg, i) => (
          <div key={i}
            onClick={() => goToTimeline(msg)}
            className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors last:border-0">

            {/* Avatar del remitente */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
              style={{ background: msg.sender_role === "empresa"
                ? "linear-gradient(135deg,#6651DD,#8B78F0)"
                : "linear-gradient(135deg,#E26000,#FF8C3A)" }}>
              {msg.sender_name?.[0]?.toUpperCase() || "?"}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <p className="text-xs font-bold text-gray-900 truncate">{msg.sender_name}</p>
                <span className="text-[10px] text-gray-400 shrink-0">{formatTime(msg.created_at)}</span>
              </div>

              {/* Contexto del proyecto */}
              <p className="text-[10px] text-[#E26000] font-semibold truncate mb-1">
                {msg.job_title} · {msg.step_title}
              </p>

              {/* Mensaje */}
              <p className="text-xs text-gray-500 truncate leading-relaxed">{msg.message}</p>

              {/* Badge si hay varios */}
              {msg.count > 1 && (
                <span className="inline-flex items-center mt-1 text-[9px] font-bold bg-orange-50 text-[#E26000] border border-orange-100 px-2 py-0.5 rounded-full">
                  +{msg.count - 1} más en esta etapa
                </span>
              )}
            </div>

            {/* Flecha */}
            <i className="fi fi-rr-arrow-right text-gray-300 text-xs mt-1 shrink-0" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <button
          onClick={() => { onClose(); navigate(user?.role === "candidato" ? "/candidato" : "/empresa"); }}
          className="w-full text-xs font-semibold text-[#E26000] bg-transparent border-none cursor-pointer hover:underline text-center">
          Ver todos mis proyectos →
        </button>
      </div>
    </div>
  );
}

/* ── Navbar ───────────────────────────────────────────────────────────── */
export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, token } = useAuth();
  const MySwal    = withReactContent(Swal);

  const [open, setOpen]               = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [unread, setUnread]           = useState(0);
  const [unreadMsgs, setUnreadMsgs]   = useState([]);
  const [panelOpen, setPanelOpen]     = useState(false);
  const panelRef                      = useRef(null);
  const intervalRef                   = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchUnread = async () => {
    if (!user || !token) return;
    try {
      const res  = await fetch(`${API}/api/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnread(data.count || 0);
      setUnreadMsgs(data.messages || []);
    } catch { /* silencioso */ }
  };

  // Fetch al cargar + polling 30s
  useEffect(() => {
    if (!user || !token) return;
    fetchUnread();
    intervalRef.current = setInterval(fetchUnread, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [user, token]);

  // Refrescar al cambiar ruta
  useEffect(() => { fetchUnread(); }, [location.pathname]);

  const handleAction = (key) => {
    if (key === "mi-perfil") {
      if (user?.role === "empresa") {
        MySwal.fire({
          title:             "¡Próximamente!",
          text:              "El perfil de empresa está en construcción. Pronto podrás personalizar tu página, agregar logo, descripción y más. ¡Gracias por tu paciencia!",
          icon:              "info",
          confirmButtonColor: "#E26000",
          confirmButtonText: "Entendido",
        });
      } else {
        navigate("/candidato/perfil");
      }
    }
    if (key === "portafolio")    navigate("/portafolio");
    if (key === "cerrar-sesion") { logout(); navigate("/login"); }
  };

  return (
    <>
      <nav
        className="fixed z-50 w-full flex items-center justify-between px-6 text-white border-b border-white/10 transition-all duration-300"
        style={{
          height:          scrolled ? "56px" : "64px",
          backgroundColor: `rgba(37,43,43,${scrolled ? 0.75 : 1})`,
          backdropFilter:  scrolled ? "blur(6px)" : "none",
        }}
      >
        {/* Logo */}
        <div onClick={() => navigate("/")}
          className={`font-bold cursor-pointer flex items-center gap-2 transition-all duration-300 ${scrolled ? "text-base" : "text-lg"}`}>
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg" /> Impulso
        </div>

        {/* Menu desktop */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            {user.role === "candidato" && (
              <>
                <NavItem text="Inicio"        path="/"           isActive={isActive} navigate={navigate} />
                <NavItem text="Oportunidades" path="/dashboard"  isActive={isActive} navigate={navigate} />
                <NavItem text="Mis proyectos" path="/candidato"  isActive={isActive} navigate={navigate} />
                <NavItem text="Mi portafolio" path="/portafolio" isActive={isActive} navigate={navigate} />
              </>
            )}
            {user.role === "empresa" && (
              <>
                <NavItem text="Inicio"        path="/"        isActive={isActive} navigate={navigate} />
                <NavItem text="Mis proyectos" path="/empresa" isActive={isActive} navigate={navigate} />
                <NavItem text="Talentos"      path="/talento" isActive={isActive} navigate={navigate} />
              </>
            )}
          </div>
        )}

        {/* Derecha */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <button onClick={() => navigate("/login")}
                className="text-sm text-gray-300 hover:text-white cursor-pointer border-none bg-transparent">
                Iniciar sesión
              </button>
              <button
                className="bg-orange-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 cursor-pointer border-none"
                onClick={() => MySwal.fire({
                  title: "¡Próximamente registro!",
                  text:  "Estamos mejorando el registro para ofrecerte una mejor experiencia.",
                  icon:  "warning",
                })}>
                Regístrate
              </button>
            </>
          ) : (
            <>
              {/* ── Botón de mensajes con panel ── */}
              <div className="relative" ref={panelRef}>
                <button
                  onClick={() => setPanelOpen((p) => !p)}
                  className="relative text-white text-xl cursor-pointer hover:text-orange-400 transition-all duration-200 hover:scale-110 active:scale-95 bg-transparent border-none"
                  title="Mensajes"
                >
                  <i className="fi fi-rr-envelope-dot" />

                  {/* Badge */}
                  {unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-orange-500 text-[10px] rounded-full text-white font-bold flex items-center justify-center animate-pulse leading-none">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </button>

                {/* Panel desplegable */}
                {panelOpen && (
                  <NotificationsPanel
                    messages={unreadMsgs}
                    onClose={() => setPanelOpen(false)}
                    navigate={navigate}
                    user={user}
                  />
                )}
              </div>

              {/* Dropdown usuario */}
              <Dropdown onOpenChange={(o) => setMenuOpen(o)}>
                <Button aria-label="Menu" variant="ghost"
                  className="text-xl text-white cursor-pointer transition-all duration-300 hover:text-orange-500 hover:scale-110 active:scale-95">
                  <i className={`fi fi-rr-user-gear transition-all duration-300 ${menuOpen ? "rotate-180 text-orange-500 scale-110" : ""}`} />
                </Button>

                <Dropdown.Popover>
                  <Dropdown.Menu onAction={handleAction}>
                    <Dropdown.Item id="info" isReadOnly>
                      <div className="px-1 py-1 border-b border-gray-100 mb-1">
                        <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                      </div>
                    </Dropdown.Item>

                    <Dropdown.Item id="mi-perfil">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                          <i className="fi fi-rr-user text-white text-sm" />
                        </div>
                        <Label>Mi perfil</Label>
                      </div>
                    </Dropdown.Item>

                    {user.role === "candidato" && (
                      <Dropdown.Item id="portafolio">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                            <i className="fi fi-rr-briefcase text-white text-sm" />
                          </div>
                          <Label>Mi portafolio</Label>
                        </div>
                      </Dropdown.Item>
                    )}

                    <Dropdown.Item id="cerrar-sesion" variant="danger">
                      <div className="flex items-center gap-2 text-red-500">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <i className="fi fi-rr-door-open text-red-600 text-sm" />
                        </div>
                        <Label>Cerrar sesión</Label>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>

              {/* Hamburguesa mobile */}
              <button onClick={() => setOpen(!open)}
                className="md:hidden text-xl border-none bg-transparent cursor-pointer text-white">
                <i className="fi fi-rr-menu-burger" />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {open && user && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-[#252B2B] border-t border-white/10 flex flex-col px-6 py-4 gap-4 z-40">
          {user.role === "candidato" && (
            <>
              <NavItem text="Inicio"        path="/"           isActive={isActive} navigate={navigate} />
              <NavItem text="Oportunidades" path="/dashboard"  isActive={isActive} navigate={navigate} />
              <NavItem text="Mis proyectos" path="/candidato"  isActive={isActive} navigate={navigate} />
              <NavItem text="Mi portafolio" path="/portafolio" isActive={isActive} navigate={navigate} />
            </>
          )}
          {user.role === "empresa" && (
            <>
              <NavItem text="Inicio"        path="/"        isActive={isActive} navigate={navigate} />
              <NavItem text="Mis proyectos" path="/empresa" isActive={isActive} navigate={navigate} />
              <NavItem text="Talentos"      path="/talento" isActive={isActive} navigate={navigate} />
            </>
          )}
        </div>
      )}
    </>
  );
}