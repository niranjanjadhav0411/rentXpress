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

      // ✅ Sort newest first
      const sorted = (res.data || []).sort((a, b) => b.id - a.id);

      setBookings(sorted);
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
        return "bg-yellow-500/20 text-yellow-400";
      case "CONFIRMED":
        return "bg-green-500/20 text-green-400";
      case "REJECTED":
        return "bg-red-500/20 text-red-400";
      case "CANCELLED":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  if (loading) {
    return (
      <p className="text-center py-20 text-gray-400">Loading bookings...</p>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-xl">No bookings yet 🚗</p>
        <p className="text-sm mt-2">Start by exploring available cars.</p>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">My Bookings</h1>

      <div className="space-y-6">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-cyan-500/40 transition duration-300"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {b.car?.brand} {b.car?.model}
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                  {b.startDate} → {b.endDate}
                </p>
              </div>

              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  b.status,
                )}`}
              >
                {b.status}
              </span>
            </div>

            {/* Price */}
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Total Price</p>
                <p className="text-yellow-400 font-bold text-lg">
                  ₹{b.totalPrice}
                </p>
              </div>

              {/* Only Pending can cancel */}
              {b.status === "PENDING" && (
                <button
                  onClick={() => cancelBooking(b.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Optional Enquiry Details (if exists) */}
            {(b.location || b.destination) && (
              <div className="mt-4 text-sm text-gray-400 border-t border-gray-800 pt-4">
                {b.location && <p>Pickup: {b.location}</p>}
                {b.destination && <p>Destination: {b.destination}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
