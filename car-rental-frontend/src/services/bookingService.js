import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api",
});

// 🔐 attach JWT
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const createBooking = (data) => {
  return axios.post("/api/bookings", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });
};
export const getMyBookings = () => {
  return axios.get("/api/bookings/my", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};
