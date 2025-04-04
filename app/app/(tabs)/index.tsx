import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(30)).current;
  const buttonsFade = useRef(new Animated.Value(0)).current;

  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const starAnimations = Array.from(
    { length: 25 },
    () => useRef(new Animated.Value(0)).current
  );

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslate, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    starAnimations.forEach((anim) => {
      const loop = () => {
        anim.setValue(0);
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: Math.random() * 2500 + 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: Math.random() * 2500 + 2000,
            useNativeDriver: true,
          }),
        ]).start(loop);
      };
      loop();
    });
  }, [starAnimations]);

  // Infinite auto-scroll effect
  useEffect(() => {
    let direction = 1;
    let offset = 0;
    const scrollInterval = setInterval(() => {
      if (scrollRef.current) {
        offset += direction * 150;
        if (offset >= 400 || offset <= 0) direction *= -1;
        scrollRef.current.scrollTo({ x: offset, animated: true });
      }
    }, 2000);
    return () => clearInterval(scrollInterval);
  }, []);

  const renderStars = () =>
    starAnimations.map((anim, i) => {
      const left = Math.random() * width;
      const top = Math.random() * height;
      const size = Math.random() * 5 + 2;

      return (
        <Animated.View
          key={i}
          style={[
            styles.star,
            {
              width: size,
              height: size,
              left,
              top,
              opacity: anim,
              backgroundColor: `rgba(255, 255, 255, 0.8)`,
            },
          ]}
        />
      );
    });

  return (
    <LinearGradient colors={["#2196F3", "#0D47A1"]} style={styles.container}>
      {renderStars()}

      <TouchableOpacity
        onPress={() => router.push("/explore")}
        style={styles.creditsBtn}
      >
        <MaterialCommunityIcons
          name="account-group"
          size={26}
          color="#E1F5FE"
        />
      </TouchableOpacity>

      <Animated.View style={[styles.iconWrap, { opacity: logoOpacity }]}>
        <MaterialCommunityIcons name="water" size={100} color="#E1F5FE" />
      </Animated.View>

      <Animated.Text
        style={[
          styles.title,
          {
            transform: [{ translateY: titleTranslate }],
            opacity: logoOpacity,
          },
        ]}
      >
        HydroLink Plus
      </Animated.Text>

      <Text style={styles.tagline}>Smart Water Management Simplified</Text>

      <Animated.View style={{ opacity: buttonsFade, width: "100%" }}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContent}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {benefits.map((item, idx) => (
          <View key={idx} style={styles.benefitCard}>
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color="#E1F5FE"
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.benefitText}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer with blue heart */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with{" "}
          <MaterialCommunityIcons name="heart" size={14} color="#29B6F6" /> by
          HydroLink Team
        </Text>
      </View>
    </LinearGradient>
  );
}

const benefits = [
  { icon: "clock-check", text: "24/7 Monitoring" },
  { icon: "water-alert", text: "Leak Detection" },
  { icon: "cellphone-link", text: "IoT Powered Meters" },
  { icon: "chart-bar", text: "Smart Insights" },
  { icon: "account-shield", text: "Secure & Private" },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingTop: 70,
  },
  creditsBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 50,
    zIndex: 99,
  },
  iconWrap: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "#BBDEFB",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButton: {
    backgroundColor: "#03A9F4",
  },
  signupButton: {
    backgroundColor: "#0288D1",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    marginTop: 30,
    maxHeight: 80,
  },
  benefitCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 14,
    color: "#E1F5FE",
    fontWeight: "500",
  },
  star: {
    position: "absolute",
    borderRadius: 50,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#E3F2FD",
    fontSize: 12,
    fontWeight: "500",
  },
});
