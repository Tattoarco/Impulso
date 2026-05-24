import { useMemo, useState, useEffect } from "react";

export default function ImpulsoMascot({
  user,
  jobs = [],
  search = "",
  appliedIds = [],
}) {
  const [open, setOpen] = useState(true);
  const [message, setMessage] = useState("");

  const mood = useMemo(() => {
    if (jobs.length === 0) return "sad";
    if (search) return "search";
    if (appliedIds.length > 0) return "happy";
    return "idle";
  }, [jobs, search, appliedIds]);

  useEffect(() => {
    if (jobs.length === 0) {
      setMessage("No encontré proyectos todavía, pero pronto aparecerán nuevos ✨");
      return;
    }

    if (search) {
      setMessage(`Buscando "${search}" 🔎`);
      return;
    }

    if (appliedIds.length > 0) {
      setMessage("¡Vas muy bien! Ya empezaste a postularte 🚀");
      return;
    }

    setMessage(`Encontré ${jobs.length} oportunidades para ti ✨`);
  }, [jobs, search, appliedIds]);

  const moods = {
    idle: "/mascota/idle.png",
    happy: "/mascota/happy.png",
    sad: "/mascota/sad.png",
    search: "/mascota/search.png",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Burbuja */}
        {open && (
          <div className="absolute bottom-28 right-2 w-64 bg-white border border-orange-100 rounded-2xl shadow-2xl p-4 animate-[fadeIn_0.25s_ease]">
            <p className="text-sm font-semibold text-gray-800 mb-1">
              Hola {user?.name?.split(" ")[0]} ✨
            </p>

            <p className="text-xs leading-relaxed text-gray-500">
              {message}
            </p>

            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 bg-transparent border-none cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Mascota */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="group w-24 h-24 rounded-full bg-white shadow-[0_10px_40px_rgba(242,100,25,0.25)] border-4 border-white flex items-center justify-center hover:scale-105 transition-all cursor-pointer overflow-hidden"
        >
          <img
            src={moods[mood]}
            alt="Mascota"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 rounded-full bg-[#F26419]/0 group-hover:bg-[#F26419]/5 transition-all" />
        </button>

        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-[#F26419]/20 blur-2xl -z-10 animate-pulse" />
      </div>
    </div>
  );
}