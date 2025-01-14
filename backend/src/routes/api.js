import express from "express";
import { getDevices, addDevice } from "../services/supabase.js";

const router = express.Router();

router.get("/devices", async (req, res) => {
  try {
    const devices = await getDevices();
    res.json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ error: "Failed to fetch devices." });
  }
});

router.post("/devices", async (req, res) => {
  try {
    const { device_id, secret_key } = req.body;
    const result = await addDevice(device_id, secret_key);
    res.json(result);
  } catch (error) {
    console.error("Error adding device:", error);
    res.status(500).json({ error: "Failed to add device." });
  }
});

export default router;
