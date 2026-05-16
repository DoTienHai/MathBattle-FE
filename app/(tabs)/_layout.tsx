import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

import { HapticTab } from "@/components/haptic-tab";
import { selectIsAuthenticated } from "@/redux/selectors/authSelectors";

export default function TabLayout() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4FA9F7",
        tabBarInactiveTintColor: "#BFC3CB",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "grid" : "grid-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leaders"
        options={{
          title: "Leaders",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "star" : "star-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "settings" : "settings-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 22 : 10,
    borderTopWidth: 0,
    backgroundColor: "#FFFFFF",
    elevation: 12,
    shadowColor: "#0A1E3A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});
