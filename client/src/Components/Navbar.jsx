import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import { Button, Dropdown, Label } from "@heroui/react";
import { useState, useEffect } from "react";

const NavItem = ({ text, path, isActive, navigate }) => {
  const active = isActive(path);

  return (
    <button
      onClick={() => navigate(path)}
      className="relative px-4 py-2 text-sm transition-all duration-200 cursor-pointer border-none group"
    >
      <span className={`${active ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
        {text}
      </span>

      {/* Línea animada */}
      <span
        className={`
          absolute left-0 -bottom-1 h-[2px] bg-orange-500 transition-all duration-300
          ${active ? "w-full" : "w-0 group-hover:w-full"}
        `}
      />
    </button>
  );
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAction = (key) => {
    if (key === "mi-perfil") navigate("/candidato/perfil");
    if (key === "portafolio") navigate("/portafolio");
    if (key === "cerrar-sesion") {
      logout();
      navigate("/login");
    }
  };

  return (
    <>
      <nav
        className="fixed z-50 w-full flex items-center justify-between px-6 
        text-white border-b border-white/10 transition-all duration-300"
        style={{
          height: scrolled ? "56px" : "64px",
          backgroundColor: `rgba(37, 43, 43, ${scrolled ? 0.75 : 1})`,
          backdropFilter: scrolled ? "blur(6px)" : "none"
        }}
      >
        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className={`font-bold cursor-pointer flex items-center gap-2 transition-all duration-300
          ${scrolled ? "text-base" : "text-lg"}`}
        >
          <div
            className={`bg-orange-500 flex items-center justify-center transition-all duration-300
            ${scrolled ? "w-6 h-6" : "w-7 h-7"} rounded-lg`}
          >
            <i className="fi fi-sr-bolt text-white text-sm" />
          </div>
          Impulso
        </div>

        {/* MENU DESKTOP */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            {user.role === "candidato" && (
              <>
                <NavItem text="Inicio" path="/" isActive={isActive} navigate={navigate} />
                <NavItem text="Oportunidades" path="/dashboard" isActive={isActive} navigate={navigate} />
                <NavItem text="Mis proyectos" path="/candidato" isActive={isActive} navigate={navigate} />
                <NavItem text="Mi portafolio" path="/portafolio" isActive={isActive} navigate={navigate} />
              </>
            )}
            {user.role === "empresa" && (
              <>
                <NavItem text="Inicio" path="/" isActive={isActive} navigate={navigate} />
                <NavItem text="Mis proyectos" path="/empresa" isActive={isActive} navigate={navigate} />
                <NavItem text="Talentos" path="/talento" isActive={isActive} navigate={navigate} />
              </>
            )}
          </div>
        )}

        {/* DERECHA */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-gray-300 hover:text-white cursor-pointer border-none"
              >
                Iniciar sesión
              </button>

              <button
                onClick={() => navigate("/registro")}
                className="bg-orange-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 cursor-pointer border-none"
              >
                Registrarse
              </button>
            </>
          ) : (
            <>
              {/* MENSAJES + BADGE */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="text-white cursor-pointer text-xl transition-all duration-200 
                  hover:text-orange-500 hover:scale-110 active:scale-95"
                >
                  <i className="fi fi-rr-envelope-dot"></i>
                </Button>

                <span className="absolute -top-1 -right-1 bg-orange-500 text-[10px] 
                  px-1.5 py-[2px] rounded-full text-white font-bold animate-pulse">
                  3
                </span>
              </div>

              {/* DROPDOWN */}
              <Dropdown onOpenChange={(open) => setMenuOpen(open)}>
                <Button
                  aria-label="Menu"
                  variant="ghost"
                  className="text-xl text-white cursor-pointer transition-all duration-300 
                  hover:text-orange-500 hover:scale-110 active:scale-95"
                >
                  <i
                    className={`fi fi-rr-user-gear transition-all duration-300 
                    ${menuOpen ? "rotate-180 text-orange-500 scale-110" : ""}`}
                  />
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

              {/* HAMBURGUESA */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden text-xl"
              >
                <i className="fi fi-rr-menu-burger"></i>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE MENU */}
      {open && user && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-[#252B2B] border-t border-white/10 flex flex-col px-6 py-4 gap-4 z-40">

          {user.role === "candidato" && (
            <>
              <NavItem text="Inicio" path="/" isActive={isActive} navigate={navigate} />
              <NavItem text="Oportunidades" path="/dashboard" isActive={isActive} navigate={navigate} />
              <NavItem text="Mis proyectos" path="/candidato" isActive={isActive} navigate={navigate} />
              <NavItem text="Mi portafolio" path="/portafolio" isActive={isActive} navigate={navigate} />
            </>
          )}

          {user.role === "empresa" && (
            <>
              <NavItem text="Inicio" path="/" isActive={isActive} navigate={navigate} />
              <NavItem text="Mis proyectos" path="/empresa" isActive={isActive} navigate={navigate} />
              <NavItem text="Trabajos" path="/dashboard" isActive={isActive} navigate={navigate} />
              <NavItem text="Talentos" path="/talento" isActive={isActive} navigate={navigate} />
            </>
          )}
        </div>
      )}
    </>
  );
}