import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const STATUS_CONFIG = {
  PENDING:   { label: "Pending",   cls: "badge-pending",   icon: "⏳" },
  CONFIRMED: { label: "Confirmed", cls: "badge-confirmed", icon: "✓" },
  REJECTED:  { label: "Rejected",  cls: "badge-rejected",  icon: "✕" },
  CANCELLED: { label: "Cancelled", cls: "badge-cancelled", icon: "–" },
  COMPLETED: { label: "Completed", cls: "badge-completed", icon: "★" },
};

const FUEL_ICONS = {
  Petrol: "⛽", Diesel: "🛢️", CNG: "💨", Electric: "⚡", Hybrid: "🔋",
};

function BookingCard({ b, onCancel }) {
  const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="glass rounded-2xl overflow-hidden hover:border-[var(--border-hover)] transition-all duration-300 animate-fade-up">
      <div className="grid md:grid-cols-[1fr_auto] gap-0">
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)]"
                  style={{ fontFamily: "Syne, sans-serif" }}>
                  {b.car?.brand} {b.car?.model}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.cls}`}>
                  {status.icon} {status.label}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Booking #{b.id}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--gold)]" style={{ fontFamily: "Syne, sans-serif" }}>
                ₹{b.totalPrice}
              </p>
              <p className="text-xs text-[var(--text-muted)]">total amount</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-[var(--surface-2)] rounded-xl p-3">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Pickup</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{b.startDate}</p>
            </div>
            <div className="bg-[var(--surface-2)] rounded-xl p-3">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Return</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{b.endDate}</p>
            </div>
            {b.totalDays && (
              <div className="bg-[var(--surface-2)] rounded-xl p-3">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Duration</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{b.totalDays} day{b.totalDays !== 1 ? "s" : ""}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
            {b.location && (
              <div className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                From: {b.location}
              </div>
            )}
            {b.destination && (
              <div className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                To: {b.destination}
              </div>
            )}
            {b.fuelPreference && (
              <div className="flex items-center gap-1.5">
                <span>{FUEL_ICONS[b.fuelPreference] || "⛽"}</span>
                Fuel: {b.fuelPreference}
              </div>
            )}
          </div>
        </div>

        {b.status === "PENDING" && (
          <div className="md:border-l border-t md:border-t-0 border-[var(--border)] p-6 flex md:flex-col items-center justify-center gap-3">
            <button
              onClick={() => onCancel(b.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all duration-200 whitespace-nowrap"
            >
              Cancel Booking
            </button>
            <p className="text-[10px] text-[var(--text-muted)] text-center max-w-[100px]">
              Cancellation is free
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setError("");
      const res = await api.get("/bookings/my");
      const sorted = (res.data || []).sort((a, b) => b.id - a.id);
      setBookings(sorted);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        setError("Failed to load bookings. Please try again.");
        toast.error("Failed to load bookings");
      }
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

  const statusTabs = ["ALL", "PENDING", "CONFIRMED", "CANCELLED", "REJECTED"];
  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="skeleton h-10 w-48 mb-8" />
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-2">My Account</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "Syne, sans-serif" }}>
              My Bookings
            </h1>
            <Link to="/cars" className="btn-gold px-6 py-2.5 text-sm inline-flex items-center gap-2 self-start">
              + New Booking
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
            <button onClick={fetchBookings} className="ml-auto underline text-xs">Retry</button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8 animate-fade-up-1">
          {statusTabs.map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                filter === tab
                  ? "bg-[var(--gold)] text-[var(--surface)]"
                  : "border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              }`}
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "0.05em" }}
            >
              {tab}
              {tab !== "ALL" && (
                <span className="ml-1.5 opacity-60">
                  {bookings.filter((b) => b.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
              {filter === "ALL" ? "No bookings yet" : `No ${filter.toLowerCase()} bookings`}
            </h3>
            <p className="text-[var(--text-muted)] text-sm mb-6">
              {filter === "ALL" ? "Start by exploring our premium fleet." : "Try a different filter."}
            </p>
            {filter === "ALL" && (
              <Link to="/cars" className="btn-gold px-8 py-3 text-sm inline-flex items-center gap-2">
                Browse Fleet
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((b) => <BookingCard key={b.id} b={b} onCancel={cancelBooking} />)}
          </div>
        )}
      </div>
    </div>
  );
}
