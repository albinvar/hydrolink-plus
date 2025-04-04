import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

const messages = [
  {
    id: "1",
    title: "Leak Detected",
    message: "Leak detected in pipeline A. Valve auto-closed.",
    type: "alert",
    icon: "water-alert",
  },
  {
    id: "2",
    title: "Valve Closed",
    message: "Auto-close triggered due to inactivity.",
    type: "info",
    icon: "valve-closed",
  },
  {
    id: "3",
    title: "Usage Spike",
    message: "250L used — above normal consumption!",
    type: "warning",
    icon: "chart-bar",
  },
  {
    id: "4",
    title: "All Clear",
    message: "System metrics are stable and normal.",
    type: "success",
    icon: "check-circle-outline",
  },
];

const getColor = (type) => {
  switch (type) {
    case "alert":
      return "#EF5350";
    case "warning":
      return "#FFB74D";
    case "success":
      return "#66BB6A";
    default:
      return "#42A5F5";
  }
};

export default function LiveNotificationPopups() {
  const [current, setCurrent] = useState(null);
  const position = useRef(new Animated.ValueXY()).current;

  const showRandomMessage = () => {
    const next = messages[Math.floor(Math.random() * messages.length)];
    setCurrent(next);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!current) {
        showRandomMessage();
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [current]);

  const dismissCard = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrent(null);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: Animated.event([null, { dx: position.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          dismissCard();
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!current) return null;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ translateX: position.x }],
          borderLeftColor: getColor(current.type),
        },
      ]}
      {...panResponder.panHandlers}
    >
      <MaterialCommunityIcons
        name={current.icon}
        size={24}
        color={getColor(current.type)}
        style={styles.icon}
      />
      <View style={styles.textWrap}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.message}>{current.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderLeftWidth: 5,
    zIndex: 100,
  },
  icon: {
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
  },
  message: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});
