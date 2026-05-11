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

const GAMES = [
  {
    id: "number-pop",
    title: "Number Pop",
    description: "Pop the correct answer before time runs out!",
    icon: "ellipse-outline" as const,
    iconBg: "#EDE9FE",
    iconColor: "#7C3AED",
    badge: "HOT",
    badgeColor: "#EF4444",
  },
  {
    id: "math-match",
    title: "Math Match",
    description: "Match equations with their correct answers",
    icon: "grid-outline" as const,
    iconBg: "#DBEAFE",
    iconColor: "#2563EB",
    badge: "NEW",
    badgeColor: "#3B82F6",
  },
  {
    id: "brain-rush",
    title: "Brain Rush",
    description: "Answer as many as you can in 60 seconds",
    icon: "flash-outline" as const,
    iconBg: "#D1FAE5",
    iconColor: "#059669",
    badge: null,
    badgeColor: null,
  },
];

export default function MiniGameScreen() {
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
          <View style={[styles.headerIcon, { backgroundColor: "#EDE9FE" }]}>
            <Ionicons name="game-controller" size={32} color="#7C3AED" />
          </View>
          <Text style={styles.headerTitle}>Mini Game</Text>
          <Text style={styles.headerSub}>
            Quick fun games to sharpen your mind
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Choose a Game</Text>

        {GAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            activeOpacity={0.85}
            testID={`game-${game.id}`}
          >
            <View style={[styles.gameIconBg, { backgroundColor: game.iconBg }]}>
              <Ionicons name={game.icon} size={30} color={game.iconColor} />
            </View>
            <View style={styles.gameTextBlock}>
              <View style={styles.gameTitleRow}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                {game.badge && (
                  <View
                    style={[
                      styles.gameBadge,
                      { backgroundColor: game.badgeColor! },
                    ]}
                  >
                    <Text style={styles.gameBadgeText}>{game.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.gameDesc}>{game.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BFC3CB" />
          </TouchableOpacity>
        ))}

        <View style={styles.comingSoonCard}>
          <Ionicons name="construct-outline" size={36} color="#8B5CF6" />
          <Text style={styles.comingSoonTitle}>More games coming soon!</Text>
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
    backgroundColor: "#8B5CF6",
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
  gameCard: {
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
  gameIconBg: {
    width: 58,
    height: 58,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  gameTextBlock: {
    flex: 1,
  },
  gameTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D0D1B",
  },
  gameBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gameBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  gameDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
  },
  comingSoonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  comingSoonTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
});
