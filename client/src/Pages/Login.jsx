import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Checkbox, Label } from "@heroui/react";
import { useAuth } from "../Context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas.");
        return;
      }

      // ← CAMBIO: reemplaza los dos localStorage.setItem por una sola línea
      login(data.user, data.token);

      // Redirección por rol
      if (data.user.role === "candidato") {
        navigate("/candidato");
      } else if (data.user.role === "empresa") {
        navigate("/empresa");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT */}
      <div className="hidden md:flex flex-1 bg-orange-500 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* LOGO */}
        <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <i className="fi fi-sr-bolt text-white" />
          </div>
          <span className="font-bold text-xl">Impulso</span>
        </div>

        {/* HERO */}
        <div className="space-y-6 max-w-md">
          <span className="text-xs bg-white/20 px-4 py-1 rounded-full uppercase">
            Plataforma profesional
          </span>
          <h1 className="text-4xl font-bold leading-tight">
            Tu primera <br />
            experiencia <br />
            <span className="text-white/70">empieza aquí</span>
          </h1>
          <p className="text-white/70 text-sm">
            Conectamos jóvenes talentosos con microproyectos reales.
          </p>
        </div>

        {/* STATS */}
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-xl font-bold">+500</p>
            <p className="text-white/60">Jóvenes</p>
          </div>
          <div>
            <p className="text-xl font-bold">+120</p>
            <p className="text-white/60">Proyectos</p>
          </div>
          <div>
            <p className="text-xl font-bold">87%</p>
            <p className="text-white/60">Satisfacción</p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full md:w-120 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-bold">Bienvenido</h2>
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{" "}
              <span
                onClick={() => navigate("/registro")}
                className="text-orange-500 cursor-pointer font-semibold"
              >
                Regístrate
              </span>
            </p>
          </div>

          {/* OAUTH */}
          <div className="flex gap-3">
            <Button variant="bordered" className="flex-1">
              <i className="fi fi-brands-google" /> Google
            </Button>
            <Button variant="bordered" className="flex-1">
              <i className="fi fi-brands-linkedin" /> LinkedIn
            </Button>
          </div>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            o continúa con tu correo
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <i className="fi fi-rr-exclamation text-red-400 text-sm" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex w-80 flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label>Email</Label>
                <Input
                  autoComplete="off"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Password</Label>
                <Input
                  autoComplete="off"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <Checkbox>
                <Label>Recordar</Label>
              </Checkbox>
              <span className="text-orange-500 cursor-pointer">
                ¿Olvidaste tu contraseña?
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-semibold disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <i className="fi fi-rr-spinner animate-spin text-sm" />
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}