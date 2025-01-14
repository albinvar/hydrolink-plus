import express from "express";
import { getDevices, addDevice } from "../services/supabase.js";

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

export default router;
