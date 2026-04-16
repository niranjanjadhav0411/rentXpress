import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCarById } from "../services/carService";

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid car ID");
      setLoading(false);
      return;
    }

    const fetchCar = async () => {
      try {
        const carData = await getCarById(id);
        setCar(carData);
      } catch (err) {
        if (err.response?.status === 401)
          setError("Unauthorized. Please login again.");
        else setError("Car not found");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
        <div className="space-y-3 w-full max-w-5xl px-6">
          <div className="skeleton h-8 w-32 mb-8" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="skeleton h-80 rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-10 w-3/4" />
              <div className="skeleton h-6 w-1/2" />
              <div className="skeleton h-6 w-1/3" />
              <div className="skeleton h-12 w-full mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f87171"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p
            className="text-xl font-semibold text-[var(--text-primary)] mb-2"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {error || "Car not found"}
          </p>
          <Link
            to="/cars"
            className="text-[var(--gold)] text-sm hover:underline"
          >
            ← Back to Fleet
          </Link>
        </div>
      </div>
    );
  }

  const carId = car.id ?? car._id;

  const specs = [
    { label: "Type", value: car.type || "Sedan" },
    { label: "Fuel", value: car.fuel || "Petrol" },
    { label: "Seats", value: car.seats || "5" },
    { label: "Transmission", value: car.transmission || "Automatic" },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors mb-8 group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="group-hover:-translate-x-0.5 transition-transform"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Fleet
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start animate-fade-up">
          {/* Image */}
          <div className="relative">
            <div className="glass rounded-3xl overflow-hidden">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[var(--gold)]/15 blur-2xl rounded-full" />
              <img
                src={
                  car.image ||
                  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"
                }
                alt={`${car.brand} ${car.model}`}
                className="relative w-full object-cover h-72 lg:h-96"
                style={{
                  filter: "drop-shadow(0 20px 40px rgba(201,168,76,0.1))",
                }}
              />
            </div>

            {/* Availability badge */}
            <div
              className={`absolute top-5 left-5 px-4 py-2 rounded-full text-xs font-semibold border ${car.available !== false ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25"}`}
            >
              {car.available !== false
                ? "✓ Available Now"
                : "✗ Currently Booked"}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[var(--gold)] mb-2">
                {car.brand}
              </p>
              <h1
                className="text-4xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {car.model}
              </h1>
            </div>

            {/* Price */}
            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-[var(--text-muted)] mb-1">
                Rental Price
              </p>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-4xl font-bold text-gold"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  ₹{car.pricePerDay}
                </span>
                <span className="text-[var(--text-muted)] text-sm">/ day</span>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              {specs.map(({ label, value }) => (
                <div key={label} className="glass rounded-xl p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-1">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            {car.available !== false ? (
              <Link
                to={`/booking/${carId}`}
                className="btn-gold w-full py-4 text-base flex items-center justify-center gap-3"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                Book This Car
              </Link>
            ) : (
              <div className="w-full py-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center text-[var(--text-muted)] text-sm">
                Currently Unavailable — Check Back Soon
              </div>
            )}

            <p className="text-xs text-[var(--text-muted)] text-center">
              ✓ Free cancellation &nbsp;·&nbsp; ✓ Doorstep delivery
              &nbsp;·&nbsp; ✓ 24/7 support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
