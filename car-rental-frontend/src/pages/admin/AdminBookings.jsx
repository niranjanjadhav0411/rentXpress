import { useEffect, useState } from "react";
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
} from "../../services/adminBookingService";
import { connectSocket } from "../../context/useSocket";
import { toast } from "react-toastify";

const STATUS_BADGE = {
  PENDING: "badge-pending",
  CONFIRMED: "badge-confirmed",
  REJECTED: "badge-rejected",
  CANCELLED: "badge-cancelled",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await getAllBookings("", 0, 100);
      setBookings(res?.content || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    connectSocket(null, (message) => {
      toast.info(message);
      fetchBookings();
    });
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id + "-approve");
      await approveBooking(id);
      toast.success("Booking Approved");
      fetchBookings();
    } catch {
      toast.error("Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id + "-reject");
      await rejectBooking(id);
      toast.success("Booking Rejected");
      fetchBookings();
    } catch {
      toast.error("Reject failed");
    } finally {
      setActionLoading(null);
    }
  };

  const statusTabs = ["ALL", "PENDING", "CONFIRMED", "REJECTED", "CANCELLED"];

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${b.car?.brand} ${b.car?.model}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-1">
          Management
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1
              className="text-3xl font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Bookings
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                {pendingCount} pending
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search customer, email, car..."
              className="input-premium pl-9 text-sm w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 animate-fade-up-1">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              statusFilter === tab
                ? "bg-[var(--gold)] text-[var(--surface)]"
                : "border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
            }`}
            style={{ fontFamily: "Syne, sans-serif", letterSpacing: "0.05em" }}
          >
            {tab}
            <span className="ml-1.5 opacity-60 text-[10px]">
              {tab === "ALL"
                ? bookings.length
                : bookings.filter((b) => b.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="glass rounded-2xl overflow-hidden animate-fade-up-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 border-b border-[var(--border)]"
            >
              <div className="skeleton h-4 w-1/6 rounded" />
              <div className="skeleton h-4 w-1/5 rounded" />
              <div className="skeleton h-4 w-1/4 rounded" />
              <div className="skeleton h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden animate-fade-up-2">
          {filteredBookings.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] flex items-center justify-center mx-auto mb-4">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <p className="text-[var(--text-muted)] text-sm">
                No bookings match your filter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          #{b.id}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-[var(--text-primary)] text-sm">
                          {b.car?.brand} {b.car?.model}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-[var(--text-primary)] text-sm">
                            {b.name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {b.email}
                          </p>
                        </div>
                      </td>
                      <td className="text-sm">{b.contact}</td>
                      <td>
                        <div className="text-xs">
                          <p className="text-[var(--text-primary)]">
                            {b.startDate}
                          </p>
                          <p className="text-[var(--text-muted)]">
                            → {b.endDate}
                          </p>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {b.totalDays}d
                        </span>
                      </td>
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
                              onClick={() => handleApprove(b.id)}
                              disabled={actionLoading === b.id + "-approve"}
                              className="px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                            >
                              {actionLoading === b.id + "-approve"
                                ? "..."
                                : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(b.id)}
                              disabled={actionLoading === b.id + "-reject"}
                              className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                            >
                              {actionLoading === b.id + "-reject"
                                ? "..."
                                : "Reject"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)] animate-fade-up-3">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </p>
    </div>
  );
}
