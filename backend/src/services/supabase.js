import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Generate a random 16-character secret key
const generateDeviceSecretKey = () => crypto.randomBytes(8).toString("hex");

// Fetch all devices
export const getDevices = async () => {
  try {
    const { data, error } = await supabase.from("devices").select("*");
    if (error) {
      console.error("Error fetching devices:", error);
      throw new Error("Supabase: Unable to fetch devices");
    }
    return data;
  } catch (err) {
    console.error("Error in getDevices:", err.message);
    throw err;
  }
};

// Add a new device with a randomly generated secret_key
export const addDevice = async (device_id) => {
  const secret_key = generateDeviceSecretKey(); // Generate a unique secret key
  try {
    const { data, error } = await supabase
      .from("devices")
      .insert([{ device_id, secret_key }]);
    if (error) {
      console.error("Error adding device:", error);
      throw new Error("Supabase: Unable to add device");
    }
    return { success: true, data: { device_id, secret_key } };
  } catch (err) {
    console.error("Error in addDevice:", err.message);
    throw err;
  }
};

// Verify a device's secret key
export const verifyDeviceSecretKey = async (device_id, secret_key) => {
  try {
    const { data, error } = await supabase
      .from("devices")
      .select("id")
      .eq("device_id", device_id)
      .eq("secret_key", secret_key)
      .single();

    if (error || !data) {
      console.error(
        `Device key verification failed for device: ${device_id}`,
        error
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in verifyDeviceSecretKey:", err.message);
    return false;
  }
};
