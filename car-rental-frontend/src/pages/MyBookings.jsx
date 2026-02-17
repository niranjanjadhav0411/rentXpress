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
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}/cancel`);

      toast.success("Booking Cancelled Successfully");

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)),
      );
    } catch (err) {
      toast.error(err.response?.data || "Failed to cancel booking");
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
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">My Bookings</h1>

      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition"
          >
            <h3 className="text-xl font-semibold text-white">
              {b.car?.brand} {b.car?.model}
            </h3>

            <p className="text-gray-300 mt-2">
              {b.startDate} → {b.endDate}
            </p>

            <p className="text-yellow-400 font-medium mt-1">₹{b.totalPrice}</p>

            <div className="flex justify-between items-center mt-3">
              <span
                className={`font-semibold ${
                  b.status === "CANCELLED" ? "text-red-400" : "text-green-400"
                }`}
              >
                {b.status}
              </span>

              {b.status !== "CANCELLED" && (
                <button
                  onClick={() => cancelBooking(b.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded-lg text-sm transition"
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
