import { Menu, LogOut, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ setOpen, toggleTheme, theme }) {
  const [dropdown, setDropdown] = useState(false);
  const { logout, user } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#0b1120] dark:bg-gray-900 border-b border-gray-700 relative">
      {/* Mobile Menu */}
      <button onClick={() => setOpen(true)} className="lg:hidden">
        <Menu />
      </button>

      <h1 className="text-lg font-semibold">Admin Panel</h1>

      <div className="flex items-center gap-4 relative">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-700"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile */}
        <div className="relative">
          <div
            onClick={() => setDropdown(!dropdown)}
            className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer"
          >
            {user?.email?.charAt(0).toUpperCase()}
          </div>

          {dropdown && (
            <div className="absolute right-0 mt-3 w-40 bg-gray-800 rounded-lg shadow-lg p-2">
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700 rounded-lg text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
