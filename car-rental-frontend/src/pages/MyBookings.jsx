import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");

    // 🔒 If no token, force login
    if (!token) {
      console.error("No token found, redirecting to login");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get("http://localhost:8081/api/bookings/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings(res.data);
    } catch (err) {
      console.error("Failed to load bookings", err);

      // 🔥 Handle forbidden explicitly
      if (err.response?.status === 403) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div>
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id}>
              <strong>{booking.car?.name}</strong> — {booking.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
