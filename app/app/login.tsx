import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Inner content wrapper for centering */}
      <View style={styles.content}>
        {/* Water droplet icon */}
        <MaterialCommunityIcons name="water" size={100} color="#4FC3F7" />

        {/* Page title */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to HydroLink Plus</Text>

        {/* Email input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
        />

        {/* Login button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Navigation link to Sign Up */}
        <TouchableOpacity
          onPress={() => router.push("signup")}
          style={styles.link}
        >
          <Text style={styles.linkText}>Don’t have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark theme background
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 400, // Limit the width for larger devices
    alignItems: "center",
    paddingHorizontal: 20, // Add some horizontal padding
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#B0BEC5",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E1E1E", // Darker input field
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: "#FFFFFF",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4FC3F7", // Consistent with splash screen button
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: "#4FC3F7",
    fontSize: 14,
  },
});
