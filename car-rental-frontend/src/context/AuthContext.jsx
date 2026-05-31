import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  }, []);

  // ── Restore session on page load/refresh
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (!stored) { setLoading(false); return; }

        let parsed;
        try {
          parsed = JSON.parse(stored);
        } catch {
          // Corrupted localStorage — clear and start fresh
          clearAuth();
          setLoading(false);
          return;
        }

        if (!parsed?.accessToken) {
          clearAuth();
          setLoading(false);
          return;
        }

        // Set auth header so the validate call is authenticated
        api.defaults.headers.common["Authorization"] = `Bearer ${parsed.accessToken}`;

        try {
          // Validate token with backend
          await api.get("/auth/validate");
          // Token valid — restore session
          setUser(parsed);
        } catch (err) {
          const status = err?.response?.status;

          if (status === 401 || status === 403) {
            // Token is genuinely expired/invalid — log out
            clearAuth();
          } else {
            setUser(parsed);
          }
        }
      } catch {
        // Unexpected error — keep session to avoid false logout
        try {
          const stored = localStorage.getItem("user");
          if (stored) setUser(JSON.parse(stored));
        } catch { /* nothing */ }
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, [clearAuth]);

  // ── Listen for 401 events from api.js interceptor
  useEffect(() => {
    const handle = () => clearAuth();
    window.addEventListener("auth:logout", handle);
    return () => window.removeEventListener("auth:logout", handle);
  }, [clearAuth]);

  const login = (authResponse) => {
    const authUser = {
      email:       authResponse.email,
      name:        authResponse.name,
      role:        authResponse.role,
      accessToken: authResponse.accessToken,
    };
    localStorage.setItem("user", JSON.stringify(authUser));
    api.defaults.headers.common["Authorization"] = `Bearer ${authUser.accessToken}`;
    setUser(authUser);
  };

  const logout = () => clearAuth();

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
