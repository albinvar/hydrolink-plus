import { WebSocketServer } from "ws";
import {
  handleWebSocketMessage,
  handleAuthentication,
} from "./websocketHandlers.js";
import {
  addConnectedDevice,
  removeConnectedDevice,
  markDeviceAlive,
} from "./connectedDevices.js";

const PING_INTERVAL = 30000; // Send a ping every 30 seconds
const PING_TIMEOUT = 2 * PING_INTERVAL; // 60 seconds timeout for missing pong

export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  console.log("WebSocket server initialized.");

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection.");

    let isAuthenticated = false;

    ws.isAlive = true;

    // Handle incoming messages
    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);

        // Authenticate the device
        if (!isAuthenticated && parsedMessage.type === "authenticate") {
          const { deviceId, secret_key } = parsedMessage.payload;

          const isAuthenticatedDevice = await handleAuthentication(
            deviceId,
            secret_key,
            ws
          );
          if (isAuthenticatedDevice) {
            isAuthenticated = true;
            addConnectedDevice(deviceId, ws);
          } else {
            ws.close();
          }
          return;
        }

        // Mark the device as alive if it responds
        markDeviceAlive(ws);

        // Reject unauthorized connections
        if (!isAuthenticated) {
          ws.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
          ws.close();
          return;
        }

        // Handle authenticated messages
        handleWebSocketMessage(ws, parsedMessage);
      } catch (error) {
        console.error("Invalid WebSocket message:", error.message);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" })
        );
      }
    });

    // Handle connection close
    ws.on("close", () => {
      console.log("WebSocket connection closed.");
      removeConnectedDevice(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error.message);
    });

    ws.on("pong", () => {
      markDeviceAlive(ws);
    });
  });

  // Periodic ping to check if the clients are alive
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log("Client unresponsive, closing connection.");
        ws.terminate();
      } else {
        ws.isAlive = false;
        ws.ping();
      }
    });
  }, PING_INTERVAL);

  return wss;
};
