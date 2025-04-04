import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AiForecastChip() {
  const [forecastLitres, setForecastLitres] = useState(180);
  const [status, setStatus] = useState("Normal");
  const [color, setColor] = useState("#42A5F5");

  // Simulate forecast changing
  useEffect(() => {
    const interval = setInterval(() => {
      const value = Math.floor(150 + Math.random() * 100);
      setForecastLitres(value);

      if (value < 180) {
        setStatus("Low");
        setColor("#66BB6A");
      } else if (value > 240) {
        setStatus("High");
        setColor("#EF5350");
      } else {
        setStatus("Normal");
        setColor("#42A5F5");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: color + "22", borderColor: color },
      ]}
    >
      <MaterialCommunityIcons
        name="robot-outline"
        size={18}
        color={color}
        style={{ marginRight: 6 }}
      />
      <Text style={[styles.text, { color }]}>{status}</Text>
      <Text style={[styles.text, { color }]}>· {forecastLitres} L</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "600",
    fontSize: 13,
    marginHorizontal: 4,
  },
});
