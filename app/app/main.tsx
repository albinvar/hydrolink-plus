import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UsageCard from "~/components/UsageCard";
import FlowStatusCard from "~/components/FlowMeterWidget";
import FlowRateCard from "~/components/FlowMeterWidget";
import FlowMeterWidget from "~/components/FlowMeterWidget";
import ValveToggleCard from "~/components/ValveToggleCard";
import WaterQualityCard from "~/components/WaterQualityCard";
import LeakDetectionCard from "~/components/LeakDetectionCard";
import AiForecastChip from "~/components/AiForecastChip";
import NotificationFeed from "~/components/LiveNotificationPopups";
import MeterConnectionCard from "~/components/MeterConnectionCard";
import FirmwareUpgradeWidget from "~/components/FirmwareUpgradeWidget";
import { router } from "expo-router";

const screenWidth = Dimensions.get("window").width;

const mockUsage = {
  current: 134.7,
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  daily: [120, 140, 135, 128, 150, 160, 134],
};

export default function Dashboard() {
  const [usageData, setUsageData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsage = async () => {
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setUsageData(mockUsage);
    } catch (error) {
      console.error("Mock fetch failed", error);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsage();
    setRefreshing(false);
  };

  if (!usageData) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0288D1" />
        <Text style={styles.loadingText}>Fetching your usage...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.page}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={["#03A9F4", "#0288D1"]}
        style={styles.header}
        start={[0, 0]}
        end={[1, 1]}
      >
        <View style={styles.headerContent}>
          <MaterialCommunityIcons
            name="water"
            size={50}
            color="#FFFFFF"
            style={styles.icon}
          />
          <View>
            <Text style={styles.headerTitle}>HydroLink Plus</Text>
            <Text style={styles.headerSubtitle}>Smart Water Monitoring</Text>
          </View>
        </View>
      </LinearGradient>

      <FlowMeterWidget />
      {/* Usage Card */}
      {/* <UsageCard value={134.7} unit="L" label="Today’s Usage" /> */}

      <LeakDetectionCard />

      <ValveToggleCard dailyLimit={200} usedToday={134.7} />

      <WaterQualityCard />

      <MeterConnectionCard />

      <FirmwareUpgradeWidget
        currentVersion="v1.0.2"
        latestVersion="v1.1.0"
        onUpgrade={() => router.push("/upgrade")} // 👈 Navigate to the new page
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
          Today's Forecast
        </Text>
        <AiForecastChip /> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  loader: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#0288D1",
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E1F5FE",
  },
  card: {
    backgroundColor: "#E1F5FE",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    position: "relative",
    shadowColor: "#0288D1",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardLabel: {
    fontSize: 16,
    color: "#0288D1",
  },
  cardValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0288D1",
    marginTop: 8,
  },
  cardIcon: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  chartBox: {
    backgroundColor: "#E3F2FD",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  chartTitle: {
    color: "#0277BD",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
});
