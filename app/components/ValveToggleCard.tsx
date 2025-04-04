import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Enable layout animation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ValveToggleCard({
  dailyLimit = 200,
  usedToday = 134.7,
}: {
  dailyLimit?: number;
  usedToday?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Valve is Closed");
  const [isToggling, setIsToggling] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const iconSpin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleToggle = async () => {
    const action = isOpen ? "close" : "open";
    setIsToggling(true);
    setStatusMsg(`${action === "open" ? "Opening" : "Closing"}...`);

    // Animate rotation
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    try {
      const res = await fetch(
        "http://hydrolinkplus.one/api/devices/HLP001/valve",
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      const result = await res.json();

      if (result.status) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
        setStatusMsg(result.status);
      } else {
        setStatusMsg("Unexpected Error");
      }
    } catch (err) {
      setStatusMsg("Connection Error");
    } finally {
      setIsToggling(false);
    }
  };

  const remaining = Math.max(0, dailyLimit - usedToday);
  const percentage = Math.min(100, (usedToday / dailyLimit) * 100);

  return (
    <LinearGradient
      colors={["#0288D1", "#26C6DA"]}
      style={styles.card}
      start={[0, 0]}
      end={[1, 1]}
    >
      {/* Header */}
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.iconWrap,
            isToggling && { transform: [{ rotate: iconSpin }] },
          ]}
        >
          <MaterialCommunityIcons
            name={isOpen ? "valve-open" : "valve-closed"}
            size={50}
            color="#FFFFFF"
          />
        </Animated.View>
        <View style={styles.textWrap}>
          <Text style={styles.label}>Valve Status</Text>
          <Text style={styles.status}>{statusMsg}</Text>
        </View>

        {/* Modern pill switch */}
        <TouchableOpacity
          style={[
            styles.pill,
            isOpen ? styles.pillOpen : styles.pillClosed,
            isToggling && { opacity: 0.6 },
          ]}
          onPress={handleToggle}
          activeOpacity={0.8}
          disabled={isToggling}
        >
          <MaterialCommunityIcons
            name={isOpen ? "lock-open-variant" : "lock"}
            size={18}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.pillText}>{isOpen ? "Close" : "Open"}</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Water usage info */}
      <View style={styles.usageRow}>
        <View style={styles.usageCol}>
          <Text style={styles.usageLabel}>Limit</Text>
          <Text style={styles.usageValue}>{dailyLimit} L</Text>
        </View>
        <View style={styles.usageCol}>
          <Text style={styles.usageLabel}>Used</Text>
          <Text style={styles.usageValue}>{usedToday.toFixed(1)} L</Text>
        </View>
        <View style={styles.usageCol}>
          <Text style={styles.usageLabel}>Remaining</Text>
          <Text style={styles.usageValue}>{remaining.toFixed(1)} L</Text>
        </View>
      </View>

      {/* Animated progress bar */}
      <View style={styles.progressBarWrap}>
        <Animated.View
          style={[styles.progressBar, { width: `${percentage}%` }]}
        />
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
    elevation: 6,
    shadowColor: "#0288D1",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 60,
    padding: 12,
    marginRight: 16,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: "#E0F7FA",
    fontSize: 14,
  },
  status: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  pill: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 50,
    alignItems: "center",
  },
  pillOpen: {
    backgroundColor: "#FF7043",
  },
  pillClosed: {
    backgroundColor: "#66BB6A",
  },
  pillText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 15,
  },
  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  usageCol: {
    alignItems: "center",
    flex: 1,
  },
  usageLabel: {
    color: "#B2EBF2",
    fontSize: 12,
  },
  usageValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  progressBarWrap: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
});
