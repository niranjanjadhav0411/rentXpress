import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const BookCar = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const [car, setCar] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { state: { from: location.pathname }, replace: true });
    }
  }, [loading, user, navigate, location]);

  useEffect(() => {
    if (!carId) {
      setError("Invalid car selected");
      return;
    }
    api
      .get(`/cars/${carId}`)
      .then((res) => setCar(res.data))
      .catch(() => setError("Failed to load car details"));
  }, [carId]);

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setError("Please select both dates");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date");
      return;
    }

    try {
      setBookingLoading(true);
      setError("");
      await api.post("/bookings", { carId: Number(carId), startDate, endDate });
      toast.success("Booking request submitted!");
      navigate("/my-bookings");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Car already booked for selected dates";
      setError(message);
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  const days = (() => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate) - new Date(startDate);
    return diff < 0 ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  })();

  if (loading)
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
        <div className="skeleton w-96 h-64 rounded-2xl" />
      </div>
    );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="glass rounded-3xl p-8">
          {/* Header */}
          <div className="mb-6 pb-5 border-b border-[var(--border)]">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-2">
              Quick Book
            </p>
            <h2
              className="text-2xl font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Reserve Your Car
            </h2>
          </div>

          {/* Car info */}
          {car ? (
            <div className="bg-[var(--surface-2)] rounded-2xl p-4 mb-6 flex items-center gap-4">
              {car.image && (
                <img
                  src={car.image}
                  alt={car.model}
                  className="w-20 h-14 object-cover rounded-xl"
                />
              )}
              <div>
                <p
                  className="font-semibold text-[var(--text-primary)]"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {car.brand} {car.model}
                </p>
                <p className="text-[var(--gold)] text-sm font-medium">
                  ₹{car.pricePerDay}{" "}
                  <span className="text-[var(--text-muted)] font-normal">
                    / day
                  </span>
                </p>
                {car.type && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {car.type}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="skeleton h-20 rounded-2xl mb-6" />
          )}

          {error && (
            <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium text-[var(--text-muted)] mb-2 tracking-wide uppercase"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Pickup Date
              </label>
              <input
                type="date"
                className="input-premium"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-[var(--text-muted)] mb-2 tracking-wide uppercase"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Return Date
              </label>
              <input
                type="date"
                className="input-premium"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
              />
            </div>

            {days > 0 && car && (
              <div className="bg-[var(--surface-2)] rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm text-[var(--text-muted)]">
                  {days} day{days !== 1 ? "s" : ""} total
                </span>
                <span
                  className="text-lg font-bold text-gold"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  ₹{days * car.pricePerDay}
                </span>
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={bookingLoading || !car}
              className="btn-gold w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {bookingLoading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Processing...
                </>
              ) : (
                "Book Now"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCar;
