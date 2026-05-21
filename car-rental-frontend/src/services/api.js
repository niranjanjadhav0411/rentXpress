import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach JWT
api.interceptors.request.use(
  (config) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.accessToken) {
          config.headers.Authorization = `Bearer ${parsed.accessToken}`;
        }
      }
    } catch {
      localStorage.removeItem("user");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth data
      localStorage.removeItem("user");
      // Dispatch a custom event so AuthContext can react
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  },
);

export default api;
