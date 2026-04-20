import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

const STATUS_BADGE = {
  PENDING: "badge-pending",
  CONFIRMED: "badge-confirmed",
  REJECTED: "badge-rejected",
  CANCELLED: "badge-cancelled",
  COMPLETED: "badge-completed",
};

export default function BookingTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    api
      .get("/bookings/admin")
      .then((res) => {
        setBookings(res.data.content || []);
      })
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approve = async (id) => {
    try {
      setActionLoading(id + "-a");
      await api.put(`/bookings/admin/${id}/approve`);
      toast.success("Booking approved");
      fetchBookings();
    } catch {
      toast.error("Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (id) => {
    try {
      setActionLoading(id + "-r");
      await api.put(`/bookings/admin/${id}/reject`);
      toast.success("Booking rejected");
      fetchBookings();
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 p-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)] text-sm">
        No bookings found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="premium-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Start</th>
            <th>End</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {b.carName || `${b.car?.brand} ${b.car?.model}`}
                </span>
              </td>
              <td className="text-sm">{b.startDate}</td>
              <td className="text-sm">{b.endDate}</td>
              <td>
                <span
                  className="font-semibold text-[var(--gold)] text-sm"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  ₹{b.totalPrice?.toLocaleString()}
                </span>
              </td>
              <td>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[b.status] || "badge-cancelled"}`}
                >
                  {b.status}
                </span>
              </td>
              <td>
                {b.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(b.id)}
                      disabled={actionLoading === b.id + "-a"}
                      className="px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {actionLoading === b.id + "-a" ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => reject(b.id)}
                      disabled={actionLoading === b.id + "-r"}
                      className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {actionLoading === b.id + "-r" ? "..." : "Reject"}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
