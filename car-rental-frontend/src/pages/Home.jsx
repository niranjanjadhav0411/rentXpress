import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="py-16 sm:py-24 text-center px-4">
      <h1 className="text-3xl sm:text-5xl font-bold text-cyan-400">
        Rent Cars. Simple & Fast.
      </h1>

      <p className="mt-4 text-gray-400 sm:text-lg max-w-xl mx-auto">
        Browse cars, book instantly, and enjoy your ride.
      </p>

      <Link
        to="/cars"
        className="mt-8 inline-block bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition"
      >
        Browse Cars
      </Link>
    </section>
  );
}
