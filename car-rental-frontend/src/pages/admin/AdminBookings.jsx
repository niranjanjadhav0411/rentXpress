import { useEffect, useState } from "react";
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
} from "../../services/adminBookingService";
import { toast } from "react-toastify";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchBookings = async () => {
    try {
      const res = await getAllBookings("", 0, 100);
      setBookings(res.content || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (id) => {
    await approveBooking(id);
    toast.success("Approved ✅");
    fetchBookings();
  };

  const handleReject = async (id) => {
    await rejectBooking(id);
    toast.success("Rejected ❌");
    fetchBookings();
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading)
    return <p className="text-center py-20 text-gray-400">Loading...</p>;

  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold text-cyan-400">Booking Management</h1>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search name or email..."
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-gray-900 rounded-2xl shadow-xl">
        <table className="min-w-full text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Car</th>
              <th className="px-6 py-4 text-left">Customer</th>
              <th className="px-6 py-4 text-left">Contact</th>
              <th className="px-6 py-4 text-left">Dates</th>
              <th className="px-6 py-4 text-left">Days</th>
              <th className="px-6 py-4 text-left">Price</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.map((b) => (
              <tr
                key={b.id}
                className="border-t border-gray-800 hover:bg-gray-800/50 transition"
              >
                <td className="px-6 py-4">{b.id}</td>

                <td className="px-6 py-4">
                  {b.car?.brand} {b.car?.model}
                </td>

                <td className="px-6 py-4">
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.email}</div>
                </td>

                <td className="px-6 py-4">{b.contact}</td>

                <td className="px-6 py-4">
                  {b.startDate} → {b.endDate}
                </td>

                <td className="px-6 py-4">{b.totalDays}</td>

                <td className="px-6 py-4 text-cyan-400 font-semibold">
                  ₹{b.totalPrice}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === "PENDING"
                        ? "bg-yellow-600/20 text-yellow-400"
                        : b.status === "CONFIRMED"
                          ? "bg-green-600/20 text-green-400"
                          : b.status === "REJECTED"
                            ? "bg-red-600/20 text-red-400"
                            : "bg-gray-600/20 text-gray-400"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {b.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(b.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(b.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-10 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
