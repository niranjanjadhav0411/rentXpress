import { Menu, LogOut, Sun, Moon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Topbar({ setOpen, toggleTheme, theme }) {
  const [dropdown, setDropdown] = useState(false);
  const { logout, user } = useAuth();
  const initial = user?.email?.charAt(0).toUpperCase() || "A";

  return (
    <header className="flex items-center justify-between px-6 h-[64px] bg-[var(--surface-1)] border-b border-[var(--border)] relative z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--surface-2)] transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <Menu size={18} />
        </button>

        <div className="hidden sm:block">
          <p className="text-xs text-[var(--text-muted)]">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationBell user={user} />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--surface-2)] transition text-[var(--text-secondary)] hover:text-[var(--gold)]"
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="w-px h-5 bg-[var(--border)]" />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdown(!dropdown)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--surface-2)] transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dim)] flex items-center justify-center text-sm font-bold text-[var(--surface)] shadow">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p
                className="text-xs font-semibold text-[var(--text-primary)] leading-none"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-[var(--gold)] mt-0.5">
                Administrator
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-[var(--text-muted)] transition-transform duration-200 ${dropdown ? "rotate-180" : ""}`}
            />
          </button>

          {dropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl shadow-2xl z-20 p-1.5 animate-fade-up">
                <div className="px-3 py-2.5 border-b border-[var(--border)] mb-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                    {user?.email}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Signed in as Admin
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
