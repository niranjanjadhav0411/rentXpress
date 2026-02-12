import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCarById } from "../services/carService";
import { createBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";

export default function Booking() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [car, setCar] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", {
        state: { from: `/booking/${carId}` },
      });
    }
  }, [user, loading, navigate, carId]);

  useEffect(() => {
    if (!carId) {
      setError("Invalid car selected");
      setPageLoading(false);
      return;
    }

    getCarById(carId)
      .then((res) => setCar(res))
      .catch(() => setError("Car not found"))
      .finally(() => setPageLoading(false));
  }, [carId]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) return 0;

    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return Math.floor(diff) + 1;
  };

  const days = calculateDays();
  const totalPrice = car ? days * car.pricePerDay : 0;

  const handleBooking = async () => {
    if (!days || !car) return;

    try {
      setBookingLoading(true);
      setError("");

      const finalCarId = car.id ?? car._id;

      await createBooking({
        carId: Number(finalCarId),
        startDate,
        endDate,
      });

      alert("Booking confirmed 🚗");
      navigate("/my-bookings");
    } catch (err) {
      console.error(err);

      const msg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Booking failed";

      setError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || pageLoading) {
    return <p className="text-center py-20 text-gray-400">Loading...</p>;
  }

  if (error && !car) {
    return <p className="text-center py-20 text-red-400">{error}</p>;
  }

  const safeCarId = car?.id ?? car?._id;

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          to={`/cars/${safeCarId}`}
          className="text-cyan-400 hover:underline"
        >
          ← Back to Car
        </Link>

        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-cyan-400">
          Book {car.brand} {car.model}
        </h1>

        <p className="text-gray-400 mt-2">
          Select rental dates to see the total price
        </p>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        {error && (
          <div className="text-red-400 bg-red-900/30 p-3 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Pickup Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Drop Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3"
            />
          </div>
        </div>

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

        <button
          disabled={!days || bookingLoading}
          onClick={handleBooking}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 font-semibold text-lg"
        >
          {bookingLoading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </section>
  );
}
