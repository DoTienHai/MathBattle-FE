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
import { useSelector } from "react-redux";

import { selectUserFullName } from "@/redux/selectors/authSelectors";

interface MenuItemData {
  id: string;
  title: string;
  description: string;
  route: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  iconColor: string;
  accentColor: string;
}

const MENU_ITEMS: MenuItemData[] = [
  {
    id: "daily-quiz",
    title: "DAILY QUIZ",
    description: "Solve daily problems and increase your IQ",
    route: "/(tabs)/home/daily-quiz",
    iconName: "calendar",
    iconBg: "#DBEAFE",
    iconColor: "#2563EB",
    accentColor: "#3B82F6",
  },
  {
    id: "level-quiz",
    title: "LEVEL QUIZ",
    description: "Challenge yourself level by level",
    route: "/(tabs)/home/level-quiz",
    iconName: "layers",
    iconBg: "#CFFAFE",
    iconColor: "#0891B2",
    accentColor: "#06B6D4",
  },
  {
    id: "mini-game",
    title: "MINI GAME",
    description: "Quick fun games to sharpen your mind",
    route: "/(tabs)/home/mini-game",
    iconName: "game-controller",
    iconBg: "#EDE9FE",
    iconColor: "#7C3AED",
    accentColor: "#8B5CF6",
  },
  {
    id: "quick-calculate",
    title: "QUICK CALCULATE",
    description: "Speed math challenges for mental agility",
    route: "/(tabs)/home/quick-calculate",
    iconName: "flash",
    iconBg: "#D1FAE5",
    iconColor: "#059669",
    accentColor: "#10B981",
  },
];

interface MenuCardProps {
  item: MenuItemData;
  onPress: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={item.title}
    testID={`menu-card-${item.id}`}
  >
    {/* Left icon area */}
    <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
      <View style={[styles.iconInner, { backgroundColor: item.iconBg }]}>
        {/* Decorative circles mimicking geometric design */}
        <View
          style={[
            styles.decorCircle,
            { backgroundColor: item.accentColor + "30", top: -8, right: -8 },
          ]}
        />
        <View
          style={[
            styles.decorCircleSmall,
            { backgroundColor: item.accentColor + "40", bottom: -4, left: -4 },
          ]}
        />
        <Ionicons name={item.iconName} size={40} color={item.iconColor} />
      </View>
    </View>

    {/* Right text area */}
    <View style={styles.cardText}>
      <Text style={[styles.cardTitle, { color: item.accentColor }]}>
        {item.title}
      </Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </View>

    {/* Arrow */}
    <Ionicons name="chevron-forward" size={20} color="#BFC3CB" />
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const userFullName = useSelector(selectUserFullName);

  const displayName = userFullName?.split(" ").pop() ?? "Player";

  const handleMenuPress = (route: string) => {
    router.push(route as `/${string}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.bubbleTopRight} />
          <View style={styles.bubbleTopLeft} />
          <View style={styles.bubbleMid} />

          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Home</Text>
              <Text style={styles.headerSub}>Choose a game mode</Text>
            </View>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeName}>{displayName}</Text>
              <View style={styles.headerBadgeRow}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.headerBadgeLevel}>Level 1</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Cards */}
        <View style={styles.cardList}>
          {MENU_ITEMS.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onPress={() => handleMenuPress(item.route)}
            />
          ))}
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
  scrollContent: {
    paddingBottom: 32,
  },

  /* Header */
  header: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    overflow: "hidden",
    position: "relative",
  },
  bubbleTopRight: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: -40,
    right: -30,
  },
  bubbleTopLeft: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.10)",
    top: 10,
    left: -20,
  },
  bubbleMid: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -30,
    right: 60,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  headerBadge: {
    alignItems: "flex-end",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerBadgeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  headerBadgeLevel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },

  /* Cards */
  cardList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
  },
  iconInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  decorCircle: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  decorCircleSmall: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
});
