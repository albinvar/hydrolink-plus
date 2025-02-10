// A map to track connected devices by device ID
const connectedDevices = new Map();

/**
 * ✅ Add a device to the connectedDevices map
 * @param {string} deviceId - Unique identifier of the device
 * @param {WebSocket} ws - WebSocket connection instance
 */
export const addConnectedDevice = (deviceId, ws) => {
  connectedDevices.set(deviceId, {
    ws,
    connectedAt: new Date().toISOString(),
    lastActive: Date.now(),
  });
  console.log(
    `Device added: ${deviceId} at ${connectedDevices.get(deviceId).connectedAt}`
  );
};

/**
 * ✅ Mark a device as alive when it responds to a ping
 * @param {WebSocket} ws - WebSocket connection instance
 */
export const markDeviceAlive = (ws) => {
  connectedDevices.forEach((device, deviceId) => {
    if (device.ws === ws) {
      device.lastActive = Date.now();
      console.log(`Device ${deviceId} marked as active.`);
    }
  });
};

/**
 * ✅ Remove a device from the connectedDevices map
 * @param {WebSocket} ws - WebSocket connection instance to remove
 */
export const removeConnectedDevice = (ws) => {
  connectedDevices.forEach((device, deviceId) => {
    if (device.ws === ws) {
      connectedDevices.delete(deviceId);
      console.log(`Device removed due to inactivity: ${deviceId}`);
    }
  });
};

/**
 * ✅ Get a list of all active WebSocket connections
 * @returns {Array} - List of active device IDs
 */
export const getActiveConnections = () => {
  return Array.from(connectedDevices.keys());
};

/**
 * ✅ Get detailed information on all active WebSocket connections
 * @returns {Array} - List of device info objects { deviceId, connectedAt, lastActive }
 */
export const getActiveConnectionsDetails = () => {
  return Array.from(connectedDevices.entries()).map(([deviceId, device]) => ({
    deviceId,
    connectedAt: device.connectedAt,
    lastActive: new Date(device.lastActive).toISOString(),
  }));
};

/**
 * ✅ Get the WebSocket instance for a connected device ID
 * @param {string} deviceId - The device ID
 * @returns {WebSocket|null} - WebSocket connection if found, else null
 */
export const getConnectedDevice = (deviceId) => {
  const device = connectedDevices.get(deviceId);
  return device ? device.ws : null;
};

/**
 * ✅ Get the device ID associated with a WebSocket instance
 * @param {WebSocket} ws - WebSocket connection instance
 * @returns {string|null} - Device ID or null if not found
 */
export const getConnectedDeviceId = (ws) => {
  for (const [deviceId, device] of connectedDevices.entries()) {
    if (device.ws === ws) {
      return deviceId;
    }
  }
  return null;
};
