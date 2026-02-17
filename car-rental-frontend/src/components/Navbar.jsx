import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const linkBase =
    "px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-800";

  const handleLogout = () => {
    logout();
    toast.success("Logout successful 👋");
    navigate("/login");
  };

  return (
    <header className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <NavLink to="/" className="text-xl font-bold text-cyan-400">
            🚗 Car Rental Booking System
          </NavLink>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={linkBase}>
              Home
            </NavLink>
            <NavLink to="/cars" className={linkBase}>
              Cars
            </NavLink>

            {user && (
              <NavLink to="/my-bookings" className={linkBase}>
                My Bookings
              </NavLink>
            )}

            {!user ? (
              <>
                <NavLink to="/login" className={linkBase}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500"
                >
                  Register
                </NavLink>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-medium"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
