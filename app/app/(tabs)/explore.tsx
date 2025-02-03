import { StyleSheet, View, Image, Animated, ScrollView } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useRef } from "react";

export default function CreditsScreen() {
  const starsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(starsAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <ScrollView style={styles.scrollContainer}>
      <Animated.View style={[styles.background, { opacity: starsAnim }]} />
      <ThemedView style={styles.container}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={{
            width: 300,
            height: 200,
            marginBottom: 15,
            resizeMode: "contain",
          }}
        />
        <ThemedText type="subtitle" style={styles.subtitle}>
          Version 1.0.0
        </ThemedText>
        <ThemedText style={styles.description}>
          HydroLink Plus is an innovative project aimed at enhancing traditional
          water meters with smart technology.
        </ThemedText>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Project Coordinator
        </ThemedText>
        <View style={styles.creditBox}>
          <Image
            source={require("@/assets/images/devi-gopal.jpeg")}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <ThemedText style={styles.name}>Ms. Devi Gopal T</ThemedText>
            <ThemedText>Project Guide</ThemedText>
          </View>
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Development Team
        </ThemedText>
        <View style={styles.listContainer}>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.creditBox}>
              <Image source={member.image} style={styles.avatar} />
              <View style={styles.textContainer}>
                <ThemedText style={styles.name}>{member.name}</ThemedText>
                <ThemedText>{member.role}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    opacity: 0.3,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#BBBBBB",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "monospace",
  },
  description: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  listContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
  creditBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "rgba(30, 30, 30, 0.8)",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.7)",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "rgba(166, 183, 186, 0.7)",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
