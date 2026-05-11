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

const LEVELS = [
  {
    label: "Beginner",
    icon: "leaf-outline" as const,
    locked: false,
    color: "#10B981",
  },
  {
    label: "Easy",
    icon: "sunny-outline" as const,
    locked: false,
    color: "#3B82F6",
  },
  {
    label: "Medium",
    icon: "flame-outline" as const,
    locked: true,
    color: "#F59E0B",
  },
  {
    label: "Hard",
    icon: "skull-outline" as const,
    locked: true,
    color: "#EF4444",
  },
  {
    label: "Expert",
    icon: "rocket-outline" as const,
    locked: true,
    color: "#8B5CF6",
  },
];

export default function LevelQuizScreen() {
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
          <View style={[styles.headerIcon, { backgroundColor: "#CFFAFE" }]}>
            <Ionicons name="layers" size={32} color="#0891B2" />
          </View>
          <Text style={styles.headerTitle}>Level Quiz</Text>
          <Text style={styles.headerSub}>
            Challenge yourself level by level
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Select Difficulty</Text>

        {LEVELS.map((level, index) => (
          <TouchableOpacity
            key={level.label}
            style={[styles.levelCard, level.locked && styles.levelCardLocked]}
            activeOpacity={level.locked ? 1 : 0.85}
            disabled={level.locked}
            testID={`level-${level.label.toLowerCase()}`}
          >
            <View
              style={[
                styles.levelIconBg,
                { backgroundColor: level.color + "20" },
              ]}
            >
              <Ionicons name={level.icon} size={26} color={level.color} />
            </View>
            <View style={styles.levelTextBlock}>
              <Text
                style={[
                  styles.levelLabel,
                  level.locked && styles.levelLabelLocked,
                ]}
              >
                {level.label}
              </Text>
              <Text style={styles.levelDesc}>
                {index === 0
                  ? "Perfect for beginners"
                  : `Level ${index + 1} difficulty`}
              </Text>
            </View>
            {level.locked ? (
              <Ionicons name="lock-closed" size={20} color="#BFC3CB" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={level.color} />
            )}
          </TouchableOpacity>
        ))}
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
    backgroundColor: "#06B6D4",
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0D0D1B",
    marginBottom: 4,
  },
  levelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  levelCardLocked: {
    opacity: 0.55,
  },
  levelIconBg: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  levelTextBlock: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D0D1B",
    marginBottom: 3,
  },
  levelLabelLocked: {
    color: "#9CA3AF",
  },
  levelDesc: {
    fontSize: 12,
    color: "#6B7280",
  },
});
