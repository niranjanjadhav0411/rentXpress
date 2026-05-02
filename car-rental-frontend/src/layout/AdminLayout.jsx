import { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import { Outlet } from "react-router-dom";

function applyTheme(theme) {
  const root = document.documentElement;
  // Remove both, then add the correct one
  root.classList.remove("dark", "light");
  root.classList.add(theme);
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--surface)", color: "var(--text-primary)" }}
    >
      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar setOpen={setOpen} toggleTheme={toggleTheme} theme={theme} />

        <main
          className="flex-1 overflow-y-auto"
          style={{ background: "var(--surface)" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
