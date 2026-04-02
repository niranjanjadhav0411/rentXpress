import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let isConnecting = false;

export const connectSocket = (email, role, callback) => {
  if (stompClient && stompClient.connected) {
    return stompClient;
  }

  if (isConnecting) return;

  isConnecting = true;

  const socket = new SockJS("http://localhost:8081/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("WebSocket Connected");

      // ================= USER TOPIC =================
      if (email && role === "USER") {
        stompClient.subscribe(`/topic/user/${email}`, (msg) => {
          callback && callback(msg.body);
        });
      }

      // ================= ADMIN TOPIC =================
      if (role === "ADMIN") {
        stompClient.subscribe("/topic/admin", (msg) => {
          callback && callback(msg.body);
        });
      }
    },

    onStompError: (frame) => {
      console.error("STOMP error:", frame);
      isConnecting = false;
    },

    onWebSocketClose: () => {
      console.log("WebSocket Closed");
      isConnecting = false;
    },

    onWebSocketError: (err) => {
      console.error("WebSocket error:", err);
      isConnecting = false;
    },
  });

  stompClient.activate();
  return stompClient;
};

export const disconnectSocket = () => {
  if (stompClient && stompClient.connected) {
    stompClient.deactivate();
    stompClient = null;
    console.log("WebSocket Disconnected");
  }
};
