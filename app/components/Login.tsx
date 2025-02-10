import { View, TextInput, Button } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export function Login() {
  return (
    <ThemedView className="flex-1 p-4">
      <ThemedText className="text-xl mb-4">Login</ThemedText>
      <TextInput
        className="border border-gray-300 p-2 mb-4 rounded"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="border border-gray-300 p-2 mb-4 rounded"
        placeholder="Password"
        secureTextEntry
      />
      <Button title="Login" onPress={() => {}} />
    </ThemedView>
  );
}
