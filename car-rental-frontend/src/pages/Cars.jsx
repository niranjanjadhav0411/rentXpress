import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCars } from "../services/carService";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const carsData = await getAllCars();
        setCars(Array.isArray(carsData) ? carsData : []);
      } catch (err) {
        console.error("Failed to load cars", err);
        setError("Unable to load cars");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) {
    return <p className="text-center py-20 text-gray-400">Loading cars...</p>;
  }

  if (error) {
    return <p className="text-center py-20 text-red-400">{error}</p>;
  }

  if (!cars.length) {
    return (
      <p className="text-center py-20 text-gray-400">
        No cars available right now 🚗
      </p>
    );
  }

  return (
    <section className="py-10 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-cyan-400 text-center mb-8">
        Available Cars
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div
            key={car._id}
            className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition"
          >
            <img
              loading="lazy"
              src={
                car.image ||
                "https://images.unsplash.com/photo-1555215695-3004980ad54e"
              }
              alt={`${car.brand} ${car.model}`}
              className="h-48 w-full object-cover"
            />

            <div className="p-5 space-y-2">
              <h3 className="text-lg font-semibold">
                {car.brand} {car.model}
              </h3>

              <p className="text-gray-400">₹{car.pricePerDay} / day</p>

              <Link
                to={`/cars/${car._id}`}
                className="block mt-3 text-center bg-cyan-600 hover:bg-cyan-500 py-2 rounded-xl font-semibold transition"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
