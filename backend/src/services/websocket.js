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

        // Handle authentication
        if (!isAuthenticated && parsedMessage.type === "authenticate") {
          const isAuthenticatedDevice = await handleAuthentication(
            parsedMessage,
            ws
          );
          if (isAuthenticatedDevice) {
            isAuthenticated = true;
            addConnectedDevice(parsedMessage.payload.deviceId, ws);
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
