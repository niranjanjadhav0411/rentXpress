import { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/admin/StatCard";
import RevenueChart from "../../components/admin/RevenueChart";
import BookingTable from "../../components/admin/BookingTable";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    api
      .get("/bookings/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => setStats({}));

    api
      .get("/bookings/admin/revenue")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setRevenueData(res.data);
        } else {
          setRevenueData([]);
        }
      })
      .catch(() => setRevenueData([]));
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue || 0}`} />
        <StatCard title="Total Bookings" value={stats.totalBookings || 0} />
        <StatCard title="Pending" value={stats.pending || 0} />
        <StatCard title="Confirmed" value={stats.confirmed || 0} />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={revenueData} />

      {/* Recent Bookings */}
      <BookingTable />
    </div>
  );
}
