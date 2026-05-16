import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { PersonalStats } from "@/types/profile";

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

interface StatsGridProps {
  stats: PersonalStats | null;
  isLoading: boolean;
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading || !stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.row}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={[styles.card, styles.skeletonCard]} />
          ))}
        </View>
        <View style={styles.row}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={[styles.card, styles.skeletonCard]} />
          ))}
        </View>
      </View>
    );
  }

  const topRow: StatCardProps[] = [
    { label: "ELO", value: stats.elo.toString() },
    { label: "Global Rank", value: `#${stats.globalRank}` },
    { label: "Win Rate", value: `${Math.round(stats.winRate * 100)}%` },
  ];

  const bottomRow: StatCardProps[] = [
    { label: "Streak", value: `${stats.currentStreak}d` },
    { label: "Best Streak", value: `${stats.longestStreak}d` },
    { label: "Levels", value: stats.levelsCompleted.toString() },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Statistics</Text>
      <View style={styles.row}>
        {topRow.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} />
        ))}
      </View>
      <View style={styles.row}>
        {bottomRow.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} />
        ))}
      </View>
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
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#EEF2F8",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 72,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F7FE4",
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#7A8295",
    marginTop: 4,
    textAlign: "center",
  },
  skeletonCard: {
    backgroundColor: "#E8EDF4",
  },
});
