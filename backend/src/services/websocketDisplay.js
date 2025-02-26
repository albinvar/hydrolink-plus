import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { verifyDeviceSecretKey } from "./supabase.js";

dotenv.config();

const connectedDisplays = new Map(); // Store active display WebSocket connections per device

/**
 * ✅ Start a separate WebSocket server for ESP32 displays
 * @param {number} port - The port number to run the display WebSocket server
 */
export const startDisplayWebSocketServer = (port) => {
  const wss = new WebSocketServer({ port });

  console.log(`📺 ESP32 Display WebSocket running on port ${port}`);

  wss.on("connection", (ws) => {
    console.log("📡 New ESP32 display connected.");
    let isAuthenticated = false;
    let deviceId = null;

    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log("📩 Received WebSocket Message:", parsedMessage); // ✅ Debugging log

        // ✅ Authentication Handling
        if (parsedMessage.type === "authenticate") {
          if (
            !parsedMessage.payload ||
            !parsedMessage.payload.deviceId ||
            !parsedMessage.payload.secret_key
          ) {
            console.error(
              "❌ Authentication failed: Missing `deviceId` or `secret_key` in payload."
            );
            ws.send(
              JSON.stringify({
                type: "auth_ack",
                success: false,
                message: "Invalid credentials.",
              })
            );
            return;
          }

          const { deviceId: receivedDeviceId, secret_key } =
            parsedMessage.payload;
          console.log(
            `🔑 Authenticating Display for device: ${receivedDeviceId}`
          );

          // ✅ Check device authentication
          const isValid = await verifyDeviceSecretKey(
            receivedDeviceId,
            secret_key
          );
          if (isValid) {
            isAuthenticated = true;
            deviceId = receivedDeviceId;
            connectedDisplays.set(deviceId, ws); // Store connection under device ID
            console.log(`✅ Display authenticated for meter: ${deviceId}`);
            ws.send(JSON.stringify({ type: "auth_ack", success: true }));
          } else {
            console.warn(`❌ Authentication failed for display: ${deviceId}`);
            ws.send(
              JSON.stringify({
                type: "auth_ack",
                success: false,
                message: "Invalid credentials.",
              })
            );
            ws.close();
          }
          return;
        }

        // ✅ Message Handling After Authentication
        if (!isAuthenticated) {
          console.warn("❌ Unauthorized device tried sending a message!");
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Unauthorized. Please authenticate first.",
            })
          );
          return;
        }

        // ✅ Handle `meter_update` messages properly
        if (parsedMessage.type === "meter_update") {
          console.log(
            `🔄 Meter update received for ${deviceId}:`,
            parsedMessage
          );

          // ✅ Send update to the respective ESP32 display
          sendUpdateToDisplay(deviceId, {
            deviceId,
            type: "meter_update",
            timestamp: new Date().toISOString(),
          });

          ws.send(
            JSON.stringify({
              type: "ack",
              success: true,
              message: "Meter update processed.",
            })
          );
          return;
        }

        // ✅ Handle `valve_control_response` messages
        if (parsedMessage.type === "valve_control_response") {
          console.log(
            `🚰 Valve control update received for ${deviceId}:`,
            parsedMessage
          );

          sendUpdateToDisplay(deviceId, {
            deviceId,
            type: "valve_control_response",
            payload: parsedMessage.payload,
            timestamp: new Date().toISOString(),
          });

          ws.send(
            JSON.stringify({
              type: "ack",
              success: true,
              message: "Valve update processed.",
            })
          );
          return;
        }

        console.warn("⚠️ Unrecognized message type:", parsedMessage.type);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message type." })
        );
      } catch (error) {
        console.error(
          "⚠️ Invalid WebSocket message (ignored):",
          message,
          "Error:",
          error.message
        );
      }
    });

    ws.on("close", () => {
      if (deviceId) {
        console.log(`❌ Display disconnected for meter: ${deviceId}`);
        connectedDisplays.delete(deviceId);
      }
    });

    ws.on("error", (error) => {
      console.error("⚠️ WebSocket error:", error.message);
    });
  });

  return wss;
};

/**
 * ✅ Send a meter update only to the respective ESP32 display
 * @param {string} deviceId - The meter ID for which to send an update
 * @param {Object} updateData - Data containing meter changes
 */
export const sendUpdateToDisplay = (deviceId, updateData) => {
  const ws = connectedDisplays.get(deviceId);
  console.log("📡 Active display connections:", connectedDisplays.size);
  if (ws && ws.readyState === ws.OPEN) {
    console.log(`📢 Sending update to display for meter: ${deviceId}`);
    ws.send(JSON.stringify(updateData));
  } else {
    console.warn(
      `⚠️ No active display connection found for meter: ${deviceId}`
    );
  }
};
