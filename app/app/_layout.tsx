import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Splash screen */}
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        {/* Login screen */}
        <Stack.Screen
          name="login"
          options={{ title: "Login", headerShown: true }}
        />
        {/* Sign-Up screen */}
        <Stack.Screen
          name="signup"
          options={{ title: "Sign Up", headerShown: true }}
        />
        {/* Sign-Up QR screen */}
        <Stack.Screen
          name="signup-qr"
          options={{ title: "Scan QR", headerShown: true }}
        />
        {/* Linking Process screen */}
        <Stack.Screen
          name="linking-process"
          options={{ title: "Linking Process", headerShown: true }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
