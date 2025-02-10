import { verifyDeviceSecretKey } from "./supabase.js";
import { getConnectedDeviceId } from "./connectedDevices.js";

// Handle authentication
export const handleAuthentication = async (deviceId, secret_key, ws) => {
  if (!deviceId || !secret_key) {
    console.error("Authentication failed: Missing deviceId or secret_key.");
    ws.send(
      JSON.stringify({
        type: "auth_ack",
        success: false,
        message: "Missing deviceId or secret_key.",
      })
    );
    return false;
  }

  const isValid = await verifyDeviceSecretKey(deviceId, secret_key);
  if (isValid) {
    console.log(`Device authenticated: ${deviceId}`);
    ws.deviceId = deviceId; // Attach deviceId to WebSocket instance
    ws.send(JSON.stringify({ type: "auth_ack", success: true }));
    return true;
  } else {
    console.warn(`Authentication failed for device: ${deviceId}`);
    ws.send(
      JSON.stringify({
        type: "auth_ack",
        success: false,
        message: "Invalid deviceId or secret_key.",
      })
    );
    return false;
  }
};

// Handle authenticated messages
export const handleWebSocketMessage = (ws, message) => {
  const deviceId = ws.deviceId; // Retrieve deviceId stored during authentication

  switch (message.type) {
    case "sensor_data": {
      const { temperature, flowRate } = message.payload;
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
