import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Checkbox, Label } from "@heroui/react";
import { motion } from "framer-motion";
import { useAuth } from "../Context/Authcontext";

import logo from "../../Public/Logo.jpeg";
import mascota from "../../Public/MascotaImagen.PNG";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        // const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas.");
        return;
      }

      login(data.user, data.token);

      if (data.user.role === "empresa") {
        navigate("/empresa");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f7e6d8] overflow-hidden relative">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-[#6651DD]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-orange-400/20 blur-[120px] rounded-full" />
      </div>

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="w-full flex flex-col justify-between p-14 relative z-10">
          {/* TOP */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer w-fit"
          >
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg bg-white">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="font-bold text-2xl text-[#252B2B]">
                Impulso
              </h1>
              <p className="text-xs text-[#4D4F4E]">
                Experiencia que transforma
              </p>
            </div>
          </div>

          {/* CENTER */}
          <div className="max-w-xl relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#6651DD]/10 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-sm font-medium text-[#6651DD]">
                  Plataforma profesional
                </span>
              </div>

              <h1 className="text-6xl font-black leading-[1.05] text-[#252B2B]">
                Tu primera
                <br />
                experiencia
                <br />
                <span className="text-[#6651DD] relative">
                  empieza aquí
                </span>
              </h1>

              <p className="text-lg text-[#4D4F4E] leading-relaxed max-w-md">
                Conectamos jóvenes talentosos con empresas reales
                mediante microproyectos que construyen experiencia.
              </p>

              <div className="flex gap-8 pt-2">
                <div>
                  <p className="text-3xl font-black text-[#252B2B]">
                    +500
                  </p>
                  <p className="text-sm text-[#4D4F4E]">
                    Jóvenes
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-black text-[#252B2B]">
                    +120
                  </p>
                  <p className="text-sm text-[#4D4F4E]">
                    Proyectos
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-black text-[#252B2B]">
                    87%
                  </p>
                  <p className="text-sm text-[#4D4F4E]">
                    Match exitoso
                  </p>
                </div>
              </div>
            </motion.div>

            {/* MASCOTA */}
            <motion.img
              src={mascota}
              alt="Mascota"
              animate={{
                y: [0, -15, 0],
                rotate: [0, -2, 2, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
              }}
              className="absolute -right-28 top-10 w-72 drop-shadow-[0_25px_60px_rgba(0,0,0,0.18)]"
            />
          </div>

          {/* BOTTOM */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-4 border-white bg-gradient-to-br from-[#6651DD] to-orange-400"
                />
              ))}
            </div>

            <p className="text-sm text-[#4D4F4E]">
              Más de{" "}
              <span className="font-bold text-[#252B2B]">
                500 jóvenes
              </span>{" "}
              construyendo experiencia real.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-[520px] bg-white flex items-center justify-center p-8 relative border-l border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* MOBILE LOGO */}
          <div
            onClick={() => navigate("/")}
            className="lg:hidden flex items-center gap-3 cursor-pointer"
          >
            <img
              src={logo}
              alt="Logo"
              className="w-11 h-11 rounded-xl"
            />

            <div>
              <h1 className="font-bold text-xl text-[#252B2B]">
                Impulso
              </h1>
              <p className="text-xs text-gray-500">
                Experiencia real
              </p>
            </div>
          </div>

          {/* TITLE */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-[#252B2B]">
              Bienvenido de nuevo
            </h2>

            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{" "}
              <span
                onClick={() => navigate("/registro")}
                className="text-orange-500 font-semibold cursor-pointer hover:underline"
              >
                Regístrate
              </span>
            </p>
          </div>

          {/* SOCIALS */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="bordered"
              className="h-12 border-gray-200"
            >
              <i className="fi fi-brands-google text-sm" />
              Google
            </Button>

            <Button
              variant="bordered"
              className="h-12 border-gray-200"
            >
              <i className="fi fi-brands-linkedin text-sm" />
              LinkedIn
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
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <i className="fi fi-rr-exclamation text-red-400 text-sm" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>

                <Input
                  autoComplete="off"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={{
                    inputWrapper:
                      "h-13 border border-gray-200 shadow-none rounded-2xl",
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Password</Label>

                <Input
                  autoComplete="off"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={{
                    inputWrapper:
                      "h-13 border border-gray-200 shadow-none rounded-2xl",
                  }}
                />
              </div>
            </div>

            {/* OPTIONS */}
            <div className="flex justify-between items-center text-sm">
              <Checkbox id="remember-account">
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>

                <Checkbox.Content>
                  <Label htmlFor="remember-account">
                    Recordar
                  </Label>
                </Checkbox.Content>
              </Checkbox>

              <span className="text-orange-500 cursor-pointer hover:underline">
                ¿Olvidaste tu contraseña?
              </span>
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-2xl shadow-lg transition-all disabled:opacity-60"
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
        </motion.div>
      </div>
    </div>
  );
}