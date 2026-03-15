import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL = "http://localhost:8081";

/* ================= USER SOCKET ================= */
export const connectSocket = (email, callback) => {
  const token = localStorage.getItem("token");

  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
  });

  socket.on("connect", () => {
    console.log("User socket connected:", socket.id);
    socket.emit("userJoin", email);
  });

  socket.on("notification", (message) => {
    if (callback) callback(message);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket error:", err.message);
  });

  return socket;
};

/* ================= ADMIN SOCKET ================= */
export const connectAdminSocket = (email, callback) => {
  const token = localStorage.getItem("token");

  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
  });

  socket.on("connect", () => {
    console.log("Admin socket connected:", socket.id);
    socket.emit("adminJoin", email || "admin");
  });

  // socket.on("notification", (message) => {
  //   if (callback) callback(message);
  // });

  socket.on("connect_error", (err) => {
    console.error("Socket error:", err.message);
  });

  return socket;
};

/* ================= DISCONNECT ================= */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
