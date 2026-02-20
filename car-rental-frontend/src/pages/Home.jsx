import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to from-gray-950 via-gray-900 to-black text-white">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 items-center gap-16">
        {/* LEFT CONTENT */}
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Rent Cars.
            <br />
            <span className="text-cyan-400">Simple & Fast.</span>
          </h1>

          <p className="mt-6 text-gray-300 text-lg leading-relaxed max-w-lg">
            Browse cars, book instantly, and enjoy your ride. Premium vehicles
            with transparent pricing and zero hassle.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/cars"
              className="px-7 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-medium transition shadow-lg hover:shadow-cyan-500/20"
            >
              Explore Cars
            </Link>

            {!user && (
              <Link
                to="/register"
                className="px-7 py-3 border border-gray-700 hover:border-cyan-400 rounded-xl transition"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center relative">
          <div className="absolute w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full"></div>

          <img
            src="https://pngimg.com/uploads/audi/audi_PNG1742.png"
            alt="Premium Car"
            className="relative w-full max-w-xl drop-shadow-2xl hover:scale-105 transition duration-500"
          />
        </div>
      </section>

      {/* OPTIONAL SEARCH SECTION */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl p-6 grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Pickup Location"
            className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="date"
            className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="date"
            className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button className="bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition">
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
