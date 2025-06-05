import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeInUp } from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

export default function SignupQR() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <LinearGradient colors={["#2196F3", "#0D47A1"]} style={styles.container}>
        <Text style={styles.permissionText}>
          We need permission to access your camera.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const handleQRCodeScanned = (data: string) => {
    if (!isScanning) return;
    if (data.startsWith("HLP")) {
      setIsScanning(false);
      router.push({ pathname: "/linking-process", params: { meterId: data } });
    } else {
      setIsScanning(false);
      alert("Invalid QR Code: Not a HydroLink Plus meter.");
      setTimeout(() => setIsScanning(true), 2000);
    }
  };

  return (
    <LinearGradient colors={["#2196F3", "#0D47A1"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Scan Your HLP Meter</Text>
          <Text style={styles.subtitle}>
            Point your camera at the QR code on your HydroLink Plus device.
          </Text>
        </View>

        <View style={styles.cameraFrame}>
          <CameraView
            style={styles.camera}
            facing={facing}
            enableTorch={torchEnabled}
            onBarcodeScanned={({ data }) => handleQRCodeScanned(data)}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
          <View style={styles.cameraOverlay} />
        </View>

        <View style={styles.actions}>
          <BlurView intensity={50} tint="light" style={styles.controlBtn}>
            <TouchableOpacity onPress={() => setTorchEnabled(!torchEnabled)}>
              <MaterialCommunityIcons
                name={torchEnabled ? "flashlight-off" : "flashlight"}
                size={28}
                color="#1565C0"
              />
            </TouchableOpacity>
          </BlurView>
          <BlurView intensity={50} tint="light" style={styles.controlBtn}>
            <TouchableOpacity
              onPress={() =>
                setFacing((current) => (current === "back" ? "front" : "back"))
              }
            >
              <MaterialCommunityIcons
                name="camera-flip"
                size={28}
                color="#1565C0"
              />
            </TouchableOpacity>
          </BlurView>
        </View>

        <Animated.View
          entering={FadeInUp.delay(300)}
          style={styles.instructionWrapper}
        >
          <Text style={styles.instructionHeader}>Scan Instructions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.instructions}
          >
            <InstructionItem
              icon="qrcode-scan"
              iconColor="#E1F5FE"
              title="Find the QR Code"
              desc="Look on top or back of the meter for a QR label."
            />
            <InstructionItem
              icon="gesture-tap-hold"
              iconColor="#B3E5FC"
              title="Hold Steady"
              desc="Keep your phone 6–10 inches away. Stay still."
            />
            <InstructionItem
              icon="weather-night"
              iconColor="#90CAF9"
              title="Use Flashlight"
              desc="Use the torch if it's too dark to scan."
            />
            <InstructionItem
              icon="wifi-off"
              iconColor="#FF8A65"
              title="Offline Mode"
              desc="Scanning works offline, linking needs internet."
            />
          </ScrollView>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

function InstructionItem({
  icon,
  iconColor,
  title,
  desc,
}: {
  icon: string;
  iconColor: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: Platform.OS === "android" ? 70 : 100,
    paddingBottom: 50,
    alignItems: "center",
  },
  permissionText: {
    color: "#E3F2FD",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: "#42A5F5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    marginBottom: 30,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#BBDEFB",
    textAlign: "center",
  },
  cameraFrame: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#E3F2FD",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "#B3E5FC",
    borderWidth: 4,
    borderRadius: 20,
    borderStyle: "dashed",
    opacity: 0.15,
  },
  actions: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  controlBtn: {
    borderRadius: 50,
    padding: 14,
    overflow: "hidden",
  },
  instructionWrapper: {
    width: "100%",
    paddingTop: 20,
  },
  instructionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E1F5FE",
    marginBottom: 10,
    textAlign: "center",
  },
  instructions: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffffcc",
    borderRadius: 16,
    padding: 16,
    width: screenWidth * 0.7,
    height: 170,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    justifyContent: "flex-start",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    color: "#0D47A1",
  },
  cardDesc: {
    fontSize: 14,
    marginTop: 6,
    color: "#444",
  },
});
