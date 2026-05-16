import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { Badge, UserBadges } from "@/types/profile";

const BADGE_COLORS = ["#4FA9F7", "#F7A24F", "#7B4FF7", "#4FF797", "#F74F7B"];

function getBadgeColor(badgeId: number): string {
  return BADGE_COLORS[badgeId % BADGE_COLORS.length];
}

function formatEarnedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface BadgeModalProps {
  badge: Badge | null;
  onClose: () => void;
}

function BadgeModal({ badge, onClose }: BadgeModalProps) {
  return (
    <Modal
      transparent
      visible={badge !== null}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {badge ? (
            <>
              <View
                style={[
                  styles.modalAvatar,
                  { backgroundColor: getBadgeColor(badge.badgeId) },
                ]}
              >
                <Text style={styles.modalAvatarText}>
                  {badge.name[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.modalTitle}>{badge.name}</Text>
              <Text style={styles.modalDescription}>{badge.description}</Text>
              <Text style={styles.modalDate}>
                Earned {formatEarnedDate(badge.earnedAt)}
              </Text>
            </>
          ) : null}
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

interface BadgeListItemProps {
  badge: Badge;
  onPress: (badge: Badge) => void;
}

function BadgeListItem({ badge, onPress }: BadgeListItemProps) {
  const handlePress = () => onPress(badge);

  return (
    <Pressable style={styles.badgeItem} onPress={handlePress}>
      <View
        style={[
          styles.badgeCircle,
          { backgroundColor: getBadgeColor(badge.badgeId) },
        ]}
      >
        <Text style={styles.badgeInitial}>{badge.name[0].toUpperCase()}</Text>
      </View>
      <Text style={styles.badgeName} numberOfLines={2}>
        {badge.name}
      </Text>
    </Pressable>
  );
}

interface BadgesSectionProps {
  badges: UserBadges | null;
  isLoading: boolean;
}

export function BadgesSection({ badges, isLoading }: BadgesSectionProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const handleBadgePress = (badge: Badge) => setSelectedBadge(badge);
  const handleCloseModal = () => setSelectedBadge(null);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.skeletonRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.skeletonItem}>
              <View style={styles.skeletonCircle} />
              <View style={styles.skeletonLine} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!badges || badges.total === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Badges (0 earned)</Text>
        <Text style={styles.emptyText}>
          No badges yet — start playing to earn your first!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Badges ({badges.total} earned)</Text>
      <FlatList
        data={badges.badges}
        keyExtractor={(item) => item.badgeId.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <BadgeListItem badge={item} onPress={handleBadgePress} />
        )}
        contentContainerStyle={styles.listContent}
      />
      <BadgeModal badge={selectedBadge} onClose={handleCloseModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D0D1B",
    marginBottom: 12,
  },
  listContent: {
    gap: 12,
  },
  badgeItem: {
    width: 80,
    alignItems: "center",
    gap: 8,
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeInitial: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  badgeName: {
    fontSize: 11,
    fontWeight: "500",
    color: "#4E5D78",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#7A8295",
    textAlign: "center",
    paddingVertical: 12,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 12,
  },
  skeletonItem: {
    width: 80,
    alignItems: "center",
    gap: 8,
  },
  skeletonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8EDF4",
  },
  skeletonLine: {
    width: 56,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E8EDF4",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
  },
  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalAvatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A2A44",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#4E5D78",
    textAlign: "center",
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 12,
    color: "#7A8295",
    marginBottom: 20,
  },
  modalCloseButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#EEF2F8",
  },
  modalCloseText: {
    color: "#355182",
    fontWeight: "600",
    fontSize: 14,
  },
});
