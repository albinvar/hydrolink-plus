import {
  StyleSheet,
  View,
  Image,
  Animated,
  ScrollView,
  Dimensions,
  Text,
} from "react-native";
import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

export default function CreditsScreen() {
  const starsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(starsAnim, {
        toValue: 1,
        duration: 3500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const renderStars = () => {
    return Array.from({ length: 25 }, (_, i) => (
      <Animated.View
        key={i}
        style={[
          styles.star,
          {
            top: Math.random() * height,
            left: Math.random() * width,
            opacity: starsAnim,
          },
        ]}
      />
    ));
  };

  return (
    <LinearGradient colors={["#2196F3", "#0D47A1"]} style={styles.container}>
      {renderStars()}
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="water" size={64} color="#E1F5FE" />
          <Text style={styles.title}>HydroLink Plus</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            HydroLink Plus empowers real-time smart water tracking with advanced
            IoT-powered analytics, alert systems, and remote valve control.
          </Text>
        </View>

        {/* Project Guide */}
        <Text style={styles.sectionTitle}>Project Coordinator</Text>
        <CreditCard
          name="Ms. Devi Gopal T"
          role="Project Guide"
          image={require("@/assets/images/devi-gopal.jpeg")}
        />

        {/* Team */}
        <Text style={styles.sectionTitle}>Development Team</Text>
        {teamMembers.map((m, i) => (
          <CreditCard key={i} name={m.name} role={m.role} image={m.image} />
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

function CreditCard({
  name,
  role,
  image,
}: {
  name: string;
  role: string;
  image: any;
}) {
  return (
    <BlurView intensity={40} tint="light" style={styles.card}>
      <View style={styles.cardInner}>
        <Image source={image} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>
    </BlurView>
  );
}

const teamMembers = [
  {
    name: "Albin K Varghese",
    role: "Team Member",
    image: require("@/assets/images/albin_k.png"),
  },
  {
    name: "Albin Varghese",
    role: "Team Member",
    image: require("@/assets/images/albin_v.png"),
  },
  {
    name: "Amithamol Varghese",
    role: "Team Member",
    image: require("@/assets/images/amitha.jpg"),
  },
  {
    name: "Amrutha Pradeep",
    role: "Team Member",
    image: require("@/assets/images/amrutha.jpeg"),
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 10,
  },
  version: {
    fontSize: 14,
    color: "#BBDEFB",
    marginVertical: 6,
  },
  description: {
    textAlign: "center",
    color: "#E3F2FD",
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E1F5FE",
    marginBottom: 12,
    marginTop: 30,
    textAlign: "center",
  },
  card: {
    width: "100%",
    marginBottom: 14,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#E1F5FE",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  role: {
    fontSize: 14,
    color: "#B3E5FC",
    marginTop: 2,
  },
  star: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 5,
    width: 3,
    height: 3,
  },
});
