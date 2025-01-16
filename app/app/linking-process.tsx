import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

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
        await new Promise((resolve) => setTimeout(resolve, 6000)); // Delay for 6 seconds
        const response = await fetch(
          `https://6787fe31c4a42c916108febd.mockapi.io/link`
        );
        const result = await response.json();
        setLinkingResult(result[0]); // Assuming the API returns an array
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
      const timeout = setTimeout(() => router.push("/main"), 5000); // Auto-navigate after 5 seconds
      return () => clearTimeout(timeout); // Clear timeout on unmount
    }
  }, [linkingResult, router]);

  return (
    <View style={styles.container}>
      {/* Top: Lottie Animation */}
      <View style={styles.animationContainer}>
        {loading ? (
          <LottieView
            source={require("../assets/loading.json")} // Replace with your loading Lottie file
            autoPlay
            loop
            style={styles.lottie}
          />
        ) : linkingResult?.success ? (
          <LottieView
            source={require("../assets/success.json")} // Replace with your success Lottie file
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        ) : (
          <LottieView
            source={require("../assets/failure.json")} // Replace with your failure Lottie file
            autoPlay
            loop
            style={styles.lottie}
          />
        )}
      </View>

      {/* Bottom: Descriptions and Actions */}
      <View style={styles.contentContainer}>
        {loading ? (
          <>
            <Text style={styles.loadingText}>
              Linking your HydroLink Plus Meter...
            </Text>
            <Text style={styles.description}>
              Please ensure the meter QR code is correctly scanned and that your
              device is connected to the internet.
            </Text>
          </>
        ) : linkingResult?.success ? (
          <>
            <Text style={styles.successText}>Linking Successful!</Text>
            <Text style={styles.description}>
              Your HydroLink Plus Meter has been successfully linked to your
              account. You will be redirected to the dashboard shortly.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.failureText}>Linking Failed</Text>
            <Text style={styles.description}>
              Unable to link the meter. Please check the QR code and try again.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/signup-qr")}
            >
              <Text style={styles.buttonText}>Rescan QR Code</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  animationContainer: {
    flex: 1, // Top half
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1, // Bottom half
    padding: 20,
    justifyContent: "center",
  },
  lottie: {
    width: "80%",
    height: "80%", // Larger animation
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    color: "#B0BEC5",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  successText: {
    color: "#4CAF50", // Green for success
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  failureText: {
    color: "#FF6F61", // Red for failure
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4FC3F7",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
