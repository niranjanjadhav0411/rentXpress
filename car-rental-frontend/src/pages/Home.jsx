import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

const features = [
  {
    icon: "⚡",
    title: "Instant Booking",
    desc: "Reserve your car in under 2 minutes with our streamlined process.",
  },
  {
    icon: "💎",
    title: "Premium Fleet",
    desc: "Hand-picked vehicles maintained to the highest standards.",
  },
  {
    icon: "🛡️",
    title: "Fully Insured",
    desc: "Every rental comes with comprehensive coverage for your peace of mind.",
  },
  {
    icon: "📍",
    title: "Doorstep Delivery",
    desc: "We bring the car to your preferred pickup location.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--surface-1)] to-[var(--surface)]" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-[var(--gold)]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-[var(--gold)]/3 blur-[80px] pointer-events-none" />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] mb-8 animate-fade-up">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                <span className="text-xs font-medium text-[var(--text-secondary)] tracking-wide">
                  Premium Car Rental Service
                </span>
              </div>

              <h1
                className="text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight animate-fade-up-1"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Drive the Car
                <br />
                <span className="text-gold">You Deserve.</span>
              </h1>

              <p className="mt-6 text-[var(--text-secondary)] text-lg leading-relaxed max-w-[480px] animate-fade-up-2">
                Browse our curated fleet, book instantly, and experience premium
                rentals with transparent pricing — no hidden fees, ever.
              </p>

              <div className="mt-10 flex flex-wrap gap-4 animate-fade-up-3">
                <Link
                  to="/cars"
                  className="btn-gold px-8 py-3.5 text-sm inline-flex items-center gap-2"
                >
                  Explore Fleet
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                {!user && (
                  <Link
                    to="/register"
                    className="btn-ghost px-8 py-3.5 text-sm inline-flex items-center gap-2"
                  >
                    Create Account
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="mt-14 grid grid-cols-3 gap-6 pt-8 border-t border-[var(--border)] animate-fade-up-4">
                {[
                  ["100+", "Cars Available"],
                  ["5K+", "Happy Customers"],
                  ["4.9★", "Avg Rating"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <p
                      className="text-2xl font-bold text-gold"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {val}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Car Image */}
            <div className="relative flex items-center justify-center animate-fade-up-2">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold)]/8 to-transparent rounded-3xl blur-xl" />
              <div className="relative w-full max-w-lg">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-16 bg-[var(--gold)]/20 blur-2xl rounded-full" />
                <img
                  src="https://pngimg.com/uploads/audi/audi_PNG1742.png"
                  alt="Premium Car"
                  className="relative w-full drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
                  style={{
                    filter: "drop-shadow(0 30px 60px rgba(201,168,76,0.15))",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="max-w-4xl mx-auto glass rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gold)]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Pickup Location"
                  className="input-premium pl-10 text-sm"
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gold)]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <input type="date" className="input-premium pl-10 text-sm" />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gold)]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <input type="date" className="input-premium pl-10 text-sm" />
              </div>
              <Link
                to="/cars"
                className="btn-gold py-3 text-sm text-center flex items-center justify-center gap-2"
              >
                Search Cars
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[var(--surface-1)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-3">
              Why Choose Us
            </p>
            <h2
              className="text-4xl font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              The RentXpress Difference
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, desc }, i) => (
              <div
                key={title}
                className={`glass rounded-2xl p-7 hover:border-[var(--border-hover)] transition-all duration-300 group animate-fade-up-${i + 1}`}
              >
                <div className="text-3xl mb-5 group-hover:scale-110 transition-transform duration-300">
                  {icon}
                </div>
                <h3
                  className="font-semibold text-[var(--text-primary)] mb-2 text-base"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/5 to-transparent" />
              <div className="relative">
                <h2
                  className="text-4xl font-bold mb-4 text-[var(--text-primary)]"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Ready to Hit the Road?
                </h2>
                <p className="text-[var(--text-secondary)] mb-8 text-lg">
                  Join thousands of satisfied customers who trust RentXpress.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register" className="btn-gold px-10 py-4 text-sm">
                    Start for Free
                  </Link>
                  <Link to="/cars" className="btn-ghost px-10 py-4 text-sm">
                    Browse Fleet
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
