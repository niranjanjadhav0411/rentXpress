import { useEffect, useState } from "react";
import api from "../../services/api";

export default function BookingTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    api
      .get("/bookings/admin")
      .then((res) => {
        setBookings(res.data.content || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approve = (id) => {
    api.put(`/bookings/admin/${id}/approve`).then(fetchBookings);
  };

  const reject = (id) => {
    api.put(`/bookings/admin/${id}/reject`).then(fetchBookings);
  };

  const statusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "PENDING":
        return `${base} bg-yellow-500 text-black`;
      case "CONFIRMED":
        return `${base} bg-green-600`;
      case "REJECTED":
        return `${base} bg-red-600`;
      case "CANCELLED":
        return `${base} bg-gray-500`;
      case "COMPLETED":
        return `${base} bg-blue-600`;
      default:
        return base;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-md p-6 overflow-x-auto">
      <table className="min-w-full text-sm text-white">
        <thead>
          <tr className="border-b border-gray-700 text-left">
            <th className="p-3">Car</th>
            <th className="p-3">Start</th>
            <th className="p-3">End</th>
            <th className="p-3">Price</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-gray-700">
              <td className="p-3">{b.carName}</td>
              <td className="p-3">{b.startDate}</td>
              <td className="p-3">{b.endDate}</td>
              <td className="p-3">₹{b.totalPrice}</td>
              <td className="p-3">
                <span className={statusBadge(b.status)}>{b.status}</span>
              </td>
              <td className="p-3 flex gap-2">
                {b.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => approve(b.id)}
                      className="bg-green-600 px-3 py-1 rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(b.id)}
                      className="bg-red-600 px-3 py-1 rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
