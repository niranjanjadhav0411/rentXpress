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
  COMPLETED: "badge-completed",
};

function getCustomerName(b) {
  if (b.user?.name && b.user.name !== "John Doe") return b.user.name;
  if (b.name && b.name !== "John Doe") return b.name;
  return b.user?.email || b.email || "N/A";
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("desc");

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

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const statusTabs = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "REJECTED",
    "CANCELLED",
    "COMPLETED",
  ];

  const filtered = bookings
    .filter((b) => {
      const name = getCustomerName(b).toLowerCase();
      const email = (b.user?.email || b.email || "").toLowerCase();
      const car = `${b.car?.brand || ""} ${b.car?.model || ""}`.toLowerCase();
      const q = search.toLowerCase();
      const matchSearch =
        !q || name.includes(q) || email.includes(q) || car.includes(q);
      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let av = a[sortField],
        bv = b[sortField];
      if (sortField === "totalPrice") {
        av = Number(av);
        bv = Number(bv);
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  const SortIcon = ({ field }) => (
    <span className="ml-1 opacity-50" style={{ fontSize: 9 }}>
      {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Header ── */}
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
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse">
                {pendingCount} pending
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
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
                className="input-premium pl-9 text-sm w-64"
                style={{ paddingLeft: "2.10rem" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Refresh */}
            <button
              onClick={fetchBookings}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--gold)]/40 text-[var(--text-muted)] hover:text-[var(--gold)] transition-all"
              title="Refresh"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="flex flex-wrap gap-2 animate-fade-up-1">
        {statusTabs.map((tab) => {
          const count =
            tab === "ALL"
              ? bookings.length
              : bookings.filter((b) => b.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                statusFilter === tab
                  ? "bg-[var(--gold)] text-[var(--surface)]"
                  : "border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              }`}
              style={{
                fontFamily: "Syne, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {tab}
              {count > 0 && (
                <span className="ml-2 opacity-70 text-[10px] tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="glass rounded-2xl overflow-hidden animate-fade-up-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 border-b border-[var(--border)]"
            >
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="skeleton h-4 flex-1 rounded" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden animate-fade-up-2">
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center mx-auto mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <p className="text-[var(--text-muted)] text-sm font-medium">
                No bookings match your filter
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 text-xs text-[var(--gold)] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort("id")}
                    >
                      ID <SortIcon field="id" />
                    </th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th className="hidden md:table-cell">Contact</th>
                    <th
                      className="hidden lg:table-cell cursor-pointer select-none"
                      onClick={() => toggleSort("startDate")}
                    >
                      Dates <SortIcon field="startDate" />
                    </th>
                    <th className="hidden sm:table-cell">Days</th>
                    <th
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort("totalPrice")}
                    >
                      Price <SortIcon field="totalPrice" />
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr
                      key={b.id}
                      style={{ transition: "background 0.15s" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(201,168,76,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <td>
                        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-1 rounded-lg">
                          #{b.id}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-[var(--text-primary)] text-sm">
                          {b.car?.brand} {b.car?.model}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{
                              background: "rgba(201,168,76,0.15)",
                              color: "var(--gold)",
                            }}
                          >
                            {getCustomerName(b)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)] text-sm leading-none">
                              {getCustomerName(b)}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {b.user?.email || b.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell text-sm text-[var(--text-secondary)]">
                        {b.contact}
                      </td>
                      <td className="hidden lg:table-cell">
                        <div className="text-xs">
                          <p className="text-[var(--text-primary)]">
                            {b.startDate}
                          </p>
                          <p className="text-[var(--text-muted)]">
                            → {b.endDate}
                          </p>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {b.totalDays}d
                        </span>
                      </td>
                      <td>
                        <span
                          className="font-bold text-[var(--gold)] text-sm tabular-nums"
                          style={{ fontFamily: "Syne, sans-serif" }}
                        >
                          ₹{b.totalPrice?.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_BADGE[b.status] || "badge-cancelled"}`}
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
                              className="px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                              {actionLoading === b.id + "-approve"
                                ? "…"
                                : "✓ Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(b.id)}
                              disabled={actionLoading === b.id + "-reject"}
                              className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                              {actionLoading === b.id + "-reject"
                                ? "…"
                                : "✗ Reject"}
                            </button>
                          </div>
                        )}
                        {b.status !== "PENDING" && (
                          <span className="text-xs text-[var(--text-muted)]">
                            —
                          </span>
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

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] animate-fade-up-3">
        <span>
          Showing{" "}
          <strong className="text-[var(--text-primary)]">
            {filtered.length}
          </strong>{" "}
          of {bookings.length} bookings
        </span>
        {filtered.length > 0 && (
          <span>
            Total:{" "}
            <strong className="text-[var(--gold)]">
              ₹
              {filtered
                .reduce((s, b) => s + (b.totalPrice || 0), 0)
                .toLocaleString()}
            </strong>
          </span>
        )}
      </div>
    </div>
  );
}
