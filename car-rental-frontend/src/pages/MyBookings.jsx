import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data || []);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}/cancel`);

      toast.success("Booking cancelled successfully");

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)),
      );
    } catch (err) {
      toast.error(err.response?.data || "Failed to cancel booking");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400";
      case "CONFIRMED":
        return "text-green-400";
      case "REJECTED":
        return "text-red-400";
      case "CANCELLED":
        return "text-gray-400";
      default:
        return "text-gray-300";
    }
  };

  if (loading) {
    return (
      <p className="text-center py-20 text-gray-400">Loading bookings...</p>
    );
  }

  if (bookings.length === 0) {
    return (
      <p className="text-center py-20 text-gray-400">
        You have no bookings yet.
      </p>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">My Bookings</h1>

      <div className="space-y-6">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-700"
          >
            {/* Car Name */}
            <h3 className="text-xl font-semibold text-white">
              {b.car?.brand} {b.car?.model}
            </h3>

            {/* Dates */}
            <p className="text-gray-400 mt-2 text-sm">
              {b.startDate} → {b.endDate}
            </p>

            {/* Price */}
            <p className="text-yellow-400 font-semibold mt-2">
              ₹{b.totalPrice}
            </p>

            {/* Status + Action */}
            <div className="flex justify-between items-center mt-4">
              <span
                className={`font-semibold text-sm ${getStatusColor(b.status)}`}
              >
                {b.status}
              </span>

              {/* ✅ Only allow cancel if PENDING */}
              {b.status === "PENDING" && (
                <button
                  onClick={() => cancelBooking(b.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
