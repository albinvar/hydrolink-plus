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
import { useRouter } from "expo-router";
import StarBackground from "../components/starBackground";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Real-time validation
  useEffect(() => {
    if (name && name.length < 3) {
      setNameError("Name must be at least 3 characters");
    } else {
      setNameError("");
    }

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
  }, [name, email, password]);

  // Handle Signup API Call
  const handleSignup = async () => {
    if (
      nameError ||
      emailError ||
      passwordError ||
      !name ||
      !email ||
      !password
    ) {
      alert("Please correct the errors before proceeding.");
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call for registration
      setTimeout(() => {
        setIsLoading(false);
        alert("User Registered Successfully!");
        router.push("/signup-qr"); // Navigate to QR scanning page
      }, 2000);
    } catch (error) {
      alert("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StarBackground />
      {/* Header */}
      <MaterialCommunityIcons name="account-plus" size={100} color="#4FC3F7" />
      <Text style={styles.title}>Create Account</Text>

      {/* Name Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, nameError ? styles.inputError : null]}
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
      </View>

      {/* Email Input */}
      <View style={styles.inputWrapper}>
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
      </View>

      {/* Password Input */}
      <View style={styles.inputWrapper}>
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
      </View>

      {/* Signup Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Next</Text>
        )}
      </TouchableOpacity>
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
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
  },
  inputWrapper: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    paddingHorizontal: 15,
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
    marginTop: 5,
  },
  button: {
    backgroundColor: "#4FC3F7",
    width: "100%",
    maxWidth: 400,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
