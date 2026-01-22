import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCarById } from "../services/carService";
import { createBooking } from "../services/bookingService";

export default function Booking() {
  const { id } = useParams(); // carId from URL
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    getCarById(id)
      .then((res) => setCar(res.data))
      .catch(() => setError("Car not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end - start;

    if (diff <= 0) return 0;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays();
  const totalPrice = car ? days * car.pricePerDay : 0;

  const handleBooking = async () => {
    try {
      await createBooking({
        carId: car.id,
        startDate,
        endDate,
      });

      alert("Booking confirmed 🎉");
      navigate("/my-bookings");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Booking failed";

      alert(msg); // or toast.error(msg)
    }
  };

  if (loading) {
    return <p className="text-center py-20 text-gray-400">Loading...</p>;
  }

  if (error || !car) {
    return <p className="text-center py-20 text-red-400">{error}</p>;
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/cars/${car.id}`} className="text-cyan-400 hover:underline">
          ← Back to Car
        </Link>

        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-cyan-400">
          Book {car.brand} {car.model}
        </h1>

        <p className="text-gray-400 mt-2">
          Select rental dates to see the total price
        </p>
      </div>

      {/* Card */}
      <div className="bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm text-gray-400 mb-1"
            >
              Pickup Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm text-gray-400 mb-1"
            >
              Drop Date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Price per day</span>
            <span className="font-semibold">₹{car.pricePerDay}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Total days</span>
            <span className="font-semibold">{days}</span>
          </div>

          <div className="border-t border-gray-700 pt-3 flex justify-between">
            <span className="text-lg font-semibold">Total Price</span>
            <span className="text-lg font-bold text-cyan-400">
              ₹{totalPrice}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          disabled={!days}
          onClick={handleBooking}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed font-semibold text-lg transition"
        >
          Confirm Booking
        </button>
      </div>
    </section>
  );
}
