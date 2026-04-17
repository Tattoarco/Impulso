import { useState, useEffect } from "react";
import { useAuth } from "../Context/Authcontext";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/footer";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL;

export default function Portfolio() {
  const { user, token } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [jobs, setJobs] = useState([]);

  const [theme, setTheme] = useState("light");

  const [portfolio, setPortfolio] = useState({
    name: user?.name || "",
    role: "Diseñador / Desarrollador",
    description: "",
    skills: [],
    cover: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1400",
    avatar: `https://ui-avatars.com/api/?name=${user?.name}`,
    projects: [],
  });

  // 🔥 FETCH DATA
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/api/portfolio/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.portfolio) {
          setPortfolio({
            ...data.portfolio,
            projects:
              typeof data.portfolio.projects === "string"
                ? JSON.parse(data.portfolio.projects)
                : data.portfolio.projects || [],
            skills:
              typeof data.portfolio.skills === "string"
                ? JSON.parse(data.portfolio.skills)
                : data.portfolio.skills || [],
          });
        }
      });

    // 🔥 TRAER JOBS DEL CANDIDATO
    fetch(`${API}/api/applications/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setJobs(data.applications || []));
  }, [token]);

  // 🤖 IA (skills + bio)
  const generateAI = async (type) => {
    const prompt =
      type === "skills"
        ? `Sugiere habilidades profesionales basadas en este perfil: ${portfolio.description}`
        : `Mejora esta descripción profesional: ${portfolio.description}`;

    const res = await fetch(`${API}/api/ia/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";

    if (type === "skills") {
      setPortfolio(prev => ({
        ...prev,
        skills: text.split(","),
      }));
    } else {
      setPortfolio(prev => ({
        ...prev,
        description: text,
      }));
    }
  };

  const savePortfolio = async () => {
    await fetch(`${API}/api/portfolio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(portfolio),
    });
  };

  const handleSave = async () => {
    await savePortfolio();
    setEditMode(false);
  };

  // 🎨 THEMES
  const themeStyles = {
    light: "bg-[#F4F6F8]",
    dark: "bg-[#1E1E1E] text-white",
    creative: "bg-gradient-to-br from-[#6651DD] to-orange-400 text-white",
  };

  return (
    <>
      <Navbar />

      <div className={`flex min-h-screen ${themeStyles[theme]}`}>
        <Sidebar />

        <main className="flex-1 ml-24 p-6 space-y-6">

          {/* 🔥 COVER */}
          <div className="relative h-72 rounded-3xl overflow-hidden">
            <img src={portfolio.cover} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <img src={portfolio.avatar} className="w-16 h-16 rounded-2xl" />
              <div>
                <h2 className="font-bold">{portfolio.name}</h2>
                <p className="text-sm opacity-70">{portfolio.role}</p>
              </div>
            </div>

            {user?.role === "candidato" && (
              <button
                onClick={() => (editMode ? handleSave() : setEditMode(true))}
                className="bg-[#6651DD] text-white px-4 py-2 rounded-xl"
              >
                {editMode ? "Guardar" : "Editar"}
              </button>
            )}
          </div>

          {/* 🧠 IA PANEL */}
          <div className="bg-white p-5 rounded-3xl shadow flex gap-4">
            <button onClick={() => generateAI("bio")} className="text-sm">
              ✨ Mejorar bio
            </button>
            <button onClick={() => generateAI("skills")} className="text-sm">
              ⚡ Generar skills
            </button>
          </div>

          {/* SOBRE MI */}
          <div className="bg-white p-6 rounded-3xl">
            {editMode ? (
              <textarea
                value={portfolio.description}
                onChange={(e) =>
                  setPortfolio({ ...portfolio, description: e.target.value })
                }
                className="w-full border p-3 rounded-xl"
              />
            ) : (
              <p>{portfolio.description}</p>
            )}
          </div>

          {/* SKILLS */}
          <div className="bg-white p-6 rounded-3xl">
            <h3 className="font-bold mb-3">Skills</h3>

            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-[#6651DD]/10 rounded-full text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* 💼 EXPERIENCIA (JOBS REALES) */}
          <div>
            <h3 className="font-bold mb-4">Experiencia real</h3>

            <div className="grid md:grid-cols-2 gap-4">
              {jobs.map((j, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow">
                  <h4 className="font-semibold">{j.job_title}</h4>
                  <p className="text-xs text-gray-500">{j.company_name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 🚀 PROYECTOS EXTERNOS */}
          <div>
            <h3 className="font-bold mb-4">Proyectos personales</h3>

            <div className="grid md:grid-cols-3 gap-4">
              {portfolio.projects.map((p, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-white rounded-2xl overflow-hidden">
                  
                  <img src={p.image} className="h-40 w-full object-cover" />

                  <div className="p-4">
                    <h4>{p.title}</h4>
                    <p className="text-xs">{p.description}</p>

                    {/* 📊 MÉTRICAS */}
                    <div className="flex gap-3 mt-3 text-xs">
                      <span>👁 {p.views || 0}</span>
                      <span>⭐ {p.likes || 0}</span>
                    </div>
                  </div>

                </motion.div>
              ))}

              {editMode && (
                <button
                  onClick={() =>
                    setPortfolio({
                      ...portfolio,
                      projects: [
                        ...portfolio.projects,
                        { title: "Nuevo", image: "https://picsum.photos/400" },
                      ],
                    })
                  }
                  className="border-dashed border-2 rounded-xl h-40"
                >
                  + Agregar
                </button>
              )}
            </div>
          </div>

          {/* 🎨 THEMES */}
          <div className="bg-white p-5 rounded-3xl">
            <h3 className="mb-2 font-semibold">Tema visual</h3>

            <div className="flex gap-3">
              {["light", "dark", "creative"].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </>
  );
}