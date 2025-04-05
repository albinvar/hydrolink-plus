import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Vibration,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

type Stage =
  | "idle"
  | "checkingOnline"
  | "fetchingInfo"
  | "sendingOTA"
  | "waiting"
  | "done"
  | "failed";

export default function UpgradeScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isMeterOnline, setIsMeterOnline] = useState<boolean>(false);

  const meterId = "HLP001";

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const checkMeterOnline = async (): Promise<boolean> => {
    try {
      const res = await fetch("http://hydrolinkplus.one/api/websockets/active");
      const data = await res.json();
      return data.active_connections.includes(meterId);
    } catch {
      return false;
    }
  };

  const fetchDeviceInfo = async () => {
    try {
      const res = await fetch(
        `http://hydrolinkplus.one/api/devices/${meterId}/info`
      );
      const json = await res.json();
      setDeviceInfo(json);
    } catch {
      // Silent error
    }
  };

  const sendOtaCommand = async (): Promise<boolean> => {
    try {
      const res = await fetch(
        `http://hydrolinkplus.one/api/devices/${meterId}/ota`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: "http://files.hydrolinkplus.in/hydrolink_plus.bin",
          }),
        }
      );
      const json = await res.json();
      return json.success === true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    async function initialCheck() {
      const online = await checkMeterOnline();
      setIsMeterOnline(online);
      if (online) {
        await fetchDeviceInfo();
      }
    }
    initialCheck();
  }, []);

  const getStepDetail = () => {
    switch (stage) {
      case "checkingOnline":
        return { text: "Verifying meter online status", icon: "wifi-check" };
      case "fetchingInfo":
        return {
          text: "Retrieving current device info",
          icon: "information-outline",
        };
      case "sendingOTA":
        return { text: "Sending OTA command", icon: "upload" };
      case "waiting":
        return {
          text: "Waiting for firmware upgrade to complete",
          icon: "progress-clock",
        };
      case "done":
        return { text: "Upgrade successful", icon: "check-circle" };
      case "failed":
        return { text: "Upgrade failed", icon: "close-circle" };
      default:
        return { text: "", icon: "" };
    }
  };

  const startUpgrade = async () => {
    setStage("checkingOnline");

    const online = await checkMeterOnline();
    if (!online) {
      setError("Meter is offline. Please ensure it is online and try again.");
      setStage("failed");
      Vibration.vibrate(300);
      return;
    }

    setStage("fetchingInfo");
    await fetchDeviceInfo();

    setStage("sendingOTA");
    const otaSuccess = await sendOtaCommand();
    if (!otaSuccess) {
      setError("Failed to send OTA command.");
      setStage("failed");
      Vibration.vibrate(300);
      return;
    }

    setStage("waiting");
    setProgress(0);
    let retries = 0;
    const maxRetries = 20;
    const pollLoop = async () => {
      while (retries < maxRetries) {
        await delay(5000);
        const increment = Math.floor(Math.random() * 3) + 1;
        setProgress((prev) => Math.min(prev + increment, 99));
        const isBackOnline = await checkMeterOnline();
        if (isBackOnline) {
          await fetchDeviceInfo();
          setProgress(100);
          setStage("done");
          Vibration.vibrate(100);
          return;
        }
        retries++;
      }
      setError("Upgrade timed out. Meter did not come back online.");
      setStage("failed");
      Vibration.vibrate(400);
    };
    pollLoop();
  };

  const renderStepDetail = () => {
    const { text, icon } = getStepDetail();
    if (!text) return null;
    return (
      <Animated.View entering={FadeIn} style={styles.stepContainer}>
        <MaterialCommunityIcons name={icon as any} size={24} color="#E3F2FD" />
        <Text style={styles.stepText}>{text}</Text>
      </Animated.View>
    );
  };

  const renderContent = () => {
    switch (stage) {
      case "idle":
        return (
          <View style={styles.centered}>
            <MaterialCommunityIcons
              name="chip"
              size={80}
              color="#E3F2FD"
              style={{ marginBottom: 20 }}
            />
            <Text style={styles.title}>Firmware Upgrade</Text>
            <Text style={styles.subtitle}>v1.0.2 → v1.1.0</Text>
            {deviceInfo && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Device ID: {deviceInfo.deviceId}
                </Text>
                <Text style={styles.infoText}>
                  Chip: {deviceInfo.chip_model}
                </Text>
                <Text style={styles.infoText}>
                  Revision: {deviceInfo.chip_revision}
                </Text>
                <Text style={styles.infoText}>
                  App Version: {deviceInfo.app_version}
                </Text>
              </View>
            )}
            <Text style={styles.description}>
              This upgrade includes performance improvements, enhanced leak
              detection, and security patches.
            </Text>
            <TouchableOpacity
              style={[styles.button, !isMeterOnline && { opacity: 0.6 }]}
              onPress={startUpgrade}
              disabled={!isMeterOnline}
            >
              <Text style={styles.buttonText}>Start Upgrade</Text>
            </TouchableOpacity>
            {!isMeterOnline && (
              <Text style={styles.offlineText}>Meter is currently offline</Text>
            )}
          </View>
        );

      case "checkingOnline":
        return (
          <Animated.View entering={SlideInDown} style={styles.centered}>
            <ActivityIndicator size="large" color="#E3F2FD" />
            <Text style={styles.title}>Checking Meter Online Status...</Text>
            {renderStepDetail()}
          </Animated.View>
        );

      case "fetchingInfo":
        return (
          <Animated.View entering={SlideInDown} style={styles.centered}>
            <ActivityIndicator size="large" color="#E3F2FD" />
            <Text style={styles.title}>Fetching Device Info...</Text>
            {renderStepDetail()}
          </Animated.View>
        );

      case "sendingOTA":
        return (
          <Animated.View entering={SlideInDown} style={styles.centered}>
            <ActivityIndicator size="large" color="#E3F2FD" />
            <Text style={styles.title}>Sending OTA Command...</Text>
            {renderStepDetail()}
          </Animated.View>
        );

      case "waiting":
        return (
          <Animated.View entering={SlideInDown} style={styles.centered}>
            <ActivityIndicator
              size="large"
              color="#E3F2FD"
              style={{ marginBottom: 20 }}
            />
            <Text style={styles.title}>Upgrading...</Text>
            <Text style={styles.description}>
              Please do not turn off your meter while the firmware is updating.
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}% completed</Text>
            {renderStepDetail()}
          </Animated.View>
        );

      case "done":
        return (
          <Animated.View entering={FadeIn} style={styles.centered}>
            <MaterialCommunityIcons
              name="check-circle"
              size={80}
              color="#00E676"
              style={{ marginBottom: 20 }}
            />
            <Text style={styles.title}>Upgrade Complete!</Text>
            <Text style={styles.description}>
              Your meter firmware has been successfully updated.
            </Text>
            {renderStepDetail()}
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/main")}
            >
              <Text style={styles.buttonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case "failed":
        return (
          <Animated.View entering={FadeIn} style={styles.centered}>
            <MaterialCommunityIcons
              name="close-circle"
              size={80}
              color="#EF5350"
              style={{ marginBottom: 20 }}
            />
            <Text style={styles.title}>Upgrade Failed</Text>
            <Text style={styles.description}>{error}</Text>
            {renderStepDetail()}
            <TouchableOpacity
              style={styles.button}
              onPress={() => setStage("idle")}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={["#2196F3", "#0D47A1"]} style={styles.container}>
      {renderContent()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E3F2FD",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#BBDEFB",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#BBDEFB",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: "#0D47A1",
    fontWeight: "600",
    fontSize: 16,
  },
  offlineText: {
    color: "#EF5350",
    marginTop: 10,
    fontSize: 14,
  },
  progressBar: {
    width: width * 0.7,
    height: 14,
    backgroundColor: "#ffffff33",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 30,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00E5FF",
  },
  progressText: {
    marginTop: 10,
    color: "#E3F2FD",
    fontWeight: "600",
    fontSize: 14,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  stepText: {
    color: "#E3F2FD",
    fontSize: 16,
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: "#0D47A1",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
  },
  infoText: {
    color: "#E3F2FD",
    fontSize: 14,
    marginBottom: 4,
  },
});
