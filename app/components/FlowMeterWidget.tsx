import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function FlowMeterWithConnectionCard() {
  const [flowRate, setFlowRate] = useState(0.0);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState("");

  const spinAnim = useRef(new Animated.Value(0)).current;
  const speedRef = useRef(4000);

  // Fan spin animation based on flow rate
  useEffect(() => {
    const spinLoop = () => {
      spinAnim.setValue(0);
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: speedRef.current,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(spinLoop);
    };
    spinLoop();
  }, []);

  useEffect(() => {
    const updateFlow = () => {
      const rate = parseFloat((Math.random() * 1.5).toFixed(2));
      setFlowRate(rate);
      speedRef.current = Math.max(4000 / (rate + 0.1), 500);
    };
    updateFlow();
    const flowInterval = setInterval(updateFlow, 3000);
    return () => clearInterval(flowInterval);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch("http://hydrolinkplus.one/api/websockets/active");
      const json = await res.json();
      const online = json.active_connections.includes("HLP001");
      setIsOnline(online);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const statusInterval = setInterval(checkStatus, 8000);
    return () => clearInterval(statusInterval);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={["#0288D1", "#26C6DA"]}
      style={styles.card}
      start={[0, 0]}
      end={[1, 1]}
    >
      <View style={styles.row}>
        {/* Fan Animation */}
        <Animated.View
          style={[styles.fanWrap, { transform: [{ rotate: spin }] }]}
        >
          <MaterialCommunityIcons name="fan" size={48} color="#fff" />
        </Animated.View>

        {/* Flow + Connection Info */}
        <View style={styles.textWrap}>
          <Text style={styles.label}>Real-Time Flow</Text>
          <Text style={styles.flowRate}>
            {flowRate.toFixed(2)} <Text style={styles.unit}>L/s</Text>
          </Text>

          <Text style={styles.device}>Device ID: HLP001</Text>
          <Text style={styles.checked}>
            Last checked: {lastChecked || "Loading..."}
          </Text>
        </View>

        {/* Status Chip */}
        <View
          style={[
            styles.statusChip,
            { backgroundColor: isOnline ? "#66BB6A" : "#EF5350" },
          ]}
        >
          {isOnline === null ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.statusText}>
              {isOnline ? "Online" : "Offline"}
            </Text>
          )}
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
    elevation: 8,
    shadowColor: "#0288D1",
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  fanWrap: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 14,
    borderRadius: 50,
    marginRight: 18,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: "#E0F7FA",
    fontSize: 14,
  },
  flowRate: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  unit: {
    fontSize: 16,
    color: "#B2EBF2",
  },
  device: {
    fontSize: 13,
    color: "#BBDEFB",
    marginTop: 4,
  },
  checked: {
    fontSize: 12,
    color: "#B3E5FC",
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});
