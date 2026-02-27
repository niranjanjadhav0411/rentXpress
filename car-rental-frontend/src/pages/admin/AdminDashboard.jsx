import { useEffect, useState } from "react";
import {
  getAdminStats,
  getRevenueData,
  getAllBookings,
} from "../../services/adminBookingService";

import { connectAdminSocket } from "../../context/useSocket";
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
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  /* ===============================
        FETCH DASHBOARD DATA
  =============================== */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await getAdminStats();
      const revenueRes = await getRevenueData();
      const bookingsRes = await getAllBookings("", 0, 5);

      setStats(statsRes || {});
      setRevenue(revenueRes || []);
      setRecentBookings(bookingsRes?.content || []);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    }
  };

  /* ===============================
        ADMIN REALTIME SOCKET
  =============================== */
  useEffect(() => {
    const disconnect = connectAdminSocket((message) => {
      toast.info(message);

      // refresh dashboard automatically
      fetchData();
    });

    return () => {
      if (disconnect) disconnect();
    };
  }, []);

  /* ===============================
        PIE DATA
  =============================== */
  const pieData = [
    { name: "Pending", value: stats.pending || 0 },
    { name: "Confirmed", value: stats.confirmed || 0 },
  ];

  const COLORS = ["#facc15", "#22c55e"];

  return (
    <div className="p-8 space-y-8">
      {/* ================= KPI CARDS ================= */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card title="Total Bookings" value={stats.totalBookings} />

        <Card title="Pending" value={stats.pending} color="text-yellow-400" />

        <Card
          title="Confirmed"
          value={stats.confirmed}
          color="text-green-400"
        />

        <Card
          title="Total Revenue"
          value={`₹${stats.totalRevenue || 0}`}
          color="text-cyan-400"
        />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ===== BAR CHART ===== */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Monthly Revenue
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenue}>
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ===== PIE CHART ===== */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Booking Status
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= RECENT BOOKINGS ================= */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-white">
          Recent Bookings
        </h2>

        <table className="w-full text-sm text-gray-300">
          <thead className="text-gray-400 border-b border-gray-800">
            <tr>
              <th className="py-3 text-left">Customer</th>
              <th className="text-left">Car</th>
              <th className="text-left">Price</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {recentBookings.map((b) => (
              <tr key={b.id} className="border-b border-gray-800">
                <td className="py-3">{b.name}</td>

                <td>
                  {b.car?.brand} {b.car?.model}
                </td>

                <td className="text-cyan-400">₹{b.totalPrice}</td>

                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= KPI CARD ================= */
function Card({ title, value, color = "text-white" }) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value || 0}</p>
    </div>
  );
}
