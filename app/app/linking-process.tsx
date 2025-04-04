import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import LottieView from "lottie-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const screenHeight = Dimensions.get("window").height;

export default function LinkingProcess() {
  const { meterId } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [linkingResult, setLinkingResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!meterId) return;

    const fetchLinkingStatus = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 6000));
        const response = await fetch(
          `https://6787fe31c4a42c916108febd.mockapi.io/link`
        );
        const result = await response.json();
        setLinkingResult(result[0]);
      } catch (error) {
        setLinkingResult({
          success: false,
          message: "Linking Failed. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLinkingStatus();
  }, [meterId]);

  useEffect(() => {
    if (linkingResult?.success) {
      const timeout = setTimeout(() => router.push("/main"), 5000);
      return () => clearTimeout(timeout);
    }
  }, [linkingResult, router]);

  return (
    <LinearGradient colors={["#2196F3", "#0D47A1"]} style={styles.container}>
      <View style={styles.topContainer}>
        {loading ? (
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        ) : linkingResult?.success ? (
          <LottieView
            source={require("../assets/success.json")}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        ) : (
          <LottieView
            source={require("../assets/failure.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        )}
      </View>

      <View style={styles.bottomContainer}>
        {loading ? (
          <>
            <Text style={styles.bigText}>Linking Your Meter...</Text>
            <Text style={styles.descText}>
              Please wait while we verify and connect your HydroLink Plus
              device.
            </Text>
          </>
        ) : linkingResult?.success ? (
          <>
            <Text style={styles.bigText}>🎉 Success!</Text>
            <Text style={styles.descText}>
              Your device has been linked. You’ll be redirected shortly.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.bigText}>⚠️ Failed to Link</Text>
            <Text style={styles.descText}>
              Something went wrong. Try rescanning the QR code.
            </Text>
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => router.push("/signup-qr")}
            >
              <Text style={styles.rescanText}>🔄 Rescan QR Code</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    height: screenHeight * 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    flex: 1,
    padding: 30,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  lottie: {
    width: 260,
    height: 260,
  },
  bigText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  descText: {
    fontSize: 16,
    color: "#E3F2FD",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  rescanButton: {
    marginTop: 24,
    backgroundColor: "#42A5F5",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  rescanText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
