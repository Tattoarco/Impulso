import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";


export default function Dashboard() {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("/api/jobs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setJobs(data.jobs || []));
  }, [token]);

  return (
    <div>
      <h1>Todos los proyectos</h1>

      {jobs.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>

          {user.role === "candidato" && (
            <button>Postular</button>
          )}

          {user.role === "empresa" && (
            <span>Solo visualización</span>
          )}
        </div>
      ))}
    </div>
  );
}