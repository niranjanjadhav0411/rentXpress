import api from "./api";

// Admin Stats
export const getAdminStats = async () => {
  const res = await api.get("/bookings/admin/stats");
  return res.data;
};

// Revenue Admin
export const getRevenueData = async () => {
  const res = await api.get("/bookings/admin/revenue");
  return res.data;
};

// All Bookings
export const getAllBookings = async (search = "", page = 0, size = 50) => {
  const res = await api.get(`/bookings/admin?page=${page}&size=${size}`);
  return res.data;
};

// Approve Booking
export const approveBooking = async (id) => {
  return api.put(`/bookings/admin/${id}/approve`);
};

// Reject Booking
export const rejectBooking = async (id) => {
  return api.put(`/bookings/admin/${id}/reject`);
};
