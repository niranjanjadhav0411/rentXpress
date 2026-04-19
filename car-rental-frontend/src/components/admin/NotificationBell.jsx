import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import api from "../../services/api";
import { connectSocket } from "../../context/useSocket";
import { toast } from "react-toastify";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.readStatus).length;

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    connectSocket(user.email, user.role, (message) => {
      toast.success(message);
      setNotifications((prev) => [
        {
          id: Date.now(),
          message,
          readStatus: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    });
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch {}
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n)),
      );
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      const unreadItems = notifications.filter((n) => !n.readStatus);
      await Promise.all(
        unreadItems.map((n) => api.put(`/notifications/${n.id}/read`)),
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    } catch {}
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--surface-2)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-[var(--gold)] text-[var(--surface)] text-[9px] font-bold rounded-full shadow">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-3 w-[340px] sm:w-[380px] bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-up">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3
                  className="font-semibold text-[var(--text-primary)] text-sm"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Notifications
                </h3>
                {unread > 0 && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {unread} unread
                  </p>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[var(--gold)] hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                  <Bell size={28} className="mb-3 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`px-5 py-4 border-b border-[var(--border)] cursor-pointer transition-all duration-200 flex gap-3 ${
                      !n.readStatus
                        ? "bg-[var(--gold)]/5 hover:bg-[var(--gold)]/8"
                        : "hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {/* Dot */}
                    <div className="mt-1.5 shrink-0">
                      <div
                        className={`w-2 h-2 rounded-full ${!n.readStatus ? "bg-[var(--gold)]" : "bg-transparent"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-relaxed ${!n.readStatus ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}`}
                      >
                        {n.message}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-t border-[var(--border)] text-center">
                <p className="text-xs text-[var(--text-muted)]">
                  {notifications.length} total notification
                  {notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
