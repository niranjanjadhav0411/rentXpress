import { NavLink } from "react-router-dom";
import { LayoutDashboard, Car, Calendar } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/cars", label: "Fleet", icon: Car },
];

export default function Sidebar({ open, setOpen }) {
  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-30"
        />
      )}

      <aside
        className={`fixed lg:static z-40 w-[240px] h-full flex flex-col
          bg-[var(--surface-1)] border-r border-[var(--border)]
          transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dim)] flex items-center justify-center shadow-lg">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v2M9 17h8m-4-4l4 4-4 4M3 9h14"
                  stroke="#0a0a0f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p
                className="font-bold text-[var(--text-primary)] text-[15px]"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                RentXpress
              </p>
              <p className="text-[10px] text-[var(--gold)] font-medium tracking-widest uppercase">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <p
            className="text-[10px] font-semibold text-[var(--text-muted)] tracking-[0.15em] uppercase px-3 mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Navigation
          </p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={isActive ? "text-[var(--gold)]" : ""}
                  />
                  {label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-[var(--text-muted)]">
              System online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
