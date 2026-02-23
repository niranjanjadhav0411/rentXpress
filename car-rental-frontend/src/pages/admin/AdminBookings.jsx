import { useEffect, useState } from "react";
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
} from "../../services/adminBookingService";
import { toast } from "react-toastify";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await getAllBookings("", 0, 50);
      setBookings(res.content || []);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      toast.success("Booking Approved ✅");
      fetchBookings();
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectBooking(id);
      toast.success("Booking Rejected ❌");
      fetchBookings();
    } catch {
      toast.error("Rejection failed");
    }
  };

  if (loading)
    return <p className="text-center py-20 text-gray-400">Loading...</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-cyan-400">Booking Enquiries</h1>

      {bookings.length === 0 && (
        <p className="text-gray-400">No enquiries found.</p>
      )}

      {bookings.map((b) => (
        <div
          key={b.id}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT SIDE */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                {b.car?.brand} {b.car?.model}
              </h2>

              <p className="text-gray-400">
                📅 {b.startDate} → {b.endDate}
              </p>

              <p className="text-gray-400 mt-1">🕒 {b.totalDays} Days</p>

              <p className="text-cyan-400 font-bold mt-3 text-lg">
                ₹{b.totalPrice}
              </p>
            </div>

            {/* RIGHT SIDE - ENQUIRY DETAILS */}
            <div className="space-y-2 text-gray-300 text-sm">
              <p>
                <span className="text-gray-500">Name:</span> {b.name}
              </p>
              <p>
                <span className="text-gray-500">Email:</span> {b.email}
              </p>
              <p>
                <span className="text-gray-500">Contact:</span> {b.contact}
              </p>
              <p>
                <span className="text-gray-500">Pickup:</span> {b.location}
              </p>
              <p>
                <span className="text-gray-500">Destination:</span>{" "}
                {b.destination}
              </p>
              <p>
                <span className="text-gray-500">Address:</span>{" "}
                {b.pickupAddress}
              </p>
            </div>
          </div>

          {/* STATUS + ACTIONS */}
          <div className="mt-6 flex justify-between items-center">
            <span
              className={`font-semibold ${
                b.status === "PENDING"
                  ? "text-yellow-400"
                  : b.status === "CONFIRMED"
                    ? "text-green-400"
                    : "text-red-400"
              }`}
            >
              {b.status}
            </span>

            {b.status === "PENDING" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(b.id)}
                  className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-lg"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(b.id)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-lg"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
