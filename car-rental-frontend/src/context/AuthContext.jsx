import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ✅ Safe restore from localStorage
  const getInitialAuth = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || storedUser === "undefined" || !token) {
        return { user: null, loading: false };
      }

      return {
        user: JSON.parse(storedUser),
        loading: false,
      };
    } catch (err) {
      console.error("Auth restore failed:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return { user: null, loading: false };
    }
  };

  const [{ user, loading }, setAuth] = useState(getInitialAuth);

  // ✅ Login
  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setAuth({ user: userData, loading: false });
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuth({ user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Safe hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
