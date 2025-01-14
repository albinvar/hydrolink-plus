// A map to track connected devices by device ID
const connectedDevices = new Map();

// Add a device to the connectedDevices map
export const addConnectedDevice = (deviceId, ws) => {
  connectedDevices.set(deviceId, ws);
  console.log(`Device added: ${deviceId}`);
};

// Remove a device from the connectedDevices map
export const removeConnectedDevice = (ws) => {
  connectedDevices.forEach((value, key) => {
    if (value === ws) {
      connectedDevices.delete(key);
      console.log(`Device removed: ${key}`);
    }
  });
};

// Get the deviceId for a WebSocket instance
export const getConnectedDeviceId = (ws) => {
  for (const [deviceId, connection] of connectedDevices.entries()) {
    if (connection === ws) {
      return deviceId;
    }
  }
  return null;
};
