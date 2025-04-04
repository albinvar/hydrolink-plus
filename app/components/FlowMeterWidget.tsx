import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function FlowMeterWidget() {
  const [flowRate, setFlowRate] = useState(0.0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const speedRef = useRef(4000);

  // Continuous fan spin animation
  useEffect(() => {
    const loopSpin = () => {
      spinAnim.setValue(0);
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: speedRef.current,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(loopSpin);
    };
    loopSpin();
  }, []);

  // Simulate changing flow rate and update spin speed
  useEffect(() => {
    const interval = setInterval(() => {
      const newRate = parseFloat((Math.random() * 1.5).toFixed(2));
      setFlowRate(newRate);
      speedRef.current = Math.max(4000 / (newRate + 0.1), 500);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={["#0288D1", "#26C6DA"]}
      style={styles.card}
      start={[0.1, 0]}
      end={[1, 1]}
    >
      <View style={styles.inner}>
        <Animated.View
          style={[styles.fanWrap, { transform: [{ rotate: spin }] }]}
        >
          <MaterialCommunityIcons name="fan" size={50} color="#FFFFFF" />
        </Animated.View>
        <View style={styles.textWrap}>
          <Text style={styles.label}>Real-Time Flow</Text>
          <Text style={styles.value}>
            {flowRate.toFixed(2)} <Text style={styles.unit}>L/s</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#ffffff00",
    shadowColor: "#0288D1",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  fanWrap: {
    padding: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 100,
    marginRight: 20,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: "#E0F7FA",
    marginBottom: 4,
  },
  value: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  unit: {
    fontSize: 18,
    color: "#B2EBF2",
  },
});
