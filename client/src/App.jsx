import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./Routes/PrivateRoutes";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Candidato from "./Pages/Candidato";
import Empresa from "./Pages/Empresa";
import CrearProyecto from "./Pages/CrearPoryecto";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/crear-proyecto" element={<CrearProyecto />} />

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

      
    </Routes>
  );
}

export default App;
