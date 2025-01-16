import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Camera } from "expo-camera";
import Svg, { Rect, Path } from "react-native-svg";
import { useRouter } from "expo-router";

export default function SignupQR() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const windowWidth = Dimensions.get("window").width;

  // Request Camera Permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === "granted") {
        setHasPermission(true);
      } else {
        Alert.alert(
          "Permission Denied",
          "Camera access is required to scan the QR code."
        );
        setHasPermission(false);
      }
    })();
  }, []);

  // Handle QR Code Scanned
  const handleQRCodeScanned = ({ data }: { data: string }) => {
    setIsScanning(false); // Stop scanning
    if (data) {
      Alert.alert("QR Code Scanned", `Meter ID: ${data}`, [
        { text: "OK", onPress: () => router.push("main") },
      ]);
    } else {
      Alert.alert("Error", "Invalid QR Code. Please try again.");
      setIsScanning(true); // Resume scanning
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera access is required to scan the QR code.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        onBarCodeScanned={isScanning ? handleQRCodeScanned : undefined}
        barCodeScannerSettings={{
          barCodeTypes: Camera.Constants?.BarCodeType
            ? [Camera.Constants.BarCodeType.qr]
            : undefined,
        }}
      >
        {/* Curved Overlay */}
        <Svg
          height="100%"
          width="100%"
          style={styles.overlay}
          viewBox={`0 0 ${windowWidth} 400`}
        >
          {/* Transparent area in the curve */}
          <Rect
            x="0"
            y="0"
            width={windowWidth}
            height="100%"
            fill="rgba(0,0,0,0.5)"
          />
          <Path
            d={`M0 0 H${windowWidth} V300 Q${windowWidth / 2} 400 0 300 Z`}
            fill="#121212"
          />
        </Svg>
      </Camera>
      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Align the QR code within the box
        </Text>
      </View>
      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.push("main")}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  permissionText: {
    flex: 1,
    color: "#FFFFFF",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
  },
  instructionContainer: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  skipButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#4FC3F7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  skipButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
