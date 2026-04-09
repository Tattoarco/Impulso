import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { useAuth } from "../Context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);

  const roleLabel = {
    empresa: "Empresa",
    candidato: "Candidato",
  };

  const configByRole = {
    empresa: { label: "Crear proyecto", route: "/empresa/crear-proyecto" },
    candidato: { label: "Explorar proyectos", route: "/candidato/proyectos" },
  };

  const current = configByRole[user?.role] || { label: "Acción", route: "/" };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`fixed top-6 left-6 h-[92vh] z-40 transition-all duration-300 ${open ? "w-72" : "w-20"}`}>
      <div className="h-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl flex flex-col justify-between p-4">
        {/* HEADER */}
        <div>
          <div className="flex items-center justify-between mb-6">
            {open && user && (
              <div className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=F26419&color=fff`} className="w-10 h-10 rounded-full" alt={user.name} />
                <div>
                  <p className="text-xs text-gray-400">{roleLabel[user.role] || "Usuario"}</p>
                  <p className="font-semibold text-sm">{user.name}</p>
                </div>
              </div>
            )}
            <Button variant="ghost" onClick={() => setOpen(!open)} className="text-orange-500 text-xl cursor-pointer">
              {open ? "←" : "→"}
            </Button>
          </div>

          {/* MENU */}
          <div className="space-y-2">
            <Item icon="fi fi-rr-home" text="Dashboard" open={open} onClick={() => navigate(user?.role === "empresa" ? "/empresa" : "/candidato")} />
            <Item icon="fi fi-rr-briefcase" text="Mis proyectos" active open={open} onClick={() => navigate(user?.role === "empresa" ? "/empresa" : "/candidato")} />
            <Item icon="fi fi-rr-calendar" text="Calendario" open={open} />
            <Item icon="fi fi-rr-envelope" text="Mensajes" open={open} />
            <Item icon="fi fi-rr-bell" text="Notificaciones" open={open} />
          </div>

          {/* SERVICES */}
          {open && (
            <div className="mt-6">
              <p className="text-xs text-gray-400 mb-3">Servicios</p>
              <div className="bg-gray-100 rounded-2xl p-3 space-y-2">
                <MiniItem text="Slack" />
                <MiniItem text="Intercom" />
                <MiniItem text="Plugins" />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="space-y-2">
          {/* Cerrar sesión */}
          {open ? (
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer border-none bg-transparent">
              <i className="fi fi-rr-sign-out text-base" />
              Cerrar sesión
            </button>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center py-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer border-none bg-transparent">
              <i className="fi fi-rr-sign-out text-base" />
            </button>
          )}

          {/* Acción principal */}
          {open ? (
            <Button onClick={() => navigate(current.route)} className="w-full bg-orange-500 text-white rounded-2xl py-3 flex items-center justify-center gap-2 shadow-md">
              <span className="text-lg">+</span>
              {current.label}
            </Button>
          ) : (
            <Button onClick={() => navigate(current.route)} className="w-full bg-orange-500 text-white rounded-xl py-3 flex justify-center">
              +
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Item({ icon, text, open, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition
        ${active ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
    >
      <i className={`${icon} text-lg`} />
      {open && <span className="text-sm">{text}</span>}
    </div>
  );
}

function MiniItem({ text }) {
  return <div className="text-sm text-gray-600 hover:text-black cursor-pointer">{text}</div>;
}
