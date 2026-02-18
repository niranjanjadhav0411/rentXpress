import axios from "axios";

// Create an Axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);

    if (parsedUser?.accessToken) {
      config.headers.Authorization = `Bearer ${parsedUser.accessToken}`;
    }
  }

  return config;
});

// Response interceptor (optional, for logging or global error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API response error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default api;
