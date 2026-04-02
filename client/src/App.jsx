import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./Routes/PrivateRoutes";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Candidato from "./Pages/Candidato";
import Empresa from "./Pages/Empresa";
import CrearProyecto from "./Pages/CrearProyecto";
import Timeline from "./Pages/Timeline";
import ProyectoDetalle from "./Pages/ProyectoDetalle";
import Postulantes from "./Pages/Postulantes";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Rutas privadas */}
      <Route
        path="/candidato"
        element={
          <PrivateRoute role="candidato">
            <Candidato />
          </PrivateRoute>
        }
      />
      <Route
        path="/empresa"
        element={
          <PrivateRoute role="empresa">
            <Empresa />
          </PrivateRoute>
        }
      />

      {/* Rutas por rol */}
      <Route path="/empresa/crear-proyecto" element={<CrearProyecto />} />

      <Route path="/candidato/timeline/:applicationId" element={<Timeline />} />
      <Route path="/proyecto/:id" element={<ProyectoDetalle />} />
      <Route path="/empresa/proyecto/:jobId/postulantes" element={<Postulantes />} />

    </Routes>
  );
}

export default App;
