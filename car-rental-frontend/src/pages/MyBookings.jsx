import { useEffect, useState } from "react";
import { getMyBookings } from "../services/bookingService";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getMyBookings();
        console.log("MY BOOKINGS RESPONSE:", res.data);
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load bookings", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p className="text-center py-20">Loading...</p>;
  if (bookings.length === 0)
    return <p className="text-center py-20">No bookings found</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8 text-center">
        My Bookings
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map((b, index) => (
          <div
            key={b.id ?? index}
            className="bg-gray-800 rounded-2xl p-5 shadow"
          >
            <h3 className="text-xl font-semibold mb-2">
              {b.carName || "Unknown Car"}
            </h3>

            <p className="text-gray-400">
              {b.startDate ? new Date(b.startDate).toLocaleDateString() : "--"}{" "}
              → {b.endDate ? new Date(b.endDate).toLocaleDateString() : "--"}
            </p>

            <p className="font-semibold text-cyan-400 mt-2">
              ₹{b.totalPrice ?? 0}
            </p>

            <span className="inline-block mt-3 px-3 py-1 text-sm rounded-full bg-yellow-600">
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
