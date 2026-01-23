import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const createBooking = (bookingData) => {
  return API.post("/bookings", bookingData);
};

export const getMyBookings = () => {
  return API.get("/bookings/my");
};

export default API;
