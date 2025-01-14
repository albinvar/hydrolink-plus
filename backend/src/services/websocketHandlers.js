import { verifyDeviceSecretKey } from "./supabase.js";
import { removeConnectedDevice } from "./connectedDevices.js";

// Handle authentication
export const handleAuthentication = async (parsedMessage, ws) => {
  const { deviceId, secret_key } = parsedMessage.payload;

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
