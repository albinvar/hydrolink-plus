import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import StarBackground from "../components/starBackground";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [alert, setAlert] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  // Real-time validation
  useEffect(() => {
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }

    if (password && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  }, [email, password]);

  // Handle Login API Call
  const handleLogin = async () => {
    if (emailError || passwordError || !email || !password) {
      setAlert({
        message: "Please correct the errors before proceeding.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://6787fe31c4a42c916108febd.mockapi.io/login"
      );
      const data = await response.json();

      if (data[0]?.success) {
        // Store the token securely
        await SecureStore.setItemAsync("userToken", data[0]?.token);
        setAlert({
          message: "Login Successful! Redirecting...",
          type: "success",
        });

        // Navigate to the main page after a short delay
        setTimeout(() => {
          router.push("/main");
        }, 1500);
      } else {
        setAlert({
          message: "Invalid credentials. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      setAlert({
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background animation */}
      <StarBackground />
      {/* Animated background icon */}
      <Animated.View entering={FadeInDown.delay(200)}>
        <MaterialCommunityIcons name="water" size={100} color="#4FC3F7" />
      </Animated.View>

      {/* Animated title */}
      <Animated.Text entering={FadeInUp.delay(400)} style={styles.title}>
        Welcome Back
      </Animated.Text>

      {/* Animated subtitle */}
      <Animated.Text entering={FadeInUp.delay(600)} style={styles.subtitle}>
        Login to HydroLink Plus
      </Animated.Text>

      {/* Custom Alert */}
      {alert && (
        <View
          style={[
            styles.alert,
            alert.type === "error" ? styles.alertError : styles.alertSuccess,
          ]}
        >
          <Text style={styles.alertText}>{alert.message}</Text>
        </View>
      )}

      {/* Email input */}
      <Animated.View entering={FadeInUp.delay(800)} style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </Animated.View>

      {/* Password input */}
      <Animated.View
        entering={FadeInUp.delay(1000)}
        style={styles.inputWrapper}
      >
        <TextInput
          style={[styles.input, passwordError ? styles.inputError : null]}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
      </Animated.View>

      {/* Login button */}
      <Animated.View
        entering={FadeInUp.delay(1200)}
        style={styles.buttonWrapper}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Sign-Up link */}
      <Animated.View entering={FadeInUp.delay(1400)}>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.linkText}>Don’t have an account? Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark theme
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  },
  alert: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  alertError: {
    backgroundColor: "#FF6F61",
  },
  alertSuccess: {
    backgroundColor: "#4CAF50",
  },
  alertText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  inputWrapper: {
    width: "100%",
    maxWidth: 400,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    color: "#FFFFFF",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#FF6F61",
    borderWidth: 1,
  },
  errorText: {
    color: "#FF6F61",
    fontSize: 12,
    marginBottom: 10,
  },
  buttonWrapper: {
    width: "100%",
    maxWidth: 400, // Same as input fields
    marginTop: 10,
  },
  button: {
    backgroundColor: "#4FC3F7",
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
  linkText: {
    color: "#4FC3F7",
    fontSize: 14,
    marginTop: 20,
  },
});
