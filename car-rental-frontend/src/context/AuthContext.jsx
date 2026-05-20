import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  }, []);

  // Validate token with backend before restoring session
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) { setLoading(false); return; }

        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?.accessToken) { clearAuth(); setLoading(false); return; }

        // Set header first so the validation request is authenticated
        api.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.accessToken}`;

        // Validate token against backend
        await api.get("/auth/validate");

        // Token is valid — restore session
        setUser(parsedUser);
      } catch {
        // Token invalid/expired — clear everything, start fresh
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, [clearAuth]);

  // Listen for 401 events dispatched by the api interceptor
  useEffect(() => {
    const handle = () => clearAuth();
    window.addEventListener("auth:logout", handle);
    return () => window.removeEventListener("auth:logout", handle);
  }, [clearAuth]);

  const login = (authResponse) => {
    const authUser = {
      email: authResponse.email,
      name: authResponse.name,
      role: authResponse.role,
      accessToken: authResponse.accessToken,
    };
    localStorage.setItem("user", JSON.stringify(authUser));
    api.defaults.headers.common["Authorization"] = `Bearer ${authUser.accessToken}`;
    setUser(authUser);
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
