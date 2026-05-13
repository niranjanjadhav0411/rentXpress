import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCarById } from "../services/carService";
import { createBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const FUEL_OPTIONS = [
  { value: "Petrol",   label: "Petrol",   icon: "⛽", desc: "Most widely available" },
  { value: "Diesel",   label: "Diesel",   icon: "🛢️", desc: "Better mileage" },
  { value: "CNG",      label: "CNG",      icon: "💨", desc: "Eco-friendly & cheaper" },
  { value: "Electric", label: "Electric", icon: "⚡", desc: "Zero emissions" },
  { value: "Hybrid",   label: "Hybrid",   icon: "🔋", desc: "Best of both" },
];

export default function Booking() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [car, setCar] = useState(null);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    name: "",
    email: "",
    contact: "",
    location: "",
    destination: "",
    pickupAddress: "",
    fuelPreference: "",
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { state: { from: `/booking/${carId}` } });
    }
  }, [user, loading, navigate, carId]);

  useEffect(() => {
    getCarById(carId)
      .then((res) => {
        setCar(res);
        // Pre-select car's fuel if set
        if (res?.fuel) setForm((f) => ({ ...f, fuelPreference: res.fuel }));
      })
      .catch(() => setError("Car not found"))
      .finally(() => setPageLoading(false));
  }, [carId]);

  const calculateDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) return 0;
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const days = calculateDays();
  const totalPrice = car ? days * car.pricePerDay : 0;
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleBooking = async () => {
    if (!days) { setError("Select valid rental dates"); return; }
    if (!form.name || !form.contact || !form.location) {
      setError("Please fill all required fields");
      return;
    }
    if (!form.fuelPreference) {
      setError("Please select your preferred fuel type");
      return;
    }
    try {
      setBookingLoading(true);
      setError("");
      await createBooking({
        carId: Number(car.id),
        startDate: form.startDate,
        endDate: form.endDate,
        name: form.name,
        email: form.email,
        contact: form.contact,
        location: form.location,
        destination: form.destination,
        pickupAddress: form.pickupAddress,
        fuelPreference: form.fuelPreference,
        totalDays: days,
      });
      toast.success("Enquiry submitted! Admin will verify soon.");
      navigate("/my-bookings");
    } catch (err) {
      toast.error(err.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
        <div className="w-full max-w-6xl px-6 space-y-6">
          <div className="skeleton h-10 w-64 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="skeleton h-96 rounded-2xl" />
            <div className="skeleton h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const Field = ({ label, name, type = "text", placeholder, min, required }) => (
    <div>
      {label && (
        <label
          className="block text-xs font-medium text-[var(--text-muted)] mb-2 tracking-wide uppercase"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          {label} {required && <span className="text-[var(--gold)]">*</span>}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          onChange={handleChange}
          rows={3}
          className="input-premium resize-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={form[name] !== undefined ? form[name] : ""}
          min={min}
          onChange={handleChange}
          className="input-premium"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-72px)] py-10 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <Link
            to={`/cars/${carId}`}
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors mb-5 group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Car
          </Link>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-2">Booking</p>
          <h1 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "Syne, sans-serif" }}>
            Book {car?.brand} {car?.model}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* ── LEFT — Dates + Fuel + Summary ── */}
          <div className="space-y-6">

            {/* Dates card */}
            <div className="glass rounded-3xl p-7 space-y-5 animate-fade-up-1">
              <div className="flex items-center gap-3 pb-5 border-b border-[var(--border)]">
                <div className="w-9 h-9 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: "Syne, sans-serif" }}>
                  Rental Dates
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Pickup Date" name="startDate" type="date" min={today} required />
                <Field label="Return Date" name="endDate" type="date" min={form.startDate || today} required />
              </div>
            </div>

            {/* ── Fuel Preference card ── */}
            <div className="glass rounded-3xl p-7 space-y-5 animate-fade-up-1">
              <div className="flex items-center gap-3 pb-5 border-b border-[var(--border)]">
                <div className="w-9 h-9 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center text-lg">
                  ⛽
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: "Syne, sans-serif" }}>
                    Fuel Preference
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Choose your preferred fuel type</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FUEL_OPTIONS.map(({ value, label, icon, desc }) => {
                  const selected = form.fuelPreference === value;
                  const isCarFuel = car?.fuel === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, fuelPreference: value })}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 16,
                        border: `1.5px solid ${selected ? "var(--gold)" : "var(--border)"}`,
                        background: selected
                          ? "rgba(201,168,76,0.1)"
                          : "var(--surface-2)",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        position: "relative",
                        boxShadow: selected ? "0 0 0 1px rgba(201,168,76,0.2), 0 4px 20px rgba(201,168,76,0.08)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!selected) {
                          e.currentTarget.style.borderColor = "var(--border-hover)";
                          e.currentTarget.style.background = "var(--surface-3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) {
                          e.currentTarget.style.borderColor = "var(--border)";
                          e.currentTarget.style.background = "var(--surface-2)";
                        }
                      }}
                    >
                      {/* Icon */}
                      <span style={{
                        fontSize: 26,
                        lineHeight: 1,
                        flexShrink: 0,
                        filter: selected ? "none" : "grayscale(0.3)",
                        transition: "filter 0.2s",
                      }}>
                        {icon}
                      </span>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: selected ? "var(--gold)" : "var(--text-primary)",
                            fontFamily: "Syne, sans-serif",
                            transition: "color 0.18s",
                          }}>
                            {label}
                          </span>
                          {isCarFuel && (
                            <span style={{
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              color: "var(--gold)",
                              background: "rgba(201,168,76,0.15)",
                              border: "1px solid rgba(201,168,76,0.25)",
                              padding: "1px 6px",
                              borderRadius: 99,
                            }}>
                              Car's fuel
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontSize: 11,
                          color: selected ? "var(--text-secondary)" : "var(--text-muted)",
                          transition: "color 0.18s",
                        }}>
                          {desc}
                        </span>
                      </div>

                      {/* Check circle */}
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${selected ? "var(--gold)" : "var(--border)"}`,
                        background: selected ? "var(--gold)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.18s",
                      }}>
                        {selected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="3.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!form.fuelPreference && (
                <p className="text-xs text-amber-400 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  Please select a fuel type to proceed
                </p>
              )}
            </div>

            {/* Price Summary */}
            <div className="glass rounded-3xl p-7 space-y-3 animate-fade-up-1">
              <p className="text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)] mb-4"
                style={{ fontFamily: "Syne, sans-serif" }}>
                Price Summary
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Rate per day</span>
                <span className="text-[var(--text-secondary)]">₹{car?.pricePerDay}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Duration</span>
                <span className="text-[var(--text-secondary)]">{days} day{days !== 1 ? "s" : ""}</span>
              </div>
              {form.fuelPreference && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Fuel type</span>
                  <span className="text-[var(--text-secondary)] flex items-center gap-1">
                    {FUEL_OPTIONS.find(f => f.value === form.fuelPreference)?.icon}
                    {form.fuelPreference}
                  </span>
                </div>
              )}
              <div className="h-px bg-[var(--border)] my-2" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[var(--text-primary)]" style={{ fontFamily: "Syne, sans-serif" }}>Total</span>
                <span className="text-2xl font-bold text-[var(--gold)]" style={{ fontFamily: "Syne, sans-serif" }}>
                  ₹{totalPrice}
                </span>
              </div>
            </div>

            {/* Car preview */}
            {car?.image && (
              <div className="rounded-2xl overflow-hidden relative animate-fade-up-1">
                <img src={car.image} alt={`${car.brand} ${car.model}`} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold text-sm" style={{ fontFamily: "Syne, sans-serif" }}>
                    {car.brand} {car.model}
                  </p>
                  <p className="text-[var(--gold)] text-xs">₹{car.pricePerDay}/day</p>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — Customer Info ── */}
          <div className="glass rounded-3xl p-7 space-y-5 animate-fade-up-2">
            <div className="flex items-center gap-3 pb-5 border-b border-[var(--border)]">
              <div className="w-9 h-9 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: "Syne, sans-serif" }}>
                Enquiry Details
              </h2>
            </div>

            <div className="space-y-4">
              <Field label="Full Name"       name="name"          placeholder="John Doe"           required />
              <Field label="Email"           name="email"         type="email" placeholder="you@example.com" />
              <Field label="Contact Number"  name="contact"       placeholder="+91 98765 43210"    required />
              <Field label="Pickup Location" name="location"      placeholder="City or area"       required />
              <Field label="Destination"     name="destination"   placeholder="Where are you heading?" />
              <Field label="Pickup Address"  name="pickupAddress" type="textarea" placeholder="Full address for pickup..." />
            </div>

            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={bookingLoading || !days || !form.fuelPreference}
              className="btn-gold w-full py-4 text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingLoading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Submitting Enquiry...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  Submit Enquiry
                </>
              )}
            </button>

            <p className="text-xs text-[var(--text-muted)] text-center leading-relaxed">
              By submitting, you agree to our terms. Admin will confirm your booking shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
