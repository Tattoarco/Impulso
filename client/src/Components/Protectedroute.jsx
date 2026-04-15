import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/Authcontext";

/* ── Spinner de carga mientras verifica sesión ── */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#F26419] rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Verificando sesión...</p>
      </div>
    </div>
  );
}

/* ── Ruta que requiere login ── */
export function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si se especifica un rol requerido y no coincide
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === "empresa" ? "/empresa" : "/candidato"} replace />;
  }

  return children;
}

/* ── Ruta pública — redirige si ya está autenticado ── */
export function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (isAuthenticated) {
    return <Navigate to={user?.role === "empresa" ? "/empresa" : "/candidato"} replace />;
  }

  return children;
}