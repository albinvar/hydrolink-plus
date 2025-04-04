import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function UsageCard({
  value,
  unit = "L",
  label = "Water Usage",
}: {
  value: number;
  unit?: string;
  label?: string;
}) {
  return (
    <LinearGradient
      colors={["#03A9F4", "#0288D1"]}
      style={styles.card}
      start={[0, 0]}
      end={[1, 1]}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="water" size={30} color="#fff" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value} <Text style={styles.unit}>{unit}</Text>
        </Text>
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
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0288D1",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iconWrap: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 50,
    marginRight: 15,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#E1F5FE",
  },
  value: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  unit: {
    fontSize: 16,
    color: "#E1F5FE",
  },
});
