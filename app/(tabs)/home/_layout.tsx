import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="daily-quiz" />
      <Stack.Screen name="level-quiz" />
      <Stack.Screen name="mini-game" />
      <Stack.Screen name="quick-calculate" />
    </Stack>
  );
}
