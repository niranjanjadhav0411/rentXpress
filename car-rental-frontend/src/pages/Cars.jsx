import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCars } from "../services/carService";

function CarSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="skeleton h-52 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-10 w-full mt-4" />
      </div>
    </div>
  );
}

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const carsData = await getAllCars();
        setCars(Array.isArray(carsData) ? carsData : []);
      } catch (err) {
        if (err.response?.status === 401)
          setError("Unauthorized. Please login again.");
        else setError("Unable to load cars");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filtered = cars
    .filter((c) =>
      `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sort === "low") return a.pricePerDay - b.pricePerDay;
      if (sort === "high") return b.pricePerDay - a.pricePerDay;
      return 0;
    });

  return (
    <div className="min-h-[calc(100vh-72px)] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-3">
            Our Fleet
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1
                className="text-4xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Available Cars
              </h1>
              <p className="text-[var(--text-muted)] mt-2 text-sm">
                {loading
                  ? "Loading..."
                  : `${filtered.length} vehicle${filtered.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search brand or model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-premium pl-9 text-sm w-64"
                  style={{ paddingLeft: "2.10rem" }}
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-premium text-sm w-44 cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="low">Price: Low → High</option>
                <option value="high">Price: High → Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-20 text-red-400">
            <p className="text-lg">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CarSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center mx-auto mb-5">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
              >
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h3
              className="text-xl font-semibold text-[var(--text-primary)] mb-2"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              No Cars Found
            </h3>
            <p className="text-[var(--text-muted)] text-sm">
              Try a different search term or check back later.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((car, i) => {
              const carId = car.id ?? car._id;
              return (
                <div
                  key={carId}
                  className="glass rounded-2xl overflow-hidden group hover:border-[var(--border-hover)] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-52 bg-[var(--surface-2)]">
                    <img
                      loading="lazy"
                      src={
                        car.image ||
                        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={`${car.brand} ${car.model}`}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Availability */}
                    <div
                      className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-medium ${car.available !== false ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
                    >
                      {car.available !== false ? "Available" : "Booked"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3
                          className="text-base font-semibold text-[var(--text-primary)]"
                          style={{ fontFamily: "Syne, sans-serif" }}
                        >
                          {car.brand} {car.model}
                        </h3>
                        {car.type && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {car.type}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p
                          className="text-lg font-bold text-[var(--gold)]"
                          style={{ fontFamily: "Syne, sans-serif" }}
                        >
                          ₹{car.pricePerDay}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          per day
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/cars/${carId}`}
                      className="btn-gold w-full py-2.5 text-sm flex items-center justify-center gap-2"
                    >
                      View Details
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
