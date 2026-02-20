import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCarById } from "../services/carService";
import { createBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Booking() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [car, setCar] = useState(null);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    name: "",
    email: "",
    contact: "",
    location: "",
    destination: "",
    pickupAddress: "",
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { state: { from: `/booking/${carId}` } });
    }
  }, [user, loading, navigate, carId]);

  useEffect(() => {
    getCarById(carId)
      .then((res) => setCar(res))
      .catch(() => setError("Car not found"))
      .finally(() => setPageLoading(false));
  }, [carId]);

  const calculateDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) return 0;
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const days = calculateDays();
  const totalPrice = car ? days * car.pricePerDay : 0;
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBooking = async () => {
    if (!days) {
      setError("Select valid rental dates");
      return;
    }

    if (!form.name || !form.contact || !form.location) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setBookingLoading(true);
      setError("");

      await createBooking({
        carId: Number(car.id),
        startDate: form.startDate,
        endDate: form.endDate,
        name: form.name,
        email: form.email,
        contact: form.contact,
        location: form.location,
        destination: form.destination,
        pickupAddress: form.pickupAddress,
        totalDays: days,
      });

      toast.success("Enquiry submitted 🚗 Admin will verify soon.");
      navigate("/my-bookings");
    } catch (err) {
      toast.error(err.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || pageLoading)
    return <p className="text-center py-20 text-gray-400">Loading...</p>;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8">
        Book {car.brand} {car.model}
      </h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* LEFT SIDE */}
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-xl font-semibold text-white">Rental Details</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <input
              type="date"
              name="startDate"
              min={today}
              value={form.startDate}
              onChange={handleChange}
              className="input-style"
            />

            <input
              type="date"
              name="endDate"
              min={form.startDate || today}
              value={form.endDate}
              onChange={handleChange}
              className="input-style"
            />
          </div>

          <div className="bg-gray-800 p-5 rounded-xl">
            <div className="flex justify-between text-gray-400">
              <span>Price / Day</span>
              <span>₹{car.pricePerDay}</span>
            </div>

            <div className="flex justify-between mt-2 text-gray-400">
              <span>Total Days</span>
              <span>{days}</span>
            </div>

            <div className="flex justify-between mt-4 text-lg font-bold text-cyan-400">
              <span>Total Price</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl space-y-5">
          <h2 className="text-xl font-semibold text-white">
            Enquiry Information
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="input-style"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="input-style"
          />

          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            onChange={handleChange}
            className="input-style"
          />

          <input
            type="text"
            name="location"
            placeholder="Pickup Location"
            onChange={handleChange}
            className="input-style"
          />

          <input
            type="text"
            name="destination"
            placeholder="Destination"
            onChange={handleChange}
            className="input-style"
          />

          <textarea
            name="pickupAddress"
            placeholder="Pickup Address"
            onChange={handleChange}
            className="input-style"
          />

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            onClick={handleBooking}
            disabled={bookingLoading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-semibold text-lg transition"
          >
            {bookingLoading ? "Submitting..." : "Submit Enquiry"}
          </button>
        </div>
      </div>

      <style>{`
        .input-style {
          width: 100%;
          padding: 12px 14px;
          background: #1f2937;
          border-radius: 10px;
          border: 1px solid #374151;
          color: white;
        }
      `}</style>
    </section>
  );
}
