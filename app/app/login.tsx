import React, { useEffect, useState } from "react";
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
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const testimonials = [
  "“HydroLink made it easy to track my usage.” – Aleena P.",
  "“Leak alerts saved me a huge water bill!” – Nithin V.",
  "“Super clean UI and real-time insights!” – Amrutha P.",
  "“IoT meets water. Pure genius.” – Albin K.",
];

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
  }, []);
  const iconAnim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const [currentQuote, setCurrentQuote] = useState(testimonials[0]);
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % testimonials.length;
      setCurrentQuote(testimonials[index]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({ message: "Please fill in all fields", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://6787fe31c4a42c916108febd.mockapi.io/login"
      );
      const data = await response.json();

      if (data[0]?.success) {
        await SecureStore.setItemAsync("userToken", data[0]?.token);
        setAlert({ message: "Login successful!", type: "success" });
        setTimeout(() => router.push("/main"), 1200);
      } else {
        setAlert({ message: "Invalid credentials", type: "error" });
      }
    } catch {
      setAlert({ message: "Network error. Try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#2196F3", "#0D47A1"]} style={styles.background}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <Animated.View style={iconAnim}>
          <MaterialCommunityIcons name="water" size={64} color="#ffffff" />
        </Animated.View>
        <Animated.Text entering={FadeIn.delay(400)} style={styles.appTitle}>
          HydroLink Plus
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(600)} style={styles.appSubtitle}>
          Smart Water Management
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(800)} style={styles.testimonial}>
          {currentQuote}
        </Animated.Text>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {alert && (
            <View
              style={[
                styles.alert,
                {
                  backgroundColor:
                    alert.type === "error" ? "#EF5350" : "#66BB6A",
                },
              ]}
            >
              <Text style={styles.alertText}>{alert.message}</Text>
            </View>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
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
  testimonial: {
    marginTop: 20,
    fontSize: 14,
    color: "#D0F0FF",
    textAlign: "center",
    paddingHorizontal: 30,
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
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    marginBottom: 24,
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
  alert: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  alertText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
});
