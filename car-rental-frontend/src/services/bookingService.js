import api from "./api";

export const createBooking = async (bookingData) => {
  try {
    const res = await api.post("/bookings", bookingData);
    return res.data;
  } catch (error) {
    const backendMessage =
      typeof error.response?.data === "string"
        ? error.response.data
        : error.response?.data?.message;
    throw new Error(backendMessage || "Booking failed");
  }
};

export const getMyBookings = async () => {
  try {
    const res = await api.get("/bookings/my");
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch bookings");
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const res = await api.put(`/bookings/${bookingId}/cancel`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to cancel booking");
  }
};
