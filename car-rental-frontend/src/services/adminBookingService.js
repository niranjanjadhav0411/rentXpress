import api from "./api";

export const getAdminStats = async () => {
  try {
    const res = await api.get("/bookings/admin/stats");
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching admin stats:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to fetch admin statistics");
  }
};

export const getAllBookings = async (status = "", page = 0, size = 5) => {
  try {
    const res = await api.get("/bookings/admin", {
      params: { status, page, size },
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching bookings:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to fetch bookings");
  }
};

export const approveBooking = async (id) => {
  try {
    const res = await api.put(`/bookings/admin/${id}/approve`);
    return res.data;
  } catch (error) {
    console.error(
      "Error approving booking:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to approve booking");
  }
};

export const rejectBooking = async (id) => {
  try {
    const res = await api.put(`/bookings/admin/${id}/reject`);
    return res.data;
  } catch (error) {
    console.error(
      "Error rejecting booking:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to reject booking");
  }
};
