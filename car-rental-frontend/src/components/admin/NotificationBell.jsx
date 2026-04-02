import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import api from "../../services/api";
import { connectSocket } from "../../context/useSocket";
import { toast } from "react-toastify";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const unread = notifications.filter((n) => !n.readStatus).length;

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    connectSocket(user.email, user.role, (message) => {
      toast.success(message);

      const newNotification = {
        id: Date.now(),
        message,
        readStatus: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
    });
  }, [user]);

  // ================= FETCH =================

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= MARK SINGLE =================

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ================= MARK ALL =================

  const markAllAsRead = async () => {
    try {
      const unreadItems = notifications.filter((n) => !n.readStatus);

      await Promise.all(
        unreadItems.map((n) => api.put(`/notifications/${n.id}/read`)),
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-white hover:text-cyan-400 transition"
      >
        <Bell size={22} />

        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-4 w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-white font-semibold text-lg">Notifications</h2>

            {unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-cyan-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-gray-400 text-center">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 border-b border-gray-800 cursor-pointer transition ${
                    !n.readStatus
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <p className="text-white text-sm font-medium">{n.message}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
