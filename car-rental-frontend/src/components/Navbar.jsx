import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import NotificationBell from "./admin/NotificationBell";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
    setMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium tracking-wide transition-colors duration-200 py-1 ${
      isActive
        ? "text-gold-active"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--surface-1)]/95 backdrop-blur-xl border-b border-[var(--border)] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dim)] flex items-center justify-center shadow-lg group-hover:shadow-[var(--gold)]/30 transition-shadow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v2M9 17h8m-4-4l4 4-4 4M3 9h14"
                    stroke="#0a0a0f"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: "19px",
                  letterSpacing: "-0.01em",
                }}
                className="text-[var(--text-primary)]"
              >
                Rent<span className="text-gold">Xpress</span>
              </span>
            </NavLink>

            <nav className="hidden md:flex items-center gap-8">
              <NavLink to="/" end className={navLinkClass}>
                {({ isActive }) => (
                  <span
                    className={
                      isActive
                        ? "text-[var(--gold)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }
                    style={{ transition: "color 0.2s" }}
                  >
                    Home
                  </span>
                )}
              </NavLink>
              <NavLink to="/cars" className={navLinkClass}>
                {({ isActive }) => (
                  <span
                    className={
                      isActive
                        ? "text-[var(--gold)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }
                    style={{ transition: "color 0.2s" }}
                  >
                    Fleet
                  </span>
                )}
              </NavLink>
              {user && (
                <NavLink to="/my-bookings" className={navLinkClass}>
                  {({ isActive }) => (
                    <span
                      className={
                        isActive
                          ? "text-[var(--gold)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }
                      style={{ transition: "color 0.2s" }}
                    >
                      My Bookings
                    </span>
                  )}
                </NavLink>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <NavLink
                    to="/login"
                    className="px-5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="btn-gold px-5 py-2 text-sm rounded-lg"
                  >
                    Get Started
                  </NavLink>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <NotificationBell user={user} />
                  <div className="w-px h-5 bg-[var(--border)]" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-[var(--surface-2)] transition"
              aria-label="Toggle menu"
            >
              <span
                className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}
              />
              <span
                className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`w-5 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
              />
            </button>
          </div>
        </div>

        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="bg-[var(--surface-1)] border-t border-[var(--border)] px-6 py-6 space-y-1">
            {[
              { to: "/", label: "Home", end: true },
              { to: "/cars", label: "Fleet" },
              ...(user ? [{ to: "/my-bookings", label: "My Bookings" }] : []),
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-[var(--border)] mt-3">
              {!user ? (
                <div className="flex flex-col gap-2">
                  <NavLink
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl border border-[var(--border)] transition"
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="btn-gold block text-center px-4 py-3 text-sm rounded-xl"
                  >
                    Get Started
                  </NavLink>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <NotificationBell user={user} />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 rounded-xl hover:bg-red-500/10 transition"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="h-[72px]" />
    </>
  );
}
