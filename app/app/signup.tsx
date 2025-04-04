import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
  }, []);
  const iconAnim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  useEffect(() => {
    setNameError(
      name && name.length < 3 ? "Name must be at least 3 characters" : ""
    );
    setEmailError(
      email && !/\S+@\S+\.\S+/.test(email) ? "Invalid email address" : ""
    );
    setPasswordError(
      password && password.length < 6
        ? "Password must be at least 6 characters"
        : ""
    );
  }, [name, email, password]);

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
      setTimeout(() => {
        setIsLoading(false);
        router.push("/signup-qr");
      }, 2000);
    } catch (error) {
      alert("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#2196F3", "#0D47A1"]} style={styles.gradient}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <Animated.View style={iconAnim}>
          <MaterialCommunityIcons name="water" size={64} color="#ffffff" />
        </Animated.View>
        <Animated.Text entering={FadeIn.delay(400)} style={styles.appTitle}>
          HydroLink Plus
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(600)} style={styles.appSubtitle}>
          Let’s get you onboard!
        </Animated.Text>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            placeholder="John Doe"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="your@email.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            placeholder="Choose a strong password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          {/* Button */}
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
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 100,
    alignItems: "center",
    paddingBottom: 60,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
  },
  appSubtitle: {
    fontSize: 16,
    color: "#E1F5FE",
    marginTop: 4,
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
    marginBottom: 20,
  },
  label: {
    color: "#333",
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#000",
  },
  inputError: {
    borderColor: "#FF6F61",
    borderWidth: 1,
  },
  errorText: {
    color: "#FF6F61",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#1976D2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
