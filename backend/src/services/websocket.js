import { WebSocketServer } from "ws";

// A map to track connected devices by device ID
const connectedDevices = new Map();

export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  console.log("WebSocket server initialized.");

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection.");

    // Handle incoming messages
    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message);
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
      // Remove device from connected devices map
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
    case "register": {
      const { deviceId } = message.payload;
      if (deviceId) {
        connectedDevices.set(deviceId, ws);
        console.log(`Device registered: ${deviceId}`);
        ws.send(
          JSON.stringify({
            type: "register_ack",
            success: true,
            message: `Device ${deviceId} registered successfully`,
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Missing deviceId in registration",
          })
        );
      }
      break;
    }

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
