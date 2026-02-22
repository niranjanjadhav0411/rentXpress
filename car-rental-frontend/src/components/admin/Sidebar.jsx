import { NavLink } from "react-router-dom";
import { LayoutDashboard, Car, Calendar } from "lucide-react";

export default function Sidebar({ open, setOpen }) {
  const base = "flex items-center gap-3 px-4 py-2 rounded-lg transition-all";

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static z-40 w-64 h-full bg-[#0b1120] transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-6 text-xl font-bold border-b border-gray-700 text-indigo-500">
          DriveOn Admin
        </div>

        <nav className="p-4 space-y-3">
          <NavLink
            to="/admin"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${base} ${isActive ? "bg-indigo-600" : "hover:bg-gray-800"}`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/bookings"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${base} ${isActive ? "bg-indigo-600" : "hover:bg-gray-800"}`
            }
          >
            <Calendar size={18} />
            Bookings
          </NavLink>

          <NavLink
            to="/admin/cars"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `${base} ${isActive ? "bg-indigo-600" : "hover:bg-gray-800"}`
            }
          >
            <Car size={18} />
            Cars
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
