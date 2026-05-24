import { createContext, useContext, useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════
   CONTEXTO
═══════════════════════════════════════ */
const AuthContext = createContext(null);

/* ═══════════════════════════════════════
   PROVIDER
═══════════════════════════════════════ */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true mientras verifica sesión inicial

  /* ── Cargar sesión guardada al montar ── */
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(normalizeUser(JSON.parse(savedUser))); // Verificar que el token siga siendo válido
        refreshUser(savedToken);
      } catch {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const normalizeUser = (userData) => {
    let habilidades = [];
    let proyectos = [];

    try {
      habilidades = Array.isArray(userData.habilidades) ? userData.habilidades : JSON.parse(userData.habilidades || "[]");
    } catch {
      habilidades = [];
    }

    try {
      proyectos = Array.isArray(userData.proyectos) ? userData.proyectos : JSON.parse(userData.proyectos || "[]");
    } catch {
      proyectos = [];
    }

    return {
      ...userData,
      habilidades,
      proyectos,
    };
  };

  /* ── Refrescar datos del usuario desde la BD ── */
  const refreshUser = useCallback(
    async (tkn) => {
      const activeToken = tkn || token;
      if (!activeToken) return;

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${activeToken}` },
        });

        if (!res.ok) {
          // Token expirado o inválido
          logout();
          return;
        }

        const data = await res.json();
        const normalized = normalizeUser(data.user);

        // Actualizar estado y localStorage con datos frescos
        setUser(normalized);
        localStorage.setItem("user", JSON.stringify(normalized));
      } catch {
        // Error de red — mantener sesión local sin desloguear
      } finally {
        setLoading(false);
      }
    },
    [token,  logout],
  );

  /* ── Login ── */
  const login = useCallback((userData, authToken) => {
    const normalized = normalizeUser(userData);

    setUser(normalized);
    setToken(authToken);

    localStorage.setItem("user", JSON.stringify(normalized));
    localStorage.setItem("token", authToken);
  }, []);

  /* ── Logout ── */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLoading(false);
  }, []);

  /* ── Actualizar datos del usuario localmente ── */
  // Útil después de editar perfil sin volver a hacer fetch
  const updateUser = useCallback((newUserData) => {
    const normalized = normalizeUser(newUserData);

    setUser((prev) => {
      const updated = {
        ...prev,
        ...normalized,
      };

      localStorage.setItem("user", JSON.stringify(updated));

      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshUser,
    updateUser,
    isAuthenticated: !!user && !!token,
    isEmpresa: user?.role === "empresa",
    isCandidate: user?.role === "candidato",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ═══════════════════════════════════════
   HOOK
═══════════════════════════════════════ */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
