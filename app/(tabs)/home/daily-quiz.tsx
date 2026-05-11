import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DailyQuizScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.bubbleTopRight} />
        <View style={styles.bubbleTopLeft} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="back-button"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: "#DBEAFE" }]}>
            <Ionicons name="calendar" size={32} color="#2563EB" />
          </View>
          <Text style={styles.headerTitle}>Daily Quiz</Text>
          <Text style={styles.headerSub}>
            Solve daily problems and increase your IQ
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Placeholder content */}
        <View style={styles.comingSoonCard}>
          <Ionicons name="time-outline" size={48} color="#3B82F6" />
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Daily challenges refresh every 24 hours. Stay tuned for new
            problems!
          </Text>
        </View>

        {/* Info cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="trophy-outline" size={24} color="#3B82F6" />
            <Text style={styles.infoValue}>10</Text>
            <Text style={styles.infoLabel}>Questions</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="timer-outline" size={24} color="#3B82F6" />
            <Text style={styles.infoValue}>5 min</Text>
            <Text style={styles.infoLabel}>Time Limit</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="star-outline" size={24} color="#3B82F6" />
            <Text style={styles.infoValue}>+50 IQ</Text>
            <Text style={styles.infoLabel}>Reward</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  header: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    overflow: "hidden",
    position: "relative",
  },
  bubbleTopRight: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: -30,
    right: -20,
  },
  bubbleTopLeft: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.10)",
    bottom: -20,
    left: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
    gap: 4,
  },
  backLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerContent: {
    alignItems: "flex-start",
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  comingSoonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0D0D1B",
    marginTop: 12,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D0D1B",
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
});
