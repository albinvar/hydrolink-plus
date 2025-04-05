import express from "express";
import { getDevices, addDevice } from "../services/supabase.js";
import { requestDeviceInfo } from "../services/websocket.js";
import { getActiveConnections } from "../services/connectedDevices.js";
import { sendCommandToDevice } from "../services/websocket.js";
import { requestWaterQualityResults } from "../services/websocket.js";
import { controlValve } from "../services/websocket.js";
import { triggerOTAUpdate } from "../services/websocketHandlers.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: WebSocket
 *   description: WebSocket interactions for real-time communication
 *
 * components:
 *   schemas:
 *     RegisterMessage:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: Message type
 *           example: register
 *         payload:
 *           type: object
 *           properties:
 *             deviceId:
 *               type: string
 *               description: Unique identifier for the device
 *               example: device001
 *     SensorDataMessage:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: Message type
 *           example: sensor_data
 *         payload:
 *           type: object
 *           properties:
 *             deviceId:
 *               type: string
 *               description: Unique identifier for the device
 *               example: device001
 *             temperature:
 *               type: number
 *               description: Temperature reading from the device
 *               example: 25.5
 *             flowRate:
 *               type: number
 *               description: Water flow rate
 *               example: 3.2
 */

/**
 * @swagger
 * /api/websocket:
 *   get:
 *     tags: [WebSocket]
 *     summary: WebSocket server information
 *     description: |
 *       The WebSocket server is available at `ws://localhost:8080/`.
 *       Use the following message types to interact with the server:
 *       - **RegisterMessage**: Register a device.
 *       - **SensorDataMessage**: Send sensor data from a device.
 *     responses:
 *       200:
 *         description: Documentation for WebSocket server
 */
router.get("/websocket", (req, res) => {
  res.send("WebSocket server available at ws://" + req.headers.host);
});

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Retrieve all registered devices
 *     responses:
 *       200:
 *         description: A list of devices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   device_id:
 *                     type: string
 *                   secret_key:
 *                     type: string
 *                   registered_at:
 *                     type: string
 *                     format: date-time
 */
router.get("/devices", async (req, res) => {
  try {
    const devices = await getDevices();
    res.json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ error: "Failed to fetch devices." });
  }
});

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Add a new device
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device_id:
 *                 type: string
 *                 example: HLP001
 *     responses:
 *       201:
 *         description: Device added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     device_id:
 *                       type: string
 *                       example: HLP001
 *                     key:
 *                       type: string
 *                       example: a1b2c3d4e5f6g7h8
 *       400:
 *         description: Bad request
 */
router.post("/devices", async (req, res) => {
  try {
    const { device_id } = req.body;
    const result = await addDevice(device_id);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding device:", error);
    res.status(500).json({ error: "Failed to add device." });
  }
});

/**
 * @swagger
 * /api/websockets/active:
 *   get:
 *     summary: List all active WebSocket connections
 *     description: Returns a list of currently connected devices.
 *     responses:
 *       200:
 *         description: Successfully retrieved active WebSocket connections.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 active_connections:
 *                   type: array
 *                   example: ["HLP001", "HLP002"]
 */
router.get("/websockets/active", (req, res) => {
  try {
    const activeConnections = getActiveConnections();
    res.json({ active_connections: activeConnections });
  } catch (error) {
    console.error("Error fetching active WebSocket connections:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch active WebSocket connections." });
  }
});

/**
 * @swagger
 * /api/devices/{deviceId}/info:
 *   get:
 *     summary: Get live system details of an ESP32 device
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the device
 *     responses:
 *       200:
 *         description: Live system info of the ESP32 device
 *       404:
 *         description: Device not found
 *       500:
 *         description: Error retrieving device info
 */
router.get("/devices/:deviceId/info", async (req, res) => {
  try {
    const { deviceId } = req.params;

    // ✅ Debugging: Log active WebSocket connections
    console.log(`🔍 Active Devices:`, getActiveConnections());

    const deviceInfo = await requestDeviceInfo(deviceId);
    res.json(deviceInfo);
  } catch (error) {
    console.error(
      `❌ Error retrieving device info for ${req.params.deviceId}:`,
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/devices/{deviceId}/execute:
 *   post:
 *     summary: Send a command to an ESP32 device
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the device
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               command:
 *                 type: string
 *                 example: "restart"
 *     responses:
 *       200:
 *         description: Command executed successfully
 *       404:
 *         description: Device not found
 *       500:
 *         description: Error executing command
 */
router.post("/devices/:deviceId/execute", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { command } = req.body;

    const response = await sendCommandToDevice(deviceId, command);
    res.json(response);
  } catch (error) {
    console.error(
      `❌ Error executing command for ${req.params.deviceId}:`,
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/devices/{deviceId}/water-quality:
 *   get:
 *     summary: Get water quality results from an ESP32 device
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the device
 *     responses:
 *       200:
 *         description: Water quality results from the ESP32 device
 *       404:
 *         description: Device not found
 *       500:
 *         description: Error retrieving water quality data
 */
router.get("/devices/:deviceId/water-quality", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const waterQualityData = await requestWaterQualityResults(deviceId);
    res.json(waterQualityData);
  } catch (error) {
    console.error(
      `❌ Error retrieving water quality results for ${req.params.deviceId}:`,
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/devices/{deviceId}/valve:
 *   post:
 *     summary: Open or close the electromechanical valve
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the ESP32 device
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [open, close]
 *                 example: "open"
 *     responses:
 *       200:
 *         description: Valve operation successful
 *       404:
 *         description: Device not found
 *       500:
 *         description: Error controlling valve
 */
router.post("/devices/:deviceId/valve", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { action } = req.body;

    if (action !== "open" && action !== "close") {
      return res
        .status(400)
        .json({ error: "Invalid action. Use 'open' or 'close'." });
    }

    const response = await controlValve(deviceId, action === "open");
    res.json(response);
  } catch (error) {
    console.error(
      `❌ Error controlling valve for ${req.params.deviceId}:`,
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/devices/{deviceId}/ota:
 *   post:
 *     summary: Trigger OTA update on an ESP32 device
 *     description: Sends an OTA command with a firmware URL to a connected ESP32 via WebSocket.
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The device ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "http://yourserver.com/firmware.bin"
 *     responses:
 *       200:
 *         description: OTA command sent successfully
 *       404:
 *         description: Device not connected
 *       500:
 *         description: Error sending OTA command
 */
router.post("/devices/:deviceId/ota", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "OTA URL is required." });
    }

    const response = await triggerOTAUpdate(deviceId, url);
    res.json(response);
  } catch (error) {
    console.error(`❌ OTA error for ${req.params.deviceId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
