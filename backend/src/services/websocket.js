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

        // ✅ Authentication Handling
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

        // ✅ Heartbeat Handling
        if (parsedMessage.type === "heartbeat_response") {
          ws.isAlive = true;
          console.log(
            `🔄 Heartbeat received from ${ws.deviceId}, keeping connection alive.`
          );
          return;
        }

        // ✅ Device Info Handling
        if (parsedMessage.type === "device_info_response") {
          console.log(
            `📡 Received device info from ${ws.deviceId}:`,
            parsedMessage.payload
          );
          ws.deviceInfo = parsedMessage.payload;

          if (ws.pendingDeviceInfoCallback) {
            ws.pendingDeviceInfoCallback(parsedMessage.payload);
            ws.pendingDeviceInfoCallback = null;
          }
          return;
        }

        // ✅ Water Quality Response Handling
        if (parsedMessage.type === "water_quality_results") {
          console.log(
            `💧 Water Quality Data from ${ws.deviceId}:`,
            parsedMessage.payload
          );
          return;
        }

        // ✅ Valve Control Response
        if (parsedMessage.type === "valve_control_response") {
          console.log(
            `🚰 Valve Control Response from ${ws.deviceId}:`,
            parsedMessage.payload
          );
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

    // Timeout after 5 seconds
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

    setTimeout(() => {
      ws.removeListener("message", handleMessage);
      reject(new Error(`Device ${deviceId} did not respond`));
    }, 5000);
  });
};

/**
 * ✅ Sends an open or close valve command to the ESP32
 * @param {string} deviceId - The ESP32 device ID
 * @param {boolean} open - `true` to open valve, `false` to close it
 * @returns {Promise<Object>} - Command execution response
 */
export const controlValve = (deviceId, open) => {
  return new Promise((resolve, reject) => {
    const ws = getConnectedDevice(deviceId);
    if (!ws) {
      return reject(new Error(`Device ${deviceId} not connected`));
    }

    const commandType = open ? "open_valve" : "close_valve";
    console.log(`🚰 Sending valve command to ${deviceId}: ${commandType}`);

    // ✅ Listen for valve control response
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
    ws.send(JSON.stringify({ type: commandType }));

    // Timeout after 5 seconds if no response
    setTimeout(() => {
      ws.removeListener("message", handleMessage);
      reject(new Error(`Device ${deviceId} did not respond to valve command`));
    }, 5000);
  });
};

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
