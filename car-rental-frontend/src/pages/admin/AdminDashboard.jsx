import { useEffect, useState } from "react";
import {
  getAdminStats,
  getRevenueData,
  getAllBookings,
} from "../../services/adminBookingService";
import { connectSocket, disconnectSocket } from "../../context/useSocket";
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
  const [loading, setLoading] = useState(true);

  const [selectedCar, setSelectedCar] = useState(null);
  const [performance, setPerformance] = useState(null);

  /* ================= FETCH DATA ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const statsRes = await getAdminStats();
      const revenueRes = await getRevenueData();
      const bookingsRes = await getAllBookings("", 0, 5);

      setStats(statsRes || {});
      setRevenue(Array.isArray(revenueRes) ? revenueRes : []);
      setRecentBookings(bookingsRes?.content || []);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= SOCKET ================= */

  useEffect(() => {
    const socket = connectSocket(null, (message) => {
      toast.info(message);
      fetchData();
    });

    // return () => {
    //   disconnectSocket();
    // };
  }, []);

  /* ================= PIE DATA ================= */

  const pieData = [
    { name: "Pending", value: stats?.pending || 0 },
    { name: "Confirmed", value: stats?.confirmed || 0 },
  ];

  const COLORS = ["#facc15", "#22c55e"];

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400">Loading Dashboard...</div>
    );
  }

  return (
    <div className="p-8 space-y-8 relative">
      {/* ================= KPI CARDS ================= */}

      <div className="grid md:grid-cols-4 gap-6">
        <Card title="Total Bookings" value={stats?.totalBookings} />

        <Card title="Pending" value={stats?.pending} color="text-yellow-400" />

        <Card
          title="Confirmed"
          value={stats?.confirmed}
          color="text-green-400"
        />

        <Card
          title="Total Revenue"
          value={`₹${stats?.totalRevenue || 0}`}
          color="text-cyan-400"
        />
      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Monthly Revenue
          </h2>

          {revenue.length === 0 ? (
            <p className="text-gray-500 text-sm">No revenue data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue}>
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

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
        <h2 className="text-lg font-semibold mb-6 text-white">
          Recent Bookings
        </h2>

        {recentBookings.length === 0 ? (
          <p className="text-gray-500">No recent bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
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
                  <tr
                    key={b.id}
                    className="border-b border-gray-800 hover:bg-gray-800/40 transition"
                  >
                    <td className="py-3">
                      {b.user?.name || b.user?.email || "N/A"}
                    </td>

                    <td>
                      {b.car?.brand} {b.car?.model}
                    </td>

                    <td className="text-cyan-400">₹{b.totalPrice}</td>

                    <td
                      className={`font-semibold ${
                        b.status === "CONFIRMED"
                          ? "text-green-400"
                          : b.status === "PENDING"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {b.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}

      {selectedCar && performance && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-gray-900 w-[90%] max-w-4xl p-8 rounded-2xl shadow-2xl space-y-6 relative">
            <button
              onClick={() => {
                setSelectedCar(null);
                setPerformance(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-cyan-400">
              Car Performance Analytics
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card title="Total Bookings" value={performance.totalBookings} />
              <Card title="Confirmed" value={performance.confirmedBookings} />
              <Card
                title="Total Revenue"
                value={`₹${performance.totalRevenue}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= CARD ================= */

function Card({ title, value, color = "text-white" }) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value || 0}</p>
    </div>
  );
}
