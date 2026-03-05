import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import api from "../../services/api";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnread();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch (e) {
      console.error("Notification fetch error");
    }
  };

  const fetchUnread = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnread(res.data || 0);
    } catch (e) {
      console.error("Unread count error");
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
      fetchUnread();
    } catch (e) {
      console.error("Mark read error");
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* 🔔 Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-white hover:text-cyan-400 transition"
      >
        <Bell size={22} />

        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-xs px-2 py-0.5 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50">
          <div className="p-4 border-b border-gray-800 font-semibold text-white">
            Notifications
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="p-4 text-gray-500">No notifications</div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 text-sm cursor-pointer border-b border-gray-800 hover:bg-gray-800 ${
                  !n.readStatus ? "bg-gray-800/40" : ""
                }`}
              >
                {n.message}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
