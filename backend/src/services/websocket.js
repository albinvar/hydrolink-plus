import { WebSocketServer } from "ws";
import crypto from "crypto";
import { verifyDeviceSecretKey } from "./supabase.js"; // Import the verification function from Supabase service

// A map to track connected devices by device ID
const connectedDevices = new Map();

export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  console.log("WebSocket server initialized.");

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection.");

    let isAuthenticated = false;

    // Handle incoming messages
    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);

        // Authenticate the device before allowing any other messages
        if (!isAuthenticated && parsedMessage.type === "authenticate") {
          const { deviceId, secret_key } = parsedMessage.payload;

          // Verify the device secret_key
          const isValid = await verifyDeviceSecretKey(deviceId, secret_key);
          if (isValid) {
            console.log(`Device authenticated: ${deviceId}`);
            connectedDevices.set(deviceId, ws);
            isAuthenticated = true;
            ws.send(JSON.stringify({ type: "auth_ack", success: true }));
          } else {
            console.warn(`Authentication failed for device: ${deviceId}`);
            ws.send(JSON.stringify({ type: "auth_ack", success: false }));
            ws.close(); // Close connection on failed authentication
          }
          return;
        }

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
      connectedDevices.forEach((value, key) => {
        if (value === ws) connectedDevices.delete(key);
      });
    });

    // Handle connection errors
    ws.on("error", (error) => {
      console.error("WebSocket error:", error.message);
    });
  });

  return wss;
};

// Handle WebSocket messages
const handleWebSocketMessage = (ws, message) => {
  switch (message.type) {
    case "sensor_data": {
      const { deviceId, temperature, flowRate } = message.payload;
      console.log(
        `Received data from ${deviceId}: Temperature=${temperature}, FlowRate=${flowRate}`
      );
      ws.send(JSON.stringify({ type: "data_ack", success: true }));
      break;
    }

    default:
      ws.send(
        JSON.stringify({ type: "error", message: "Unknown message type" })
      );
      break;
  }
};
