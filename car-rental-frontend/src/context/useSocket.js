import { Client } from "@stomp/stompjs";

export const connectAdminSocket = (onMessage) => {
  const client = new Client({
    brokerURL: "ws://localhost:8081/ws",
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    client.subscribe("/topic/admin", (message) => {
      onMessage(message.body);
    });
  };

  client.activate();
};

export const connectUserSocket = (email, onMessage) => {
  const client = new Client({
    brokerURL: "ws://localhost:8081/ws",
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    client.subscribe(`/topic/user/${email}`, (message) => {
      onMessage(message.body);
    });
  };

  client.activate();
};
