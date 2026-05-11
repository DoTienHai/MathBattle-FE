import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Providers } from "@/providers";

export const unstable_settings = {
  anchor: "auth/login",
};

/**
 * AppNavigator is rendered INSIDE <Providers>.
 * Root layout must render a navigator on first render.
 * Auth redirect logic is handled in route/group layouts via <Redirect />.
 */
function AppNavigator() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Auth flow is guarded by nested layouts. */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

/**
 * RootLayout only wraps with Providers - NO hooks here.
 */
export default function RootLayout() {
  return (
    <Providers>
      <AppNavigator />
    </Providers>
  );
}
