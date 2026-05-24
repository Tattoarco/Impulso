import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (userData) => {
    let habilidades = [];
    let proyectos   = [];
    try { habilidades = Array.isArray(userData.habilidades) ? userData.habilidades : JSON.parse(userData.habilidades || "[]"); } catch { habilidades = []; }
    try { proyectos   = Array.isArray(userData.proyectos)   ? userData.proyectos   : JSON.parse(userData.proyectos   || "[]"); } catch { proyectos   = []; }
    return { ...userData, habilidades, proyectos };
  };

  /* ── FIX: logout ANTES de refreshUser ── */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async (tkn) => {
    const activeToken = tkn || token;
    if (!activeToken) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (!res.ok) { logout(); return; }
      const data       = await res.json();
      const normalized = normalizeUser(data.user);
      setUser(normalized);
      localStorage.setItem("user", JSON.stringify(normalized));
    } catch {
      // error de red — mantener sesión local
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("user",  JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  }, []);

  const updateUser = useCallback((newUserData) => {
    const normalized = normalizeUser(newUserData);
    setUser((prev) => {
      const updated = { ...prev, ...normalized };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser  = localStorage.getItem("user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        refreshUser(savedToken);
      } catch {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    user, token, loading,
    login, logout, refreshUser, updateUser,
    isAuthenticated: !!user && !!token,
    isEmpresa:   user?.role === "empresa",
    isCandidate: user?.role === "candidato",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}