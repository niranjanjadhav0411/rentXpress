import { useEffect, useState } from "react";
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
} from "../../services/adminBookingService";
import { toast } from "react-toastify";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBookings = async (currentPage = 0) => {
    setLoading(true);
    try {
      const data = await getAllBookings("", currentPage, 5);

      setBookings(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(currentPage);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(0);
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      toast.success("Booking Approved");
      fetchBookings(page);
    } catch (err) {
      console.error(err);
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this booking?",
    );
    if (!confirmed) return;

    try {
      await rejectBooking(id);
      toast.info("Booking Rejected");
      fetchBookings(page);
    } catch (err) {
      console.error(err);
      toast.error("Rejection failed");
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">
        Admin - All Bookings
      </h2>

      {loading && <p>Loading bookings...</p>}
      {!loading && bookings.length === 0 && <p>No bookings found</p>}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="border border-gray-700 rounded-lg p-4 bg-gray-800 text-gray-200"
          >
            <p>
              <b>Car:</b> {booking.carName}
            </p>
            <p>
              <b>From:</b> {formatDate(booking.startDate)}
            </p>
            <p>
              <b>To:</b> {formatDate(booking.endDate)}
            </p>
            <p>
              <b>Total:</b> ₹{booking.totalPrice}
            </p>
            <p>
              <b>Status:</b>{" "}
              <span
                className={`font-semibold ${
                  booking.status === "PENDING"
                    ? "text-yellow-400"
                    : booking.status === "CONFIRMED"
                      ? "text-green-400"
                      : "text-red-400"
                }`}
              >
                {booking.status}
              </span>
            </p>

            {booking.status === "PENDING" && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleApprove(booking.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-semibold"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(booking.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white font-semibold"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={page === 0}
            onClick={() => fetchBookings(page - 1)}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-4 py-2">
            Page {page + 1} of {totalPages}
          </span>

          <button
            disabled={page + 1 >= totalPages}
            onClick={() => fetchBookings(page + 1)}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
