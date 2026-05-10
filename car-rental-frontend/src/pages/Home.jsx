import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import { useEffect, useRef, useState } from "react";

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

const stats = [
  ["100", "+", "Cars Available"],
  ["5000", "+", "Happy Customers"],
  ["4.9", "★", "Avg Rating"],
];

// ---------- Animated counter hook ----------
function useCountUp(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    const isDecimal = target % 1 !== 0;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      setCount(
        isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current),
      );
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return count;
}

// ---------- Single stat with counter ----------
function StatItem({ val, suffix, label, started }) {
  const numericVal = parseFloat(val);
  const count = useCountUp(numericVal, 1800, started);
  return (
    <div>
      <p
        className="text-2xl font-bold text-gold"
        style={{ fontFamily: "Syne, sans-serif" }}
      >
        {count}
        {suffix}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  // Mouse parallax for car
  const carRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);

  const [statsStarted, setStatsStarted] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // ---------- Mouse parallax ----------
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMouseMove = (e) => {
      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / width;
      const y = (e.clientY - top - height / 2) / height;
      if (carRef.current) {
        carRef.current.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 6}deg) translateZ(20px)`;
      }
    };
    const handleMouseLeave = () => {
      if (carRef.current) {
        carRef.current.style.transform =
          "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
      }
    };
    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // ---------- Scroll progress + parallax ----------
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------- Stats counter trigger (Intersection Observer) ----------
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsStarted(true);
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ---------- Features reveal ----------
  useEffect(() => {
    const el = featuresRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setFeaturesVisible(true);
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Scroll progress bar width
  const scrollProgress =
    typeof document !== "undefined"
      ? Math.min(
          (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100,
          100,
        )
      : 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Scroll progress bar ── */}
      <div
        className="fixed top-0 left-0 h-[3px] z-[9999] transition-all duration-100"
        style={{
          width: `${scrollProgress}%`,
          background:
            "linear-gradient(90deg, var(--gold), #f5d78e, var(--gold))",
        }}
      />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section ref={heroRef} className="relative flex flex-col overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--surface-1)] to-[var(--surface)]" />

        {/* Parallax orbs */}
        <div
          className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-[var(--gold)]/5 blur-[120px] pointer-events-none transition-transform duration-300"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-[var(--gold)]/3 blur-[80px] pointer-events-none transition-transform duration-300"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        />

        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            animation: "gridMove 20s linear infinite",
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[var(--gold)]"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.4 + 0.1,
                animation: `floatParticle ${Math.random() * 8 + 6}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* CSS keyframes injected once */}
        <style>{`
          @keyframes gridMove {
            0% { background-position: 0 0; }
            100% { background-position: 60px 60px; }
          }
          @keyframes floatParticle {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.1; }
            33%       { transform: translateY(-18px) translateX(8px);  opacity: 0.5; }
            66%       { transform: translateY(-8px)  translateX(-6px); opacity: 0.3; }
          }
          @keyframes carFloat {
            0%, 100% { transform: translateY(0px);   }
            50%       { transform: translateY(-14px); }
          }
          @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
          }
          @keyframes borderGlow {
            0%, 100% { opacity: 0.6; }
            50%       { opacity: 1;   }
          }
          @keyframes pulseRing {
            0%   { transform: scale(1);   opacity: 0.6; }
            100% { transform: scale(2.2); opacity: 0;   }
          }
          .car-3d {
            transition: transform 0.25s ease-out;
            animation: carFloat 5s ease-in-out infinite;
          }
          .car-3d:hover { animation-play-state: paused; }
          .shimmer-text {
            background: linear-gradient(
              90deg,
              var(--gold) 0%,
              #fff8dc 40%,
              var(--gold) 60%,
              #c9a84c 100%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: shimmer 3s linear infinite;
          }
          .search-glow {
            position: relative;
          }
          .search-glow::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 1rem;
            background: linear-gradient(90deg, var(--gold), transparent, var(--gold));
            background-size: 200% 100%;
            animation: shimmer 2.5s linear infinite, borderGlow 2.5s ease-in-out infinite;
            z-index: -1;
            opacity: 0.5;
          }
          .feature-card {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease, border-color 0.3s;
          }
          .feature-card.visible {
            opacity: 1;
            transform: translateY(0);
          }
          .badge-shimmer {
            position: relative;
            overflow: hidden;
          }
          .badge-shimmer::after {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 60%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
            animation: shimmer 2.5s linear infinite;
          }
        `}</style>

        {/* ── Main hero content ── */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10 w-full min-h-[calc(100vh-72px)] flex flex-col justify-center">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT */}
            <div>
              {/* Badge with shimmer */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] mb-8 animate-fade-up badge-shimmer">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gold)]" />
                </span>
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
                <span className="shimmer-text">You Deserve.</span>
              </h1>

              <p className="mt-6 text-[var(--text-secondary)] text-lg leading-relaxed max-w-[480px] animate-fade-up-2">
                Browse our curated fleet, book instantly, and experience premium
                rentals with transparent pricing — no hidden fees, ever.
              </p>

              <div className="mt-10 flex flex-wrap gap-4 animate-fade-up-3">
                <Link
                  to="/cars"
                  className="btn-gold px-8 py-3.5 text-sm inline-flex items-center gap-2"
                  style={{ boxShadow: "0 0 24px rgba(201,168,76,0.35)" }}
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

              {/* Stats — with counter animation */}
              <div
                ref={statsRef}
                className="mt-14 grid grid-cols-3 gap-6 pt-8 border-t border-[var(--border)] animate-fade-up-4"
              >
                {stats.map(([val, suffix, label]) => (
                  <StatItem
                    key={label}
                    val={val}
                    suffix={suffix}
                    label={label}
                    started={statsStarted}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT — 3D car with mouse parallax + float */}
            <div className="relative flex items-center justify-center animate-fade-up-2">
              {/* Glow ring behind car */}
              <div
                className="absolute w-[340px] h-[340px] rounded-full border border-[var(--gold)]/20 pointer-events-none"
                style={{ animation: "pulseRing 3s ease-out infinite" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold)]/8 to-transparent rounded-3xl blur-xl" />

              <div ref={carRef} className="car-3d relative w-full max-w-lg">
                {/* Shadow under car */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-8 bg-[var(--gold)]/25 blur-2xl rounded-full" />
                <img
                  src="https://pngimg.com/uploads/audi/audi_PNG1742.png"
                  alt="Premium Car"
                  className="relative w-full"
                  style={{
                    filter: "drop-shadow(0 30px 60px rgba(201,168,76,0.2))",
                  }}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Search Bar with animated glow border ── */}
        <div className="relative px-6 pb-12">
          <div className="max-w-4xl mx-auto search-glow">
            <div className="glass rounded-2xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Pickup Location */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 flex items-center justify-center text-[var(--gold)] pointer-events-none z-10">
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
                  </span>
                  <input
                    type="text"
                    placeholder="Pickup Location"
                    className="input-premium text-sm w-full"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                </div>

                {/* Pickup Date */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 flex items-center justify-center text-[var(--gold)] pointer-events-none z-10">
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
                  </span>
                  <input
                    type="date"
                    className="input-premium text-sm w-full"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                </div>

                {/* Return Date */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 flex items-center justify-center text-[var(--gold)] pointer-events-none z-10">
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
                  </span>
                  <input
                    type="date"
                    className="input-premium text-sm w-full"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                </div>

                {/* Search Button */}
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
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[var(--surface-1)]" ref={featuresRef}>
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
                className={`feature-card glass rounded-2xl p-7 hover:border-[var(--border-hover)] group${featuresVisible ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Icon with glow on hover */}
                <div
                  className="text-3xl mb-5 group-hover:scale-110 transition-transform duration-300 w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--gold)/10, transparent)",
                    border: "1px solid var(--gold)/15",
                    transition: "box-shadow 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 20px rgba(201,168,76,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
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

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      {!user && (
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="glass rounded-3xl p-12 relative overflow-hidden"
              style={{ boxShadow: "0 0 60px rgba(201,168,76,0.08)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/5 to-transparent" />
              {/* Animated corner accents */}
              <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[var(--gold)]/30 rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[var(--gold)]/30 rounded-br-3xl" />
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
                  <Link
                    to="/register"
                    className="btn-gold px-10 py-4 text-sm"
                    style={{ boxShadow: "0 0 24px rgba(201,168,76,0.3)" }}
                  >
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

{/*       <Footer /> */}
    </div>
  );
}
