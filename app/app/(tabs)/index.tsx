import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SplashScreen({ navigation }) {
  // Generate an array of Animated.Values for independent star blinking
  const starAnimations = Array.from(
    { length: 20 },
    () => useRef(new Animated.Value(0)).current
  );

  // Start animations for each star independently
  useEffect(() => {
    starAnimations.forEach((anim) => {
      const loopAnimation = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: Math.random() * 1500 + 500, // Random duration between 500ms and 2000ms
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: Math.random() * 1500 + 500, // Random duration between 500ms and 2000ms
            useNativeDriver: true,
          }),
        ]).start(() => loopAnimation()); // Loop the animation
      };
      // Start animation with a random initial delay
      setTimeout(loopAnimation, Math.random() * 2000);
    });
  }, [starAnimations]);

  // Generate random stars
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
              opacity: anim, // Bind opacity to the animation
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Stars */}
      {renderStars()}

      {/* Water droplet icon */}
      <MaterialCommunityIcons name="water" size={100} color="#4FC3F7" />
      {/* App title */}
      <Text style={styles.title}>HydroLink Plus</Text>
      {/* Tagline */}
      <Text style={styles.tagline}>Smart Water Management Simplified</Text>

      {/* Login button */}
      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign Up button */}
      <TouchableOpacity
        style={[styles.button, styles.signupButton]}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
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
    backgroundColor: "#4FC3F7", // Light blue
  },
  signupButton: {
    backgroundColor: "#1E88E5", // Slightly darker blue
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
