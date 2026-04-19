    import { useNavigate, useLocation } from "react-router-dom";
    import { useAuth } from "../Context/Authcontext";
    import { Button, Dropdown, Label } from "@heroui/react";

    const NavItem = ({ text, path, isActive, navigate }) => (
      <button
        onClick={() => navigate(path)}
        className={`px-5 py-2 rounded-full text-sm transition-all cursor-pointer border-none
          ${isActive(path) ? "bg-orange-500 text-white shadow-md" : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"}`}
      >
        {text}
      </button>
    );

    export default function Navbar() {
      const navigate          = useNavigate();
      const location          = useLocation();
      const { user, logout }  = useAuth();
      const isActive          = (path) => location.pathname === path;

      const handleAction = (key) => {
        if (key === "mi-perfil")     navigate("/candidato/perfil");
        if (key === "portafolio")    navigate("/portafolio");
        if (key === "cerrar-sesion") { logout(); navigate("/login"); }
      };

      return (
        <nav className="fixed z-50 w-full h-16 flex items-center justify-between px-6 bg-[#252B2B] text-white border-b border-white/10">

          {/* LOGO */}
          <div onClick={() => navigate("/")} className="font-bold text-lg cursor-pointer flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <i className="fi fi-sr-bolt text-white text-sm" />
            </div>
            Impulso
          </div>

          {/* MENU CENTRAL */}
          {user && (
            <div className="flex items-center gap-2">
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
                  <NavItem text="Inicio"       path="/"        isActive={isActive} navigate={navigate} />
                  <NavItem text="Mis proyectos" path="/empresa" isActive={isActive} navigate={navigate} />
                  <NavItem text="Trabajos"    path="/dashboard" isActive={isActive} navigate={navigate} />
                  {/* Talento Hub — directorio de candidatos para empresas */}
                  <NavItem text="Talentos"  path="/talento" isActive={isActive} navigate={navigate} />
                </>
              )}
            </div>
          )}

          {/* DERECHA */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <button onClick={() => navigate("/login")} className="text-sm text-gray-300 hover:text-white cursor-pointer bg-none border-none">
                  Iniciar sesión
                </button>
                <button onClick={() => navigate("/registro")} className="bg-orange-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 cursor-pointer border-none">
                  Registrarse
                </button>
              </>
            ) : (
              <Dropdown>
                <Button aria-label="Menu" variant="ghost" className="text-2xl text-white hover:text-orange-500 cursor-pointer">
                  <i className="fi fi-rr-user-gear" />
                </Button>
                <Dropdown.Popover>
                  <Dropdown.Menu onAction={handleAction}>

                    {/* Info del usuario */}
                    <Dropdown.Item id="info" textValue="info" isReadOnly>
                      <div className="px-1 py-1 border-b border-gray-100 mb-1">
                        <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                      </div>
                    </Dropdown.Item>

                    {/* Mi perfil */}
                    <Dropdown.Item id="mi-perfil" textValue="Mi perfil">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                          <i className="fi fi-rr-user text-white text-sm" />
                        </div>
                        <Label>Mi perfil</Label>
                      </div>
                    </Dropdown.Item>

                    {/* Portafolio — solo candidatos */}
                    {user.role === "candidato" && (
                      <Dropdown.Item id="portafolio" textValue="Mi portafolio">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                            <i className="fi fi-rr-briefcase text-white text-sm" />
                          </div>
                          <Label>Mi portafolio</Label>
                        </div>
                      </Dropdown.Item>
                    )}

                    {/* Cerrar sesión */}
                    <Dropdown.Item id="cerrar-sesion" textValue="Cerrar sesión" variant="danger">
                      <div className="flex items-center gap-2 text-red-500">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <i className="fi fi-rr-sign-out text-red-500 text-sm" />
                        </div>
                        <Label>Cerrar sesión</Label>
                      </div>
                    </Dropdown.Item>

                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            )}
          </div>
        </nav>
      );
    }