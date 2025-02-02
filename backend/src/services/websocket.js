import { WebSocketServer } from "ws";
import {
  handleWebSocketMessage,
  handleAuthentication,
} from "./websocketHandlers.js";
import {
  addConnectedDevice,
  removeConnectedDevice,
} from "./connectedDevices.js";

const PING_INTERVAL = 30000; // Send heartbeat request every 30 seconds

export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  console.log("WebSocket server initialized.");

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection.");
    ws.isAlive = true; // ✅ Mark connection as alive immediately
    let isAuthenticated = false;

    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);

        if (!isAuthenticated && parsedMessage.type === "authenticate") {
          const { deviceId, secret_key } = parsedMessage.payload;

          const isAuthenticatedDevice = await handleAuthentication(
            deviceId,
            secret_key,
            ws
          );
          if (isAuthenticatedDevice) {
            isAuthenticated = true;
            ws.deviceId = deviceId;
            addConnectedDevice(deviceId, ws);
          } else {
            ws.close();
          }
          return;
        }

        // ✅ Correctly mark the connection as alive when receiving a heartbeat response
        if (parsedMessage.type === "heartbeat_response") {
          ws.isAlive = true;
          console.log(
            `🔄 Heartbeat received from ${ws.deviceId}, keeping connection alive.`
          );
          return;
        }

        handleWebSocketMessage(ws, parsedMessage);
      } catch (error) {
        console.error("⚠️ Invalid WebSocket message (ignored):", message);
      }
    });

    ws.on("close", () => {
      console.log(
        `WebSocket connection closed for ${ws.deviceId || "Unknown"}`
      );
      removeConnectedDevice(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error.message);
    });
  });

  // ✅ Periodically request heartbeats from ESP32
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log(
          `Client ${ws.deviceId || "Unknown"} unresponsive, closing connection.`
        );
        removeConnectedDevice(ws);
        ws.terminate();
      } else {
        ws.isAlive = false;
        ws.send(JSON.stringify({ type: "heartbeat_request" }));
      }
    });
  }, PING_INTERVAL);

  return wss;
};
