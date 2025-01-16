import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function LinkingProcess() {
  const { meterId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Linking HydroLink Plus Meter</Text>
      <Text style={styles.text}>Meter ID: {meterId}</Text>
      <Text style={styles.text}>Please wait while we link your meter...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    color: "#B0BEC5",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
});
