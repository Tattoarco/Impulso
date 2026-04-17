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
  const [loading, setLoading] = useState(true);

  const [portfolio, setPortfolio] = useState({
    name: user?.name || "",
    role: "Diseñador / Desarrollador",
    description: "",
    cover:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1400",
    avatar: `https://ui-avatars.com/api/?name=${user?.name}`,

    // 🔥 NUEVO
    skills: [],
    links: [],
    customProjects: [],
  });

  const [jobs, setJobs] = useState([]); // experiencia real

  // 🔥 FETCH PORTFOLIO + JOBS
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [portfolioRes, jobsRes] = await Promise.all([
          fetch(`${API}/api/portfolio/me/jobs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/applications/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const portfolioData = await portfolioRes.json();
        const jobsData = await jobsRes.json();

        if (portfolioData.portfolio) {
          setPortfolio({
            ...portfolioData.portfolio,
            customProjects:
              typeof portfolioData.portfolio.customprojects === "string"
                ? JSON.parse(portfolioData.portfolio.customprojects)
                : portfolioData.portfolio.customprojects || [],
            skills: portfolioData.portfolio.skills || [],
            links: portfolioData.portfolio.links || [],
          });
        }

        setJobs(jobsData.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAll();
  }, [token]);

  // 💾 SAVE
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

  if (loading) return <div className="p-10">Cargando...</div>;

  return (
    <>
      <Navbar />

      <div className="flex min-h-screen bg-[#F4F6F8]">
        <Sidebar />

        <main className="flex-1 ml-24">
          {/* COVER */}
          <div className="relative h-72 overflow-hidden rounded-b-3xl">
            <img src={portfolio.cover} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute bottom-6 left-8 text-white">
              <h1 className="text-2xl font-bold">{portfolio.name}</h1>
              <p className="text-sm">{portfolio.role}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border">
              <div className="flex gap-4 items-center">
                <img src={portfolio.avatar} className="w-16 h-16 rounded-xl" />
                <div>
                  <h2 className="font-bold">{portfolio.name}</h2>
                  <p className="text-sm text-gray-500">{portfolio.role}</p>
                </div>
              </div>

              <button
                onClick={() => (editMode ? handleSave() : setEditMode(true))}
                className="bg-[#6651DD] text-white px-4 py-2 rounded-xl"
              >
                {editMode ? "Guardar" : "Editar"}
              </button>
            </div>

            {/* SOBRE MI */}
            <div className="bg-white p-6 rounded-3xl border">
              <h3 className="font-semibold mb-3">Sobre mí</h3>

              {editMode ? (
                <textarea
                  value={portfolio.description}
                  onChange={(e) =>
                    setPortfolio({ ...portfolio, description: e.target.value })
                  }
                  className="w-full border p-3 rounded-xl"
                />
              ) : (
                <p className="text-gray-600">{portfolio.description}</p>
              )}
            </div>

            {/* SKILLS */}
            <div className="bg-white p-6 rounded-3xl border">
              <h3 className="font-semibold mb-3">Skills</h3>

              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((s, i) => (
                  <span key={i} className="bg-[#6651DD]/10 px-3 py-1 rounded-full text-sm">
                    {s}
                  </span>
                ))}
              </div>

              {editMode && (
                <button
                  onClick={() =>
                    setPortfolio({
                      ...portfolio,
                      skills: [...portfolio.skills, "Nueva skill"],
                    })
                  }
                  className="mt-3 text-sm text-[#6651DD]"
                >
                  + Agregar skill
                </button>
              )}
            </div>

            {/* EXPERIENCIA REAL */}
            <div className="bg-white p-6 rounded-3xl border">
              <h3 className="font-semibold mb-4">Experiencia en la plataforma</h3>

              <div className="grid md:grid-cols-2 gap-4">
                {jobs.map((j, i) => (
                  <div key={i} className="border p-4 rounded-xl">
                    <h4 className="font-semibold">{j.job_title}</h4>
                    <p className="text-xs text-gray-500">{j.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PROYECTOS EXTERNOS */}
            <div className="bg-white p-6 rounded-3xl border">
              <h3 className="font-semibold mb-4">Proyectos personales</h3>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {portfolio.customProjects.map((p, i) => (
                  <div key={i} className="border rounded-xl p-4">
                    {editMode ? (
                      <>
                        <input
                          value={p.title}
                          onChange={(e) => {
                            const updated = [...portfolio.customProjects];
                            updated[i].title = e.target.value;
                            setPortfolio({ ...portfolio, customProjects: updated });
                          }}
                          className="w-full mb-2 border p-2"
                        />

                        <textarea
                          value={p.description}
                          onChange={(e) => {
                            const updated = [...portfolio.customProjects];
                            updated[i].description = e.target.value;
                            setPortfolio({ ...portfolio, customProjects: updated });
                          }}
                          className="w-full border p-2"
                        />
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold">{p.title}</h4>
                        <p className="text-sm text-gray-500">{p.description}</p>
                      </>
                    )}
                  </div>
                ))}

                {editMode && (
                  <button
                    onClick={() =>
                      setPortfolio({
                        ...portfolio,
                        customProjects: [
                          ...portfolio.customProjects,
                          { title: "Nuevo proyecto", description: "" },
                        ],
                      })
                    }
                    className="border-dashed border-2 rounded-xl h-32"
                  >
                    + Agregar
                  </button>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}