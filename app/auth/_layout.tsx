import { Redirect, Stack } from "expo-router";
import React from "react";
import { useSelector } from "react-redux";

import { selectIsAuthenticated } from "@/redux/selectors/authSelectors";

export default function AuthLayout() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
