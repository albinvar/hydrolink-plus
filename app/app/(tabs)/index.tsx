import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Use useRouter from expo-router

export default function SplashScreen() {
  const router = useRouter(); // Access router instead of navigation
  const starAnimations = Array.from(
    { length: 20 },
    () => useRef(new Animated.Value(0)).current
  );

  useEffect(() => {
    starAnimations.forEach((anim) => {
      const loopAnimation = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: Math.random() * 1500 + 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: Math.random() * 1500 + 500,
            useNativeDriver: true,
          }),
        ]).start(() => loopAnimation());
      };
      setTimeout(loopAnimation, Math.random() * 2000);
    });
  }, [starAnimations]);

  const renderStars = () => {
    return starAnimations.map((anim, index) => {
      const randomLeft = Math.random() * 100 + "%";
      const randomTop = Math.random() * 100 + "%";
      const randomSize = Math.random() * 4 + 2;

      return (
        <Animated.View
          key={index}
          style={[
            styles.star,
            {
              left: randomLeft,
              top: randomTop,
              width: randomSize,
              height: randomSize,
              opacity: anim,
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      {renderStars()}
      <MaterialCommunityIcons name="water" size={100} color="#4FC3F7" />
      <Text style={styles.title}>HydroLink Plus</Text>
      <Text style={styles.tagline}>Smart Water Management Simplified</Text>
      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={() => router.push("login")} // Navigate using router
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.signupButton]}
        onPress={() => router.push("signup")} // Navigate using router
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  title: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: 20,
  },
  tagline: {
    fontSize: 16,
    color: "#B0BEC5",
    marginVertical: 10,
    textAlign: "center",
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#4FC3F7",
  },
  signupButton: {
    backgroundColor: "#1E88E5",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
  },
});
