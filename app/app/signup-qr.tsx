import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

const windowWidth = Dimensions.get("window").width;

export default function SignupQR() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle QR Code Scanned
  const handleQRCodeScanned = (data: string) => {
    Alert.alert("QR Code Scanned", `Meter ID: ${data}`, [
      { text: "OK", onPress: () => router.push("main") },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Camera in a small box */}
      <View style={styles.cameraBox}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={({ data }) => handleQRCodeScanned(data)}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          Link Your HydroLink Plus Meter
        </Text>
        <Text style={styles.instructionsText}>
          Align the QR code on your HLP Meter within the camera box above. Once
          scanned successfully, your meter will be linked to your account.
        </Text>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() =>
            setFacing((current) => (current === "back" ? "front" : "back"))
          }
        >
          <Text style={styles.flipButtonText}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  permissionText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    alignSelf: "center",
    backgroundColor: "#4FC3F7",
    padding: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraBox: {
    width: windowWidth * 0.8, // 80% of screen width
    height: windowWidth * 0.8, // Square box
    alignSelf: "center",
    marginTop: 40,
    borderRadius: 16,
    overflow: "hidden", // Ensure camera view is clipped to rounded corners
    borderWidth: 2,
    borderColor: "#4FC3F7",
  },
  camera: {
    flex: 1,
  },
  instructionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  instructionsTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  instructionsText: {
    color: "#B0BEC5",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  flipButton: {
    alignSelf: "center",
    backgroundColor: "#4FC3F7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  flipButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
