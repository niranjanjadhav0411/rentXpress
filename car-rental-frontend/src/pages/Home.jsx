import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import LocationPicker from "../components/LocationPicker";
import { useEffect, useRef, useState } from "react";

const features = [
  { icon: "⚡", title: "Instant Booking",   desc: "Reserve your car in under 2 minutes with our streamlined process." },
  { icon: "💎", title: "Premium Fleet",     desc: "Hand-picked vehicles maintained to the highest standards." },
  { icon: "🛡️", title: "Fully Insured",    desc: "Every rental comes with comprehensive coverage for your peace of mind." },
  { icon: "📍", title: "Doorstep Delivery", desc: "We bring the car to your preferred pickup location." },
];

const stats = [
  ["100",  "+", "Cars Available"],
  ["5000", "+", "Happy Customers"],
  ["4.9",  "★", "Avg Rating"],
];

const testimonials = [
  { name: "Rahul Sharma", city: "Mumbai",    text: "Absolutely seamless experience. Booked in minutes, car arrived on time. Will use again!", rating: 5 },
  { name: "Priya Menon",  city: "Pune",      text: "Best car rental service I've ever used. Premium cars, fair prices, zero hidden fees.",    rating: 5 },
  { name: "Arjun Patel",  city: "Bangalore", text: "The fleet is incredible. Got a luxury SUV for my family trip at a very reasonable rate.", rating: 5 },
];

function useCountUp(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    const isDecimal = target % 1 !== 0;
    const steps = 60;
    const increment = target / steps;
    let current = 0, step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return count;
}

function StatItem({ val, suffix, label, started }) {
  const count = useCountUp(parseFloat(val), 1800, started);
  return (
    <div className="text-center sm:text-left">
      <p className="text-3xl font-bold text-[var(--gold)]" style={{ fontFamily: "Syne, sans-serif" }}>
        {count}{suffix}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1 tracking-wide">{label}</p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const carRef          = useRef(null);
  const heroRef         = useRef(null);
  const statsRef        = useRef(null);
  const featuresRef     = useRef(null);
  const testimonialsRef = useRef(null);

  const [statsStarted,        setStatsStarted]        = useState(false);
  const [featuresVisible,     setFeaturesVisible]     = useState(false);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);
  const [scrollY,             setScrollY]             = useState(0);

  // Search bar state
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate,     setPickupDate]     = useState("");
  const [returnDate,     setReturnDate]     = useState("");

  // Mouse parallax
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const move = (e) => {
      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / width;
      const y = (e.clientY - top - height / 2) / height;
      if (carRef.current)
        carRef.current.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 6}deg) translateZ(20px)`;
    };
    const leave = () => {
      if (carRef.current)
        carRef.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
    };
    hero.addEventListener("mousemove", move);
    hero.addEventListener("mouseleave", leave);
    return () => { hero.removeEventListener("mousemove", move); hero.removeEventListener("mouseleave", leave); };
  }, []);

  // Scroll
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Intersection observers
  useEffect(() => {
    const makeObs = (ref, setter, threshold = 0.3) => {
      const el = ref.current;
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setter(true); }, { threshold });
      obs.observe(el);
      return () => obs.disconnect();
    };
    const c1 = makeObs(statsRef,        setStatsStarted,        0.5);
    const c2 = makeObs(featuresRef,     setFeaturesVisible,     0.15);
    const c3 = makeObs(testimonialsRef, setTestimonialsVisible, 0.15);
    return () => { c1?.(); c2?.(); c3?.(); };
  }, []);

  const scrollProgress = typeof document !== "undefined"
    ? Math.min((scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100, 100)
    : 0;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full overflow-x-hidden flex flex-col">

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 h-[3px] z-[9999] transition-all duration-100"
        style={{ width: `${scrollProgress}%`, background: "linear-gradient(90deg,var(--gold),#f5d78e,var(--gold))" }} />

      <style>{`
        @keyframes gridMove    { 0%{background-position:0 0} 100%{background-position:60px 60px} }
        @keyframes floatP      { 0%,100%{transform:translateY(0) translateX(0);opacity:.1} 33%{transform:translateY(-18px) translateX(8px);opacity:.5} 66%{transform:translateY(-8px) translateX(-6px);opacity:.3} }
        @keyframes carFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes shimmer     { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulseRing   { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.4);opacity:0} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes borderGlow  { 0%,100%{opacity:.5} 50%{opacity:1} }
        .car-3d  { transition:transform .25s ease-out; animation:carFloat 5s ease-in-out infinite; }
        .car-3d:hover { animation-play-state:paused; }
        .shimmer-text { background:linear-gradient(90deg,var(--gold) 0%,#fff8dc 40%,var(--gold) 60%,#c9a84c 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 3s linear infinite; }
        .feature-card  { opacity:0; transform:translateY(30px); transition:opacity .6s ease,transform .6s ease,border-color .3s; }
        .feature-card.visible { opacity:1; transform:translateY(0); }
        .testimonial-card { opacity:0; transform:translateY(24px); transition:opacity .55s ease,transform .55s ease; }
        .testimonial-card.visible { opacity:1; transform:translateY(0); }
        .search-glow { position:relative; }
        .search-glow::before { content:''; position:absolute; inset:-1px; border-radius:1rem; background:linear-gradient(90deg,var(--gold),transparent,var(--gold)); background-size:200% 100%; animation:shimmer 2.5s linear infinite,borderGlow 2.5s ease-in-out infinite; z-index:-1; opacity:.4; }
        .anim-up   { animation:fadeSlideUp .6s ease both; }
        .anim-up-1 { animation:fadeSlideUp .6s .1s ease both; }
        .anim-up-2 { animation:fadeSlideUp .6s .2s ease both; }
        .anim-up-3 { animation:fadeSlideUp .6s .3s ease both; }
        .anim-up-4 { animation:fadeSlideUp .6s .4s ease both; }
      `}</style>

      {/* ══════════ HERO ══════════ */}
      <section ref={heroRef} className="relative w-full flex flex-col overflow-hidden"
        style={{ minHeight: "calc(100vh - 64px)" }}>

        {/* Backgrounds */}
        <div className="absolute inset-0" style={{ background: "var(--surface)" }} />
        <div className="absolute top-1/4 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)", transform: `translateY(${scrollY * 0.12}px)` }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(201,168,76,0.04) 0%,transparent 70%)", transform: `translateY(${scrollY * 0.07}px)` }} />
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(var(--gold) 1px,transparent 1px),linear-gradient(90deg,var(--gold) 1px,transparent 1px)", backgroundSize: "60px 60px", animation: "gridMove 20s linear infinite" }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{ width:`${Math.random()*3+1}px`, height:`${Math.random()*3+1}px`, left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, background:"var(--gold)", opacity:Math.random()*0.4+0.1, animation:`floatP ${Math.random()*8+6}s ease-in-out infinite`, animationDelay:`${Math.random()*5}s` }} />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative w-full flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 pt-14 pb-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full max-w-[1600px] mx-auto">

            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] mb-8 anim-up"
                style={{ background: "var(--surface-2)" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gold)]" />
                </span>
                <span className="text-xs font-medium text-[var(--text-secondary)] tracking-wide">Premium Car Rental Service</span>
              </div>

              <h1 className="text-[clamp(2.8rem,5.5vw,5.5rem)] font-extrabold leading-[1.04] tracking-tight anim-up-1"
                style={{ fontFamily: "Syne, sans-serif", color: "var(--text-primary)" }}>
                Drive the Car<br />
                <span className="shimmer-text">You Deserve.</span>
              </h1>

              <p className="mt-6 text-[var(--text-secondary)] text-lg leading-relaxed max-w-[500px] anim-up-2">
                Browse our curated fleet, book instantly, and experience premium rentals
                with transparent pricing — no hidden fees, ever.
              </p>

              <div className="mt-10 flex flex-wrap gap-4 anim-up-3">
                <Link to="/cars" className="btn-gold px-8 py-3.5 text-sm inline-flex items-center gap-2"
                  style={{ boxShadow: "0 0 28px rgba(201,168,76,0.35)" }}>
                  Explore Fleet
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                {!user && (
                  <Link to="/register" className="btn-ghost px-8 py-3.5 text-sm inline-flex items-center gap-2">
                    Create Account
                  </Link>
                )}
              </div>

              <div ref={statsRef} className="mt-14 grid grid-cols-3 gap-6 pt-8 border-t border-[var(--border)] anim-up-4">
                {stats.map(([val, suffix, label]) => (
                  <StatItem key={label} val={val} suffix={suffix} label={label} started={statsStarted} />
                ))}
              </div>
            </div>

            {/* RIGHT — 3D car */}
            <div className="relative flex items-center justify-center anim-up-2">
              <div className="absolute w-[340px] h-[340px] rounded-full border border-[var(--gold)]/15 pointer-events-none"
                style={{ animation: "pulseRing 3.5s ease-out infinite" }} />
              <div className="absolute inset-0 rounded-3xl blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center,rgba(201,168,76,0.07) 0%,transparent 70%)" }} />
              <div ref={carRef} className="car-3d relative w-full max-w-lg">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-8 rounded-full blur-2xl"
                  style={{ background: "rgba(201,168,76,0.25)" }} />
                <img
                  src="https://pngimg.com/uploads/audi/audi_PNG1742.png"
                  alt="Premium Car"
                  className="relative w-full"
                  style={{ filter: "drop-shadow(0 30px 60px rgba(201,168,76,0.2))" }}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="relative w-full px-6 sm:px-10 lg:px-16 xl:px-20 pb-14">
          <div className="search-glow w-full max-w-[1600px] mx-auto">
            <div className="glass rounded-2xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

                {/* Pickup Location — with LocationPicker */}
                <LocationPicker
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  placeholder="Pickup Location"
                />

                {/* Pickup Date */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 pointer-events-none z-10" style={{ color: "var(--gold)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    value={pickupDate}
                    min={today}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="input-premium text-sm w-full"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                </div>

                {/* Return Date */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 pointer-events-none z-10" style={{ color: "var(--gold)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    value={returnDate}
                    min={pickupDate || today}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="input-premium text-sm w-full"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                </div>

                {/* Search button */}
                <Link to="/cars" className="btn-gold py-3 text-sm flex items-center justify-center gap-2">
                  Search Cars
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  FEATURES  */}
      <section ref={featuresRef} className="w-full py-24 px-6 sm:px-10 lg:px-16 xl:px-20"
        style={{ background: "var(--surface-1)" }}>
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-3">Why Choose Us</p>
            <h2 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "Syne, sans-serif" }}>
              The RentXpress Difference
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, desc }, i) => (
              <div key={title}
                className={`feature-card glass rounded-2xl p-7 hover:border-[var(--border-hover)] group${featuresVisible ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 110}ms` }}>
                <div className="text-3xl mb-5 group-hover:scale-110 transition-transform duration-300 w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.12)", transition: "box-shadow 0.3s" }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.3)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
                  {icon}
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2 text-base" style={{ fontFamily: "Syne, sans-serif" }}>{title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  TESTIMONIALS  */}
      <section ref={testimonialsRef} className="w-full py-24 px-6 sm:px-10 lg:px-16 xl:px-20"
        style={{ background: "var(--surface)" }}>
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-3">Customer Stories</p>
            <h2 className="text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "Syne, sans-serif" }}>
              Loved by Thousands
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(({ name, city, text, rating }, i) => (
              <div key={name}
                className={`testimonial-card glass rounded-2xl p-7 hover:border-[var(--border-hover)] transition-all duration-300${testimonialsVisible ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 110}ms` }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, j) => (
                    <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold)" }}>
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]" style={{ fontFamily: "Syne, sans-serif" }}>{name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  CTA */}
      {!user && (
        <section className="w-full py-20 px-6 sm:px-10 lg:px-16 xl:px-20"
          style={{ background: "var(--surface-1)" }}>
          <div className="w-full max-w-[1600px] mx-auto">
            <div className="glass rounded-3xl p-14 relative overflow-hidden text-center"
              style={{ boxShadow: "0 0 80px rgba(201,168,76,0.07)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(201,168,76,0.07) 0%,transparent 60%)" }} />
              <div className="absolute top-0 left-0 w-28 h-28 border-t-2 border-l-2 border-[var(--gold)]/25 rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-28 h-28 border-b-2 border-r-2 border-[var(--gold)]/25 rounded-br-3xl" />
              <div className="relative">
                <h2 className="text-4xl font-bold mb-4 text-[var(--text-primary)]" style={{ fontFamily: "Syne, sans-serif" }}>
                  Ready to Hit the Road?
                </h2>
                <p className="text-[var(--text-secondary)] mb-8 text-lg max-w-xl mx-auto">
                  Join thousands of satisfied customers who trust RentXpress for every journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register" className="btn-gold px-10 py-4 text-sm"
                    style={{ boxShadow: "0 0 28px rgba(201,168,76,0.3)" }}>
                    Start for Free
                  </Link>
                  <Link to="/cars" className="btn-ghost px-10 py-4 text-sm">Browse Fleet</Link>
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
