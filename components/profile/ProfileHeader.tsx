import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { BasicProfileInfo } from "@/types/profile";

interface ProfileHeaderProps {
  info: BasicProfileInfo | null;
  isLoading: boolean;
}

function getInitials(fullName: string | null, username: string): string {
  const source = fullName?.trim() || username;
  const words = source.split(" ").filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function formatJoinDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function ProfileHeader({ info, isLoading }: ProfileHeaderProps) {
  if (isLoading || !info) {
    return (
      <View style={styles.container}>
        <View style={[styles.avatar, styles.skeletonCircle]} />
        <View style={styles.textBlock}>
          <View style={[styles.skeletonLine, { width: 120 }]} />
          <View style={[styles.skeletonLine, { width: 80, marginTop: 6 }]} />
          <View style={[styles.skeletonLine, { width: 150, marginTop: 6 }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {getInitials(info.fullName, info.username)}
        </Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.username}>@{info.username}</Text>
        <Text style={styles.level}>Level {info.currentLevel}</Text>
        {info.fullName ? (
          <Text style={styles.fullName}>{info.fullName}</Text>
        ) : null}
        <Text style={styles.joinDate}>
          Member since {formatJoinDate(info.joinDate)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  textBlock: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  level: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  fullName: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  joinDate: {
    fontSize: 12,
    fontWeight: "400",
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  skeletonCircle: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
