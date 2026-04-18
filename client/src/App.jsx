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
import EditarPerfil from "./Pages/Editarperfil";
import Dashboard from "./Pages/Dashboard";
import MisPostulaciones from "./Pages/Mispostulaciones";
import Portfolio from "./Pages/Portfolio";

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
      <Route
        path="/candidato/perfil"
        element={
          <PrivateRoute role="candidato">
            <EditarPerfil />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/candidato/postulaciones"
        element={
          <PrivateRoute role="candidato">
            <MisPostulaciones />
          </PrivateRoute>
        }
      />


      // Mi portafolio (candidato)
      <Route
        path="/portafolio"
        element={
          <PrivateRoute role="candidato">
            <Portfolio />
          </PrivateRoute>
        }
      />
      // Portafolio público (cualquier usuario autenticado puede verlo)
      <Route
        path="/portafolio/:id"
        element={
          <PrivateRoute>
            <Portfolio />
          </PrivateRoute>
        }
      />
      {/* Rutas por rol */}
      <Route
        path="/empresa/crear-proyecto"
        element={
          <PrivateRoute role="empresa">
            <CrearProyecto />
          </PrivateRoute>
        }
      />{" "}
      <Route path="/candidato/timeline/:applicationId" element={<Timeline />} />
      <Route path="/proyecto/:id" element={<ProyectoDetalle />} />
      <Route path="/empresa/proyecto/:jobId/postulantes" element={<Postulantes />} />
    </Routes>
  );
}

export default App;
