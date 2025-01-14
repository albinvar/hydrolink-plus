import { WebSocketServer } from "ws";
import {
  handleWebSocketMessage,
  handleAuthentication,
} from "./websocketHandlers.js";
import {
  addConnectedDevice,
  removeConnectedDevice,
} from "./connectedDevices.js";

export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  console.log("WebSocket server initialized.");

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection.");

    let isAuthenticated = false;

    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);

        // Authenticate the device before allowing any other messages
        if (!isAuthenticated && parsedMessage.type === "authenticate") {
          const { deviceId, secret_key } = parsedMessage.payload;

          // Authenticate the device
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

        // Reject unauthorized connections
        if (!isAuthenticated) {
          ws.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
          ws.close();
          return;
        }

        // Route authenticated messages to handlers
        handleWebSocketMessage(ws, parsedMessage);
      } catch (error) {
        console.error("Invalid WebSocket message:", error.message);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" })
        );
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed.");
      removeConnectedDevice(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error.message);
    });
  });

  return wss;
};
