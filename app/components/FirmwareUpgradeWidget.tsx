import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function FirmwareUpgradeWidget({
  currentVersion = "v1.0.2",
  latestVersion = "v1.1.0",
  onUpgrade,
}: {
  currentVersion?: string;
  latestVersion?: string;
  onUpgrade: () => void;
}) {
  const hasUpdate = currentVersion !== latestVersion;

  return (
    <LinearGradient
      colors={["#42A5F5", "#1976D2"]}
      style={styles.card}
      start={[0, 0]}
      end={[1, 1]}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="chip" size={32} color="#E3F2FD" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Firmware</Text>
          <Text style={styles.version}>
            Current: <Text style={{ fontWeight: "600" }}>{currentVersion}</Text>
          </Text>
          {hasUpdate && (
            <Text style={styles.updateText}>
              New version{" "}
              <Text style={{ fontWeight: "bold" }}>{latestVersion}</Text>{" "}
              available
            </Text>
          )}
        </View>
        {hasUpdate && (
          <TouchableOpacity style={styles.button} onPress={onUpgrade}>
            <Text style={styles.buttonText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 50,
    marginRight: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  version: {
    color: "#BBDEFB",
    fontSize: 14,
    marginTop: 2,
  },
  updateText: {
    color: "#E3F2FD",
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#1565C0",
    fontWeight: "600",
  },
});
