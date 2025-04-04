import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LeakDetectionCard() {
  const [leakDetected, setLeakDetected] = useState(false);
  const [lastLeakTime, setLastLeakTime] = useState("None");

  // Simulate live leak detection (replace with real API later)
  useEffect(() => {
    const interval = setInterval(() => {
      const hasLeak = Math.random() < 0.2; // 20% chance
      setLeakDetected(hasLeak);
      if (hasLeak) {
        const now = new Date().toLocaleTimeString();
        setLastLeakTime(now);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={leakDetected ? ["#EF5350", "#E53935"] : ["#66BB6A", "#43A047"]}
      style={styles.card}
      start={[0, 0]}
      end={[1, 1]}
    >
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name={leakDetected ? "water-alert" : "water-check"}
            size={40}
            color="#fff"
          />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.statusLabel}>Leak Status</Text>
          <Text style={styles.statusText}>
            {leakDetected ? "Leak Detected!" : "No Leaks"}
          </Text>
          <Text style={styles.timeLabel}>Last Leak: {lastLeakTime}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 50,
    padding: 14,
    marginRight: 18,
  },
  textBlock: {
    flex: 1,
  },
  statusLabel: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },
  statusText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 4,
  },
  timeLabel: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.8,
  },
});
