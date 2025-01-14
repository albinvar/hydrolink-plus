import express from "express";
import { getDevices, addDevice } from "../services/supabase.js";

const router = express.Router();

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
 *               secret_key:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device added successfully
 *       400:
 *         description: Bad request
 */
router.post("/devices", async (req, res) => {
  try {
    const { device_id, secret_key } = req.body;
    const result = await addDevice(device_id, secret_key);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding device:", error);
    res.status(500).json({ error: "Failed to add device." });
  }
});

export default router;
