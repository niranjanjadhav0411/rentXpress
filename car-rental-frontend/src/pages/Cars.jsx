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
        const res = await getAllCars();
        setCars(res.data);
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

  return (
    <section className="py-10 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-cyan-400 text-center mb-8">
        Available Cars
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div key={car.id} className="bg-gray-800 p-5 rounded-xl">
            <h3 className="text-lg font-semibold">
              {car.brand} {car.model}
            </h3>
            <p className="text-gray-400">₹{car.pricePerDay} / day</p>

            <Link
              to={`/cars/${car.id}`}
              className="block mt-3 text-center bg-cyan-600 py-2 rounded"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
