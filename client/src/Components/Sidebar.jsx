import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";
import { Button } from "@heroui/react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const roleLabel = { empresa: "Empresa", candidato: "Candidato" };

  const misProyectosRoute = user?.role === "empresa" ? "/empresa" : "/candidato";

  return (
    <div className={`fixed z-30 left-5 top-18 h-[calc(100vh-5rem)] transition-all duration-300  ${open ? "w-72" : "w-20"}`}>
      <div className="h-full bg-[#252B2B] text-white rounded-2xl shadow-xl flex flex-col justify-between p-4">
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
          <div className="space-y-1">
            <Item icon="fi fi-rr-home" text="Trabajos" open={open} active={location.pathname === "/dashboard"} onClick={() => navigate("/dashboard")} />

            <Item icon="fi fi-rr-briefcase" text="Mis proyectos" open={open} active={location.pathname.startsWith(misProyectosRoute)} onClick={() => navigate(misProyectosRoute)} />

            <Item icon="fi fi-rr-calendar" text="Calendario" open={open} active={location.pathname === "/calendario"} />

            <Item icon="fi fi-rr-envelope" text="Mensajes" open={open} active={location.pathname === "/mensajes"} />

            <Item icon="fi fi-rr-bell" text="Notificaciones" open={open} active={location.pathname === "/notificaciones"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Item({ icon, text, open, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200
            ${active ? "bg-orange-500 text-white shadow-md" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}
    >
      <i className={`${icon} text-lg`} />
      {open && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}

function MiniItem({ text }) {
  return <div className="text-sm text-gray-600 hover:text-black cursor-pointer">{text}</div>;
}
