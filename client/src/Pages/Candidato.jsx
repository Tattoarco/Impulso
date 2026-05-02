import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { useAuth } from "../Context/Authcontext";

import Footer from "../Components/footer";
import Navbar from "../Components/Navbar";

const CARD_COLORS = ["from-orange-400 to-rose-400", "from-violet-400 to-purple-500", "from-teal-400 to-cyan-500", "from-blue-400 to-indigo-500"];

function ProjectCard({ job, navigate }) {
  const initials = job.title?.slice(0, 2).toUpperCase() || "PR";
  const color = CARD_COLORS[job.title?.charCodeAt(0) % CARD_COLORS.length] || CARD_COLORS[0];

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-[#F26419]/30 hover:shadow-[0_8px_30px_rgba(242,100,25,0.1)] transition-all overflow-hidden">
      <div className={`h-1 bg-linear-to-r ${color}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center text-white font-bold`}>{initials}</div>
            <div>
              <h3 className="text-sm font-semibold group-hover:text-[#F26419]">{job.title}</h3>
              <p className="text-xs text-gray-400">{job.company_name || "Empresa"}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{job.summary}</p>
        <div className="flex gap-3 text-xs text-gray-400">
          {job.duration && (
            <span className="flex items-center gap-1">
              <i className="fi fi-rr-clock text-[11px]" /> {job.duration}
            </span>
          )}
          {job.profile_area && (
            <span className="flex items-center gap-1">
              <i className="fi fi-rr-tag text-[11px]" /> {job.profile_area}
            </span>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/proyecto/${job.id}`);
            }}
            className="bg-orange-500 text-white cursor-pointer hover:bg-orange-600 hover:shadow-md hover:-translate-y-0.5 transition duration-200"
          >
            Postular
          </Button>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl animate-pulse">
      <div className="h-4 bg-gray-200 rounded mb-3" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
    </div>
  );
}

export default function Candidato() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchJobs();
  }, [token, API]);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <div className="min-h-screen flex bg-gray-50">
        <div className="relative z-50">
          <Navbar />
        </div>
        {/* CONTENIDO */}
        <div className="flex flex-1">
          <main className="flex-1 p-8 pt-24">
            {/* HEADER */}
            <div className="mb-8">
              <p className="text-sm text-gray-400">{saludo} 👋</p>
              <h1 className="text-2xl font-bold">{user?.name || "Candidato"}</h1>
              <p className="text-sm text-gray-400">Explora proyectos y empieza a ganar experiencia</p>
            </div>

            {/* LISTA */}
            <div className="bg-white rounded-2xl p-6 border">
              <h2 className="font-bold mb-4">Proyectos disponibles</h2>

              {loading && (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} />
                  ))}
                </div>
              )}

              {!loading && jobs.length === 0 && <p className="text-gray-400 text-sm">No hay proyectos disponibles aún</p>}

              {!loading && jobs.length > 0 && (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <ProjectCard key={job.id} job={job} navigate={navigate} />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
