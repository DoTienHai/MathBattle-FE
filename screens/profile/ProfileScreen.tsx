import React, { useCallback, useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import {
  selectBasicInfo,
  selectPersonalStats,
  selectProfileError,
  selectProfileLoading,
  selectUserBadges,
} from "@/redux/selectors/profileSelectors";
import type { AppDispatch } from "@/redux/store";
import {
  fetchBasicProfile,
  fetchPersonalStats,
  fetchUserBadges,
} from "@/redux/thunks/profileThunks";
import { BadgesSection } from "@/components/profile/BadgesSection";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsGrid } from "@/components/profile/StatsGrid";

export function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const basicInfo = useSelector(selectBasicInfo);
  const stats = useSelector(selectPersonalStats);
  const badges = useSelector(selectUserBadges);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);

  const loadAll = useCallback(() => {
    void Promise.all([
      dispatch(fetchBasicProfile()),
      dispatch(fetchPersonalStats()),
      dispatch(fetchUserBadges()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const isRefreshing = loading.basicInfo || loading.stats || loading.badges;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={loadAll} />
        }
      >
        <View style={styles.header}>
          <View style={styles.bubbleTopRight} />
          <View style={styles.bubbleTopLeft} />
          <Text style={styles.screenTitle}>Profile</Text>
          <ProfileHeader info={basicInfo} isLoading={loading.basicInfo} />
        </View>

        {error.basicInfo ? (
          <Text style={styles.errorText}>{error.basicInfo}</Text>
        ) : null}

        <View style={styles.body}>
          <StatsGrid stats={stats} isLoading={loading.stats} />
          {error.stats ? (
            <Text style={styles.errorText}>{error.stats}</Text>
          ) : null}

          <View style={styles.divider} />

          <BadgesSection badges={badges} isLoading={loading.badges} />
          {error.badges ? (
            <Text style={styles.errorText}>{error.badges}</Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9EDF5",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: "#2E67C7",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    overflow: "hidden",
  },
  bubbleTopRight: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(167, 183, 255, 0.35)",
    right: -24,
    top: -46,
  },
  bubbleTopLeft: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(167, 183, 255, 0.28)",
    left: 20,
    top: 12,
  },
  screenTitle: {
    fontSize: 52,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 58,
  },
  body: {
    marginTop: -14,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#0E264A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8EDF4",
    marginHorizontal: 16,
  },
  errorText: {
    fontSize: 13,
    color: "#E74C4C",
    textAlign: "center",
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
});
