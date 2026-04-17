import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";

import { Button, Dropdown, Label } from "@heroui/react";

const Item = ({ text, path, isActive, navigate }) => (
  <button
    onClick={() => navigate(path)}
    className={`px-5 py-2 rounded-full text-sm transition-all
      ${isActive(path) ? "bg-orange-500 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
  >
    {text}
  </button>
);

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleAction = (key) => {
    if (key === "mi-perfil") {
      navigate("/candidato/perfil");
    }

    if (key === "cerrar-sesion") {
      logout();
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed z-50 w-full h-16 flex items-center justify-between px-6 bg-[#252B2B] text-white border-b border-white/10">
      {/* LOGO */}
      <div onClick={() => navigate("/")} className="font-bold text-lg cursor-pointer">
        Impulso
      </div>

      {/* MENU CENTRAL */}
      {user && (
        <div className="flex items-center gap-4">
          {/* CANDIDATO */}
          {user.role === "candidato" && (
            <>
              <Item text="Inicio" path="/" isActive={isActive} navigate={navigate} />
              <Item text="Oportunidades" path="/dashboard" isActive={isActive} navigate={navigate} />
              <Item text="Empresas" path="/" isActive={isActive} navigate={navigate} />
            </>
          )}

          {/* EMPRESA */}
          {user.role === "empresa" && (
            <>
              <Item text="Inicio" path="/" isActive={isActive} navigate={navigate} />
              <Item text="Proyectos" path="/empresa" isActive={isActive} navigate={navigate} />
              <Item text="Perfiles" path="/empresa/perfiles" isActive={isActive} navigate={navigate} />
              <Item text="Crear" path="/empresa/crear-proyecto" isActive={isActive} navigate={navigate} />
            </>
          )}
        </div>
      )}

      {/* DERECHA */}
      <div className="flex items-center gap-3">
        {!user ? (
          <>
            <button onClick={() => navigate("/login")} className="text-sm text-gray-300 hover:text-white">
              Iniciar sesión
            </button>

            <button onClick={() => navigate("/registro")} className="bg-orange-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600">
              Registrarse
            </button>
          </>
        ) : (
          <>
            <Dropdown>
              <Button aria-label="Menu" variant="ghost" className="text-2xl text-white hover:text-orange-500 ">
                <i className="fi fi-rr-user-gear "></i>
              </Button>

              <Dropdown.Popover>
                <Dropdown.Menu onAction={handleAction}>
                  {/* PERFIL */}
                  <Dropdown.Item id="mi-perfil" textValue="Mi perfil">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${location.pathname === "/candidato/perfil" ? "bg-orange-500" : "bg-gray-500"}`}>
                        <i className="fi fi-rr-user text-white text-sm" />
                      </div>
                      <Label>Mi perfil</Label>
                    </div>
                  </Dropdown.Item>

                  <Dropdown.Item id="portafolio" textValue="Portafolio">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${location.pathname === "/candidato/portafolio" ? "bg-orange-500" : "bg-gray-500"}`}>
                        <i class="fi fi-rr-briefcase-blank text-white text-sm"></i>
                      </div>
                      <Label>Portafolio</Label>
                    </div>
                  </Dropdown.Item>

                  <Dropdown.Item id="configuracion" textValue="Configuración">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${location.pathname === "/candidato/configuracion" ? "bg-orange-500" : "bg-gray-500"}`}>
                        <i class="fi fi-rr-settings text-white text-sm"></i>
                      </div>
                      <Label>Configuración</Label>
                    </div>
                  </Dropdown.Item>

                  {/* LOGOUT */}
                  <Dropdown.Item id="cerrar-sesion" textValue="Cerrar sesión" variant="danger">
                    <div className="flex items-center gap-2 text-red-400">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${location.pathname === "/logout" ? "bg-red-500" : "bg-red-200"}`}>
                      <i class="fi fi-rr-door-closed"></i>
                      </div>
                      <Label> Cerrar sesión</Label>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </>
        )}
      </div>
    </nav>
  );
}
