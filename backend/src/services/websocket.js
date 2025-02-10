import { WebSocketServer } from "ws";
import {
  addConnectedDevice,
  removeConnectedDevice,
  getConnectedDevice,
} from "./connectedDevices.js";
import { handleAuthentication } from "./websocketHandlers.js";

const PING_INTERVAL = 300; // Server requests heartbeat every 30 seconds

export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  console.log("🌐 WebSocket server initialized.");

  wss.on("connection", (ws) => {
    console.log("🔌 New WebSocket connection.");
    ws.isAlive = true;
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
            console.log(`✅ Device authenticated: ${deviceId}`);
          } else {
            ws.close();
          }
          return;
        }

        if (parsedMessage.type === "heartbeat_response") {
          ws.isAlive = true;
          console.log(
            `🔄 Heartbeat received from ${ws.deviceId}, keeping connection alive.`
          );
          return;
        }

        // ✅ Store device info when received
        if (parsedMessage.type === "device_info_response") {
          console.log(
            `📡 Received device info from ${ws.deviceId}:`,
            parsedMessage.payload
          );
          ws.deviceInfo = parsedMessage.payload;

          // ✅ Resolve pending device info requests
          if (ws.pendingDeviceInfoCallback) {
            ws.pendingDeviceInfoCallback(parsedMessage.payload);
            ws.pendingDeviceInfoCallback = null; // Clear callback
          }
          return;
        }
      } catch (error) {
        console.error("⚠️ Invalid WebSocket message (ignored):", message);
      }
    });

    ws.on("close", () => {
      console.log(
        `❌ WebSocket connection closed for ${ws.deviceId || "Unknown"}`
      );
      removeConnectedDevice(ws);
    });

    ws.on("error", (error) => {
      console.error("⚠️ WebSocket error:", error.message);
    });
  });

  return wss;
};

/**
 * ✅ Send a command to an ESP32 device using WebSocket
 * @param {string} deviceId - The device ID
 * @param {string} command - The command to execute
 * @returns {Promise<Object>} - Command execution response
 */
export const sendCommandToDevice = (deviceId, command) => {
  return new Promise((resolve, reject) => {
    const ws = getConnectedDevice(deviceId);
    if (!ws) {
      return reject(new Error(`Device ${deviceId} not connected`));
    }

    // ✅ Listen for command_response from the ESP32
    const handleMessage = (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        if (
          parsedMessage.type === "command_response" &&
          parsedMessage.deviceId === deviceId
        ) {
          ws.removeListener("message", handleMessage);
          resolve(parsedMessage);
        }
      } catch (error) {
        reject(error);
      }
    };

    ws.on("message", handleMessage);
    ws.send(JSON.stringify({ type: "command_request", payload: { command } }));

    // Timeout after 5 seconds if no response
    setTimeout(() => {
      ws.removeListener("message", handleMessage);
      reject(new Error(`Device ${deviceId} did not respond`));
    }, 5000);
  });
};

/**
 * ✅ Request water quality results from an ESP32 device using WebSocket
 * @param {string} deviceId - The device ID
 * @returns {Promise<Object>} - Water quality data
 */
export const requestWaterQualityResults = (deviceId) => {
  return new Promise((resolve, reject) => {
    const ws = getConnectedDevice(deviceId);
    if (!ws) {
      return reject(new Error(`Device ${deviceId} not connected`));
    }

    // ✅ Listen for water_quality_results response from the ESP32
    const handleMessage = (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        if (
          parsedMessage.type === "water_quality_results" &&
          parsedMessage.payload.deviceId === deviceId
        ) {
          ws.removeListener("message", handleMessage);
          resolve(parsedMessage.payload);
        }
      } catch (error) {
        reject(error);
      }
    };

    ws.on("message", handleMessage);
    ws.send(JSON.stringify({ type: "get_water_quality_results" }));

    // Timeout after 5 seconds if no response
    setTimeout(() => {
      ws.removeListener("message", handleMessage);
      reject(new Error(`Device ${deviceId} did not respond`));
    }, 5000);
  });
};

/**
 * ✅ Request device info from an ESP32 device
 */
export const requestDeviceInfo = (deviceId) => {
  return new Promise((resolve, reject) => {
    const ws = getConnectedDevice(deviceId);
    if (!ws) {
      return reject(new Error(`Device ${deviceId} not connected`));
    }

    // ✅ Store the callback so that `device_info_response` can resolve this promise
    ws.pendingDeviceInfoCallback = resolve;

    ws.send(JSON.stringify({ type: "device_info_request" }));

    // Timeout after 5 seconds if no response
    setTimeout(() => {
      if (ws.pendingDeviceInfoCallback) {
        ws.pendingDeviceInfoCallback = null;
        reject(new Error(`Device ${deviceId} did not respond`));
      }
    }, 5000);
  });
};
