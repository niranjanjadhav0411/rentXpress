import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session
  useEffect(() => {
    const restoreAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);

        if (parsedUser?.accessToken) {
          setUser(parsedUser);
          api.defaults.headers.common["Authorization"] =
            `Bearer ${parsedUser.accessToken}`;
        } else {
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("Failed to restore auth:", err);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  // Login
  const login = (authResponse) => {
    const authUser = {
      email: authResponse.email,
      role: authResponse.role,
      accessToken: authResponse.accessToken,
    };

    localStorage.setItem("user", JSON.stringify(authUser));
    setUser(authUser);

    api.defaults.headers.common["Authorization"] =
      `Bearer ${authResponse.accessToken}`;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
