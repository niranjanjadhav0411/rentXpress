import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkStyle =
    "px-4 py-2 rounded-lg text-sm font-medium transition hover:text-cyan-400";

  const activeStyle = "text-cyan-400";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully 👋");
    navigate("/");
  };

  return (
    <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink
            to="/"
            className="text-2xl font-bold text-cyan-400 flex items-center gap-2"
          >
            🚗 RentXpress
          </NavLink>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : "text-white"}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/cars"
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeStyle : "text-white"}`
              }
            >
              Cars
            </NavLink>

            {user && (
              <NavLink
                to="/my-bookings"
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeStyle : "text-white"}`
                }
              >
                Bookings
              </NavLink>
            )}

            {!user ? (
              <>
                <NavLink
                  to="/login"
                  className="px-4 py-2 border border-gray-700 rounded-lg text-white hover:border-cyan-400 transition"
                >
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition"
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition"
              >
                Logout
              </button>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <NavLink to="/" className="block text-white">
              Home
            </NavLink>

            <NavLink to="/cars" className="block text-white">
              Cars
            </NavLink>

            {user && (
              <NavLink to="/my-bookings" className="block text-white">
                Bookings
              </NavLink>
            )}

            {!user ? (
              <>
                <NavLink to="/login" className="block text-white">
                  Login
                </NavLink>

                <NavLink to="/register" className="block text-cyan-400">
                  Sign Up
                </NavLink>
              </>
            ) : (
              <button onClick={handleLogout} className="block text-red-400">
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
