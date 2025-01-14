import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Fetch all devices
export const getDevices = async () => {
  const { data, error } = await supabase.from("devices").select("*");
  if (error) {
    console.error("Error in getDevices:", error);
    throw new Error("Supabase: Unable to fetch devices");
  }
  return data;
};

export const addDevice = async (device_id, secret_key) => {
  const { data, error } = await supabase
    .from("devices")
    .insert([{ device_id, secret_key }]);
  if (error) {
    console.error("Error in addDevice:", error);
    throw new Error("Supabase: Unable to add device");
  }
  return { success: true, data };
};
