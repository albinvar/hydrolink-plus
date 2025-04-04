import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function MeterConnectionCard() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState("");

  const checkStatus = async () => {
    try {
      const res = await fetch("http://hydrolinkplus.one/api/websockets/active");
      const json = await res.json();
      const isActive = json.active_connections.includes("HLP001");
      setIsOnline(isActive);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    checkStatus(); // initial check
    const interval = setInterval(checkStatus, 7000); // repeat every 7s
    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={["#2196F3", "#03A9F4"]}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.card}
    >
      <View style={styles.row}>
        <MaterialCommunityIcons
          name={isOnline ? "access-point-check" : "access-point-off"}
          size={40}
          color="#fff"
          style={styles.icon}
        />
        <View style={styles.info}>
          <Text style={styles.label}>Device ID: HLP001</Text>
          {isOnline === null ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.statusText}>
              {isOnline ? "Meter is Online ✅" : "Meter is Offline ❌"}
            </Text>
          )}
          {lastChecked && isOnline !== null && (
            <Text style={styles.checked}>Checked at {lastChecked}</Text>
          )}
        </View>
        <View
          style={[
            styles.statusChip,
            { backgroundColor: isOnline ? "#66BB6A" : "#EF5350" },
          ]}
        >
          <Text style={styles.chipText}>{isOnline ? "Online" : "Offline"}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 40,
  },
  info: {
    flex: 1,
  },
  label: {
    color: "#E0F7FA",
    fontSize: 13,
  },
  statusText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 2,
  },
  checked: {
    color: "#BBDEFB",
    fontSize: 12,
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  chipText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});
