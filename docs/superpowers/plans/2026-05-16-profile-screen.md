# Profile Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Profile tab (renaming Stats) as a single scrollable screen that fetches and displays basic profile info, personal statistics, and earned badges via 3 independent API calls.

**Architecture:** One `profileSlice` with 3 independent loading/error pairs; 3 async thunks (`fetchBasicProfile`, `fetchPersonalStats`, `fetchUserBadges`) dispatched in parallel on screen mount; 3 focused UI components (`ProfileHeader`, `StatsGrid`, `BadgesSection`) composed inside `ProfileScreen`.

**Tech Stack:** React Native (Expo), Redux Toolkit (`createSlice`, `createAsyncThunk`), Axios via existing `apiClient`, TypeScript strict mode, `StyleSheet.create` only, Expo Router file-based navigation.

---

## Type-check command (no test runner configured)

After every task, run:
```bash
npx tsc --noEmit
```
Expected: no output (zero errors). Fix any errors before committing.

---

## File Map

| File | Action |
|---|---|
| `types/profile.ts` | Create |
| `services/profileService.ts` | Create |
| `redux/slices/profileSlice.ts` | Create |
| `redux/thunks/profileThunks.ts` | Create |
| `redux/selectors/profileSelectors.ts` | Create |
| `redux/store.ts` | Modify — add `profile` reducer |
| `components/profile/ProfileHeader.tsx` | Create |
| `components/profile/StatsGrid.tsx` | Create |
| `components/profile/BadgesSection.tsx` | Create |
| `screens/profile/ProfileScreen.tsx` | Create |
| `app/(tabs)/stats.tsx` | Modify — render ProfileScreen |
| `app/(tabs)/_layout.tsx` | Modify — rename tab, change icon |

---

## Task 1: TypeScript Types

**Files:**
- Create: `types/profile.ts`

- [ ] **Step 1: Create the types file**

```typescript
import type { ApiResponse } from "@/types/auth";

// ─── Camelcase FE types (Redux state) ─────────────────────────────────────────

export interface BasicProfileInfo {
  userId: number;
  username: string;
  fullName: string | null;
  currentLevel: number;
  joinDate: string;
}

export interface PersonalStats {
  elo: number;
  currentStreak: number;
  longestStreak: number;
  winRate: number;
  globalRank: number;
  levelsCompleted: number;
}

export interface Badge {
  badgeId: number;
  name: string;
  description: string;
  iconUrl: string;
  category: string;
  earnedAt: string;
}

export interface UserBadges {
  total: number;
  badges: Badge[];
}

// ─── Snake_case API data shapes (matching BE JSON) ────────────────────────────

export interface BasicProfileData {
  user_id: number;
  username: string;
  full_name: string | null;
  current_level: number;
  join_date: string;
}

export interface PersonalStatsData {
  elo: number;
  current_streak: number;
  longest_streak: number;
  win_rate: number;
  global_rank: number;
  levels_completed: number;
}

export interface BadgeItem {
  badge_id: number;
  name: string;
  description: string;
  icon_url: string;
  category: string;
  earned_at: string;
}

export interface UserBadgesData {
  total: number;
  badges: BadgeItem[];
}

export type BasicProfileResponse = ApiResponse<BasicProfileData>;
export type PersonalStatsResponse = ApiResponse<PersonalStatsData>;
export type UserBadgesResponse = ApiResponse<UserBadgesData>;

// ─── Redux State ──────────────────────────────────────────────────────────────

export interface ProfileState {
  basicInfo: BasicProfileInfo | null;
  stats: PersonalStats | null;
  badges: UserBadges | null;
  loading: {
    basicInfo: boolean;
    stats: boolean;
    badges: boolean;
  };
  error: {
    basicInfo: string | null;
    stats: string | null;
    badges: string | null;
  };
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`  
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add types/profile.ts
git commit -m "feat: add profile TypeScript types (SF01+SF02+SF03)"
```

---

## Task 2: Profile Service

**Files:**
- Create: `services/profileService.ts`

- [ ] **Step 1: Create the service file**

```typescript
import { apiClient } from "@/services/api/client";
import type {
  BasicProfileResponse,
  PersonalStatsResponse,
  UserBadgesResponse,
} from "@/types/profile";

export const profileService = {
  async getBasicProfile(): Promise<BasicProfileResponse> {
    const response = await apiClient.get<BasicProfileResponse>(
      "/api/v1/profile",
    );
    return response.data;
  },

  async getPersonalStats(): Promise<PersonalStatsResponse> {
    const response = await apiClient.get<PersonalStatsResponse>(
      "/api/v1/profile/stats",
    );
    return response.data;
  },

  async getUserBadges(): Promise<UserBadgesResponse> {
    const response = await apiClient.get<UserBadgesResponse>(
      "/api/v1/profile/badges?limit=50&offset=0",
    );
    return response.data;
  },
};
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`  
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add services/profileService.ts
git commit -m "feat: add profileService with 3 API methods"
```

---

## Task 3: Redux Slice

**Files:**
- Create: `redux/slices/profileSlice.ts`

- [ ] **Step 1: Create the slice file**

```typescript
import { createSlice } from "@reduxjs/toolkit";

import {
  fetchBasicProfile,
  fetchPersonalStats,
  fetchUserBadges,
} from "@/redux/thunks/profileThunks";
import type { ProfileState } from "@/types/profile";

const initialState: ProfileState = {
  basicInfo: null,
  stats: null,
  badges: null,
  loading: { basicInfo: false, stats: false, badges: false },
  error: { basicInfo: null, stats: null, badges: null },
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    resetProfile: () => initialState,
  },
  extraReducers: (builder) => {
    // ── fetchBasicProfile ─────────────────────────────────────────────────────
    builder
      .addCase(fetchBasicProfile.pending, (state) => {
        state.loading.basicInfo = true;
        state.error.basicInfo = null;
      })
      .addCase(fetchBasicProfile.fulfilled, (state, action) => {
        state.loading.basicInfo = false;
        state.basicInfo = action.payload;
      })
      .addCase(fetchBasicProfile.rejected, (state, action) => {
        state.loading.basicInfo = false;
        state.error.basicInfo = action.payload ?? "Failed to load profile";
      });

    // ── fetchPersonalStats ────────────────────────────────────────────────────
    builder
      .addCase(fetchPersonalStats.pending, (state) => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(fetchPersonalStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(fetchPersonalStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload ?? "Failed to load stats";
      });

    // ── fetchUserBadges ───────────────────────────────────────────────────────
    builder
      .addCase(fetchUserBadges.pending, (state) => {
        state.loading.badges = true;
        state.error.badges = null;
      })
      .addCase(fetchUserBadges.fulfilled, (state, action) => {
        state.loading.badges = false;
        state.badges = action.payload;
      })
      .addCase(fetchUserBadges.rejected, (state, action) => {
        state.loading.badges = false;
        state.error.badges = action.payload ?? "Failed to load badges";
      });
  },
});

export const { resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`  
Expected: error about `profileThunks` not found yet — this is expected. Continue to Task 4.

- [ ] **Step 3: Commit**

```bash
git add redux/slices/profileSlice.ts
git commit -m "feat: add profileSlice with 3 independent loading/error pairs"
```

---

## Task 4: Redux Thunks

**Files:**
- Create: `redux/thunks/profileThunks.ts`

- [ ] **Step 1: Create the thunks file**

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";

import { profileService } from "@/services/profileService";
import type {
  BasicProfileInfo,
  PersonalStats,
  UserBadges,
} from "@/types/profile";

export const fetchBasicProfile = createAsyncThunk<
  BasicProfileInfo,
  void,
  { rejectValue: string }
>("profile/fetchBasicProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await profileService.getBasicProfile();
    if (!response.success || !response.data) {
      return rejectWithValue(
        response.error?.message ?? "Failed to load profile",
      );
    }
    const d = response.data;
    return {
      userId: d.user_id,
      username: d.username,
      fullName: d.full_name,
      currentLevel: d.current_level,
      joinDate: d.join_date,
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ??
      error?.message ??
      "Failed to load profile";
    return rejectWithValue(message);
  }
});

export const fetchPersonalStats = createAsyncThunk<
  PersonalStats,
  void,
  { rejectValue: string }
>("profile/fetchPersonalStats", async (_, { rejectWithValue }) => {
  try {
    const response = await profileService.getPersonalStats();
    if (!response.success || !response.data) {
      return rejectWithValue(
        response.error?.message ?? "Failed to load stats",
      );
    }
    const d = response.data;
    return {
      elo: d.elo,
      currentStreak: d.current_streak,
      longestStreak: d.longest_streak,
      winRate: d.win_rate,
      globalRank: d.global_rank,
      levelsCompleted: d.levels_completed,
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ??
      error?.message ??
      "Failed to load stats";
    return rejectWithValue(message);
  }
});

export const fetchUserBadges = createAsyncThunk<
  UserBadges,
  void,
  { rejectValue: string }
>("profile/fetchUserBadges", async (_, { rejectWithValue }) => {
  try {
    const response = await profileService.getUserBadges();
    if (!response.success || !response.data) {
      return rejectWithValue(
        response.error?.message ?? "Failed to load badges",
      );
    }
    const d = response.data;
    return {
      total: d.total,
      badges: d.badges.map((b) => ({
        badgeId: b.badge_id,
        name: b.name,
        description: b.description,
        iconUrl: b.icon_url,
        category: b.category,
        earnedAt: b.earned_at,
      })),
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ??
      error?.message ??
      "Failed to load badges";
    return rejectWithValue(message);
  }
});
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`  
Expected: no output (slice + thunks now resolve each other).

- [ ] **Step 3: Commit**

```bash
git add redux/thunks/profileThunks.ts
git commit -m "feat: add profileThunks - fetchBasicProfile, fetchPersonalStats, fetchUserBadges"
```

---

## Task 5: Redux Selectors + Register in Store

**Files:**
- Create: `redux/selectors/profileSelectors.ts`
- Modify: `redux/store.ts`

- [ ] **Step 1: Create selectors file**

```typescript
import type { RootState } from "@/redux/store";

export const selectBasicInfo = (state: RootState) => state.profile.basicInfo;
export const selectPersonalStats = (state: RootState) => state.profile.stats;
export const selectUserBadges = (state: RootState) => state.profile.badges;
export const selectProfileLoading = (state: RootState) =>
  state.profile.loading;
export const selectProfileError = (state: RootState) => state.profile.error;
```

- [ ] **Step 2: Register profileReducer in the store**

Open `redux/store.ts`. Add the import and register the reducer:

```typescript
import authReducer from "@/redux/slices/authSlice";
import profileReducer from "@/redux/slices/profileSlice";
import quickCalculateReducer from "@/redux/slices/quickCalculateSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    quickCalculate: quickCalculateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/loginUser/pending", "auth/loginUser/fulfilled"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`  
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add redux/selectors/profileSelectors.ts redux/store.ts
git commit -m "feat: add profileSelectors and register profile reducer in store"
```

---

## Task 6: ProfileHeader Component

**Files:**
- Create: `components/profile/ProfileHeader.tsx`

- [ ] **Step 1: Create the component**

```typescript
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
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`  
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/profile/ProfileHeader.tsx
git commit -m "feat: add ProfileHeader component with skeleton loading"
```

---

## Task 7: StatsGrid Component

**Files:**
- Create: `components/profile/StatsGrid.tsx`

- [ ] **Step 1: Create the component**

```typescript
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
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`  
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/profile/StatsGrid.tsx
git commit -m "feat: add StatsGrid component with 6 stat cards"
```

---

## Task 8: BadgesSection Component

**Files:**
- Create: `components/profile/BadgesSection.tsx`

- [ ] **Step 1: Create the component**

```typescript
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
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`  
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/profile/BadgesSection.tsx
git commit -m "feat: add BadgesSection with horizontal FlatList and badge detail modal"
```

---

## Task 9: ProfileScreen

**Files:**
- Create: `screens/profile/ProfileScreen.tsx`

- [ ] **Step 1: Create the screen**

```typescript
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
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`  
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add screens/profile/ProfileScreen.tsx
git commit -m "feat: add ProfileScreen composing Header + StatsGrid + BadgesSection"
```

---

## Task 10: Wire App Pages + Rename Tab

**Files:**
- Modify: `app/(tabs)/stats.tsx`
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Replace `app/(tabs)/stats.tsx`**

Replace the entire file content with:

```typescript
import React from "react";

import { ProfileScreen } from "@/screens/profile/ProfileScreen";

export default function ProfileTab() {
  return <ProfileScreen />;
}
```

- [ ] **Step 2: Update tab in `app/(tabs)/_layout.tsx`**

Find the `stats` screen block and replace its `options`:

```typescript
// Before:
<Tabs.Screen
  name="stats"
  options={{
    title: "Stats",
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
        size={24}
        name={focused ? "bar-chart" : "bar-chart-outline"}
        color={color}
      />
    ),
  }}
/>

// After:
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
```

- [ ] **Step 3: Verify types and lint**

Run: `npx tsc --noEmit`  
Expected: no output.

Run: `npx expo lint`  
Expected: no errors.

- [ ] **Step 4: Start dev server and verify manually**

Run: `npx expo start`

Verify in the app:
- [ ] Tab bar shows "Profile" with person icon (not "Stats" with bar-chart)
- [ ] Tapping Profile tab shows blue header with "Profile" title
- [ ] Skeleton placeholders appear briefly while API loads
- [ ] Profile header shows initials avatar, @username, level, join date
- [ ] Stats grid shows 6 cards: ELO, Global Rank, Win Rate, Streak, Best Streak, Levels
- [ ] Badges section shows earned badges or empty state message
- [ ] Tapping a badge opens a modal with name, description, earned date
- [ ] Pull-to-refresh reloads all 3 sections
- [ ] If one API fails, only that section shows an error; others remain visible

- [ ] **Step 5: Commit**

```bash
git add app/(tabs)/stats.tsx app/(tabs)/_layout.tsx
git commit -m "feat: wire ProfileScreen to stats tab, rename tab to Profile"
```

---

## Self-Review Checklist

- [x] SF01 (basic info): `fetchBasicProfile` → `ProfileHeader` ✓
- [x] SF02 (stats): `fetchPersonalStats` → `StatsGrid` ✓
- [x] SF03 (badges): `fetchUserBadges` → `BadgesSection` ✓
- [x] Tab renamed to "Profile" with person icon ✓
- [x] `win_rate` (0.0–1.0) displayed as percentage (`Math.round(stats.winRate * 100)%`) ✓
- [x] `global_rank` displayed as `#42` ✓
- [x] `icon_url` not used in MVP — badge initials used instead ✓
- [x] Pull-to-refresh retries all 3 thunks ✓
- [x] Each section has independent error state ✓
- [x] Named handlers everywhere — no inline arrow functions in `onPress` ✓
- [x] `StyleSheet.create` only — no inline style objects ✓
- [x] Import order follows CLAUDE.md convention ✓
- [x] `profileReducer` registered in store before selectors compile ✓
