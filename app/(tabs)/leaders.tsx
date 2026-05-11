import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function LeadersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Leaders</Text>
        <Text style={styles.subtitle}>
          Leaderboard and top players will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FC",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0D0D1B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#7A8295",
    textAlign: "center",
  },
});
