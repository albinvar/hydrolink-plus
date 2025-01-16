import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function StarBackground() {
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
      const randomLeft = Math.random() * 100;
      const randomTop = Math.random() * 100;
      const randomSize = Math.random() * 4 + 2;

      return (
        <Animated.View
          key={index}
          style={[
            styles.star,
            {
              left: `${randomLeft}%`,
              top: `${randomTop}%`,
              width: randomSize,
              height: randomSize,
              opacity: anim,
            },
          ]}
        />
      );
    });
  };

  return <View style={styles.container}>{renderStars()}</View>;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1, // Send stars to the background
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
  },
});
