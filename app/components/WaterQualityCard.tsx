import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function WaterQualityCard() {
  const [pH, setPH] = useState(7.0);
  const [turbidity, setTurbidity] = useState(2.5);
  const [temperature, setTemperature] = useState(27.3);

  useEffect(() => {
    const interval = setInterval(() => {
      setPH(parseFloat((6.5 + Math.random() * 1.5).toFixed(2)));
      setTurbidity(parseFloat((1 + Math.random() * 4).toFixed(1)));
      setTemperature(parseFloat((25 + Math.random() * 3).toFixed(1)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      label: "pH Level",
      icon: "beaker",
      value: pH,
      unit: "",
      color: "#4FC3F7",
      status: pH < 6.5 || pH > 8.5 ? "Caution" : "Good",
    },
    {
      label: "Turbidity",
      icon: "waves",
      value: turbidity,
      unit: "NTU",
      color: "#81C784",
      status: turbidity > 5 ? "High" : "Clear",
    },
    {
      label: "Temperature",
      icon: "thermometer",
      value: temperature,
      unit: "°C",
      color: "#FFB74D",
      status: temperature > 30 ? "Warm" : temperature < 20 ? "Cold" : "Normal",
    },
  ];

  const recommendations = [
    "Drink filtered or boiled water if turbidity is high.",
    "Clean your tap and filter weekly.",
    "Monitor pH if water tastes odd.",
    "Avoid storing water in plastic containers.",
    "Use water softeners if pH is too high.",
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Water Quality Insights</Text>

      {metrics.map((item, idx) => (
        <View
          key={idx}
          style={[
            styles.metricRow,
            idx < metrics.length - 1 && styles.rowBorder,
          ]}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={28}
            color={item.color}
          />
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>{item.label}</Text>
            <Text style={[styles.metricValue, { color: item.color }]}>
              {item.value} {item.unit}
            </Text>
          </View>
          <View
            style={[styles.statusChip, { backgroundColor: item.color + "33" }]}
          >
            <Text style={[styles.statusText, { color: item.color }]}>
              {item.status}
            </Text>
          </View>
        </View>
      ))}

      {/* Divider */}
      <View style={styles.divider} />

      <Text style={styles.recommendTitle}>Hydration Tips</Text>
      {recommendations.map((tip, idx) => (
        <View key={idx} style={styles.tipCard}>
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={20}
            color="#0288D1"
          />
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#ccc",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  metricContent: {
    marginLeft: 14,
    flex: 1,
  },
  metricLabel: {
    color: "#888",
    fontSize: 13,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statusChip: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
  },
  statusText: {
    fontWeight: "600",
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20,
  },
  recommendTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5FAFD",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  tipText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
  },
});
