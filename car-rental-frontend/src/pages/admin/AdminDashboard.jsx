import { useEffect, useState } from "react";
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

const STATUS_BADGE = {
  PENDING: "badge-pending",
  CONFIRMED: "badge-confirmed",
  REJECTED: "badge-rejected",
  CANCELLED: "badge-cancelled",
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 text-sm shadow-2xl">
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, revenueRes, bookingsRes] = await Promise.all([
        getAdminStats(),
        getRevenueData(),
        getAllBookings("", 0, 5),
      ]);
      setStats(statsRes || {});
      setRevenue(Array.isArray(revenueRes) ? revenueRes : []);
      setRecentBookings(bookingsRes?.content || []);
    } catch (error) {
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

  const pieData = [
    { name: "Pending", value: stats?.pending || 0 },
    { name: "Confirmed", value: stats?.confirmed || 0 },
    { name: "Rejected", value: stats?.rejected || 0 },
  ];

  const statCards = [
    {
      title: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      color: "var(--text-primary)",
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
      color: "var(--gold)",
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
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page title */}
      <div className="animate-fade-up">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-1">
          Overview
        </p>
        <h1
          className="text-3xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Dashboard
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up-1">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-5 animate-fade-up-2">
        {/* Bar Chart */}
        <div className="glass rounded-2xl p-6">
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
                  cursor={{ fill: "rgba(201,168,76,0.05)" }}
                />
                <Bar
                  dataKey="revenue"
                  fill="url(#goldGrad)"
                  radius={[6, 6, 0, 0]}
                >
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--gold)" />
                      <stop
                        offset="100%"
                        stopColor="var(--gold-dim)"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="glass rounded-2xl p-6">
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
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} strokeWidth={0} />
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

            <div className="space-y-2.5 shrink-0">
              {pieData.map(({ name, value }, i) => (
                <div key={name} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: COLORS[i] }}
                  />
                  <span className="text-[var(--text-muted)]">{name}</span>
                  <span
                    className="font-semibold text-[var(--text-primary)] ml-1"
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

      {/* Recent Bookings */}
      <div className="glass rounded-2xl overflow-hidden animate-fade-up-3">
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
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-10 text-center text-[var(--text-muted)] text-sm">
            No recent bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="premium-table">
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
                  <tr key={b.id}>
                    <td>
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
                    </td>
                    <td>
                      <span className="text-[var(--text-primary)] text-sm">
                        {b.car?.brand} {b.car?.model}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
