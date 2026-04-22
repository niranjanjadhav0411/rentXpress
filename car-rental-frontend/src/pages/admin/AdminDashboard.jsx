import { useEffect, useState, useRef } from "react";
import {
  getAdminStats,
  getRevenueData,
  getAllBookings,
} from "../../services/adminBookingService";
import { connectSocket } from "../../context/useSocket";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import StatCard from "../../components/admin/StatCard";

const COLORS = ["#f59e0b", "#22c55e", "#ef4444", "#6366f1"];

const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const STATUS_BADGE = {
  PENDING: "badge-pending",
  CONFIRMED: "badge-confirmed",
  REJECTED: "badge-rejected",
  CANCELLED: "badge-cancelled",
};

// ── Animated counter ──────────────────────────────────────
function useCountUp(target, duration = 1600, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    const isDecimal = String(target).includes(".");
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

// ── Custom bar chart tooltip ──────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 text-sm shadow-2xl border border-[var(--gold)]/20">
        <p className="text-[var(--text-muted)] mb-1">{label}</p>
        <p
          className="font-bold text-gold"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          ₹{payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

// ── Animated stat card ────────────────────────────────────
function AnimatedStatCard({ title, value, color, icon, started, index }) {
  const isRevenue = String(value).startsWith("₹");
  const numeric = isRevenue
    ? parseFloat(String(value).replace(/[₹,]/g, ""))
    : typeof value === "number"
      ? value
      : 0;
  const count = useCountUp(numeric, 1600, started);
  const displayValue = isRevenue ? `₹${count.toLocaleString()}` : count;

  return (
    <div
      className="glass rounded-2xl p-5 relative overflow-hidden group cursor-default"
      style={{
        animationDelay: `${index * 100}ms`,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
        e.currentTarget.style.boxShadow = `0 12px 40px ${color}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{ background: color }}
      />
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
        <span className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">
          {title}
        </span>
      </div>
      {/* Value */}
      <p
        className="text-3xl font-extrabold"
        style={{ fontFamily: "Syne, sans-serif", color }}
      >
        {displayValue}
      </p>
    </div>
  );
}

// ── Theme toggle button ───────────────────────────────────
function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("light") ? "light" : "dark",
  );

  const toggle = () => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.remove("dark");
      root.classList.add("light");
      setTheme("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      setTheme("dark");
    }
  };

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--gold)]/40 transition-all duration-200"
      title="Toggle theme"
    >
      {theme === "dark" ? (
        // Sun icon
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Moon icon
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2"
        >
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef(null);

  // ── fetch ──
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, revenueRes, bookingsRes] = await Promise.all([
        getAdminStats(),
        getRevenueData(),
        getAllBookings("", 0, 5),
      ]);
      setStats(statsRes || {});

      // Sort revenue by correct month order
      const raw = Array.isArray(revenueRes) ? revenueRes : [];
      const sorted = [...raw].sort(
        (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month),
      );
      setRevenue(sorted);
      setRecentBookings(bookingsRes?.content || []);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    connectSocket(null, (message) => {
      toast.info(message);
      fetchData();
    });
  }, []);

  // ── trigger counter when stats scroll into view ──
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsStarted(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading]);

  // ── stat card definitions ──
  const statCards = [
    {
      title: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      color: "#c9a84c",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      title: "Pending",
      value: stats?.pending ?? 0,
      color: "#f59e0b",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      title: "Confirmed",
      value: stats?.confirmed ?? 0,
      color: "#22c55e",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      title: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      color: "#c9a84c",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
  ];

  const pieData = [
    { name: "Pending", value: stats?.pending || 0 },
    { name: "Confirmed", value: stats?.confirmed || 0 },
    { name: "Rejected", value: stats?.rejected || 0 },
  ];

  // ── loading skeleton ──
  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid md:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      {/* ── Injected keyframes (once) ── */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0;   }
        }
        .anim-up {
          animation: fadeSlideUp 0.55s ease both;
        }
        .anim-up-1 { animation: fadeSlideUp 0.55s 0.08s ease both; }
        .anim-up-2 { animation: fadeSlideUp 0.55s 0.16s ease both; }
        .anim-up-3 { animation: fadeSlideUp 0.55s 0.24s ease both; }
        .anim-up-4 { animation: fadeSlideUp 0.55s 0.32s ease both; }
        .shimmer-heading {
          background: linear-gradient(
            90deg,
            var(--text-primary) 0%,
            var(--gold) 40%,
            #fff8dc 55%,
            var(--gold) 70%,
            var(--text-primary) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .row-hover {
          transition: background 0.2s;
        }
        .row-hover:hover {
          background: rgba(201,168,76,0.04) !important;
        }
      `}</style>

      <div className="p-6 lg:p-8 space-y-7">
        {/* ── Page header ── */}
        <div className="anim-up flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-1">
              Overview
            </p>
            <h1
              className="text-3xl font-bold shimmer-heading"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Live
            </div>
            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-up-1"
        >
          {statCards.map((card, i) => (
            <AnimatedStatCard
              key={card.title}
              {...card}
              started={statsStarted}
              index={i}
            />
          ))}
        </div>

        {/* ── Charts row ── */}
        <div className="grid md:grid-cols-2 gap-5 anim-up-2">
          {/* Bar Chart — Monthly Revenue */}
          <div className="glass rounded-2xl p-6 relative overflow-hidden group">
            {/* subtle corner glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--gold)]/5 blur-3xl pointer-events-none group-hover:bg-[var(--gold)]/10 transition-all duration-700" />

            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1">
              Revenue Trend
            </p>
            <h2
              className="text-lg font-semibold text-[var(--text-primary)] mb-5"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Monthly Revenue
            </h2>

            {revenue.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-[var(--text-muted)] text-sm">
                No revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenue} barSize={28}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c9a84c" />
                      <stop
                        offset="100%"
                        stopColor="#c9a84c"
                        stopOpacity={0.4}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--text-muted)"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(201,168,76,0.06)" }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#goldGrad)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart — Booking Status */}
          <div className="glass rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[var(--gold)]/5 blur-3xl pointer-events-none group-hover:bg-[var(--gold)]/10 transition-all duration-700" />

            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1">
              Distribution
            </p>
            <h2
              className="text-lg font-semibold text-[var(--text-primary)] mb-5"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Booking Status
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={80}
                    innerRadius={48}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index]}
                        style={{
                          filter: "drop-shadow(0 0 6px rgba(0,0,0,0.4))",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "13px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 shrink-0">
                {pieData.map(({ name, value }, i) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        background: COLORS[i],
                        boxShadow: `0 0 6px ${COLORS[i]}80`,
                      }}
                    />
                    <span className="text-sm text-[var(--text-muted)] w-20">
                      {name}
                    </span>
                    <span
                      className="text-sm font-bold text-[var(--text-primary)] tabular-nums"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Bookings table ── */}
        <div className="glass rounded-2xl overflow-hidden anim-up-3">
          <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1">
                Latest Activity
              </p>
              <h2
                className="text-lg font-semibold text-[var(--text-primary)]"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Recent Bookings
              </h2>
            </div>
            {/* Refresh button */}
            <button
              onClick={fetchData}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--gold)]/40 transition-all duration-200"
              title="Refresh"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-10 text-center text-[var(--text-muted)] text-sm">
              No recent bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="premium-table w-full">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="row-hover">
                      <td>
                        <div className="flex items-center gap-3">
                          {/* Avatar initial */}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{
                              background: "rgba(201,168,76,0.15)",
                              color: "var(--gold)",
                            }}
                          >
                            {(b.user?.name ||
                              b.user?.email ||
                              "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)] text-sm">
                              {b.user?.name && b.user.name !== "John Doe"
                                ? b.user.name
                                : b.user?.email || "N/A"}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {b.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-[var(--text-primary)] text-sm font-medium">
                          {b.car?.brand} {b.car?.model}
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
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[b.status] || "badge-cancelled"}`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
