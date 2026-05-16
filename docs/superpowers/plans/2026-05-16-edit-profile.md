# Edit Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pencil icon to the Profile header that opens an edit modal for username and full_name, calling PATCH /api/v1/profile and updating Redux state on success.

**Architecture:** Pencil icon in `ProfileHeader` (new `onEditPress` prop) opens `EditProfileModal` (new component) managed in `ProfileScreen`. A new `updateProfile` thunk calls `PATCH /api/v1/profile`; on success the slice merges the returned username/fullName into `state.basicInfo` in-place. A new `clearUpdateError` reducer resets the error when the modal opens.

**Tech Stack:** React Native, Expo, Redux Toolkit (`createAsyncThunk`, `createSlice`), Axios (`apiClient.patch`), Ionicons (`create-outline`).

> **No test runner configured** — no jest/`__tests__` exists in this repo. Skip test steps.

---

## File Map

| File | Action |
|------|--------|
| `types/profile.ts` | Add `UpdateProfilePayload`, `UpdatedProfileFields`, `UpdateProfileData`, `UpdateProfileResponse`; expand `ProfileState.loading/error` with `update` key |
| `services/profileService.ts` | Add `updateProfile()` method |
| `redux/thunks/profileThunks.ts` | Add `updateProfile` thunk |
| `redux/slices/profileSlice.ts` | Expand `initialState`; add `clearUpdateError` reducer; add `extraReducers` for `updateProfile` |
| `components/profile/ProfileHeader.tsx` | Add `onEditPress?: () => void` prop; render pencil button |
| `components/profile/EditProfileModal.tsx` | Create — form modal with username + fullName inputs, client validation, loading/error states |
| `screens/profile/ProfileScreen.tsx` | Add `editModalVisible` state; wire `handleOpenEditModal`, `handleCloseEditModal`, `handleSaveProfile`; render `EditProfileModal` |

---

## Task 1: Expand Types

**Files:**
- Modify: `types/profile.ts`

- [ ] **Step 1: Add update-related types and expand ProfileState**

Replace `types/profile.ts` entirely with:

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

export interface UpdateProfilePayload {
  username?: string;
  fullName?: string;
}

export interface UpdatedProfileFields {
  username: string;
  fullName: string | null;
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

export interface UpdateProfileData {
  user_id: number;
  username: string;
  full_name: string | null;
}

export type BasicProfileResponse = ApiResponse<BasicProfileData>;
export type PersonalStatsResponse = ApiResponse<PersonalStatsData>;
export type UserBadgesResponse = ApiResponse<UserBadgesData>;
export type UpdateProfileResponse = ApiResponse<UpdateProfileData>;

// ─── Redux State ──────────────────────────────────────────────────────────────

export interface ProfileState {
  basicInfo: BasicProfileInfo | null;
  stats: PersonalStats | null;
  badges: UserBadges | null;
  loading: {
    basicInfo: boolean;
    stats: boolean;
    badges: boolean;
    update: boolean;
  };
  error: {
    basicInfo: string | null;
    stats: string | null;
    badges: string | null;
    update: string | null;
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles (no new errors)**

```bash
npx tsc --noEmit 2>&1 | grep -v "home/index.tsx"
```

Expected: no output (the `home/index.tsx` error is pre-existing and unrelated).

---

## Task 2: Add Service Method

**Files:**
- Modify: `services/profileService.ts`

- [ ] **Step 1: Add `updateProfile` method**

Replace `services/profileService.ts` entirely with:

```typescript
import { apiClient } from "@/services/api/client";
import type {
  BasicProfileResponse,
  PersonalStatsResponse,
  UpdateProfileResponse,
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

  async updateProfile(body: {
    username?: string;
    full_name?: string;
  }): Promise<UpdateProfileResponse> {
    const response = await apiClient.patch<UpdateProfileResponse>(
      "/api/v1/profile",
      body,
    );
    return response.data;
  },
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -v "home/index.tsx"
```

Expected: no output.

---

## Task 3: Add Redux Thunk + Slice Changes

**Files:**
- Modify: `redux/thunks/profileThunks.ts`
- Modify: `redux/slices/profileSlice.ts`

- [ ] **Step 1: Add `updateProfile` thunk**

Replace `redux/thunks/profileThunks.ts` entirely with:

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";

import { profileService } from "@/services/profileService";
import type {
  BasicProfileInfo,
  PersonalStats,
  UpdateProfilePayload,
  UpdatedProfileFields,
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

export const updateProfile = createAsyncThunk<
  UpdatedProfileFields,
  UpdateProfilePayload,
  { rejectValue: string }
>("profile/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    const body: { username?: string; full_name?: string } = {};
    if (payload.username !== undefined) body.username = payload.username;
    if (payload.fullName !== undefined) body.full_name = payload.fullName;

    const response = await profileService.updateProfile(body);
    if (!response.success || !response.data) {
      return rejectWithValue(
        response.error?.message ?? "Failed to update profile",
      );
    }
    const d = response.data;
    return { username: d.username, fullName: d.full_name };
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ??
      error?.message ??
      "Failed to update profile";
    return rejectWithValue(message);
  }
});
```

- [ ] **Step 2: Update slice — expand initialState, add `clearUpdateError`, add `updateProfile` extraReducers**

Replace `redux/slices/profileSlice.ts` entirely with:

```typescript
import { createSlice } from "@reduxjs/toolkit";

import {
  fetchBasicProfile,
  fetchPersonalStats,
  fetchUserBadges,
  updateProfile,
} from "@/redux/thunks/profileThunks";
import type { ProfileState } from "@/types/profile";

const initialState: ProfileState = {
  basicInfo: null,
  stats: null,
  badges: null,
  loading: { basicInfo: false, stats: false, badges: false, update: false },
  error: { basicInfo: null, stats: null, badges: null, update: null },
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    resetProfile: () => initialState,
    clearUpdateError: (state) => {
      state.error.update = null;
    },
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

    // ── updateProfile ─────────────────────────────────────────────────────────
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading.update = false;
        if (state.basicInfo) {
          state.basicInfo.username = action.payload.username;
          state.basicInfo.fullName = action.payload.fullName;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload ?? "Failed to update profile";
      });
  },
});

export const { resetProfile, clearUpdateError } = profileSlice.actions;
export default profileSlice.reducer;
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -v "home/index.tsx"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add types/profile.ts services/profileService.ts redux/thunks/profileThunks.ts redux/slices/profileSlice.ts
git commit -m "feat: add updateProfile types, service, thunk, and slice (G01_F02_SF04)"
```

---

## Task 4: Update ProfileHeader — Add Pencil Button

**Files:**
- Modify: `components/profile/ProfileHeader.tsx`

- [ ] **Step 1: Add `onEditPress` prop and pencil icon button**

Replace `components/profile/ProfileHeader.tsx` entirely with:

```typescript
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { BasicProfileInfo } from "@/types/profile";

interface ProfileHeaderProps {
  info: BasicProfileInfo | null;
  isLoading: boolean;
  onEditPress?: () => void;
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

export function ProfileHeader({
  info,
  isLoading,
  onEditPress,
}: ProfileHeaderProps) {
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
      {onEditPress ? (
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Ionicons
            name="create-outline"
            size={20}
            color="rgba(255,255,255,0.85)"
          />
        </TouchableOpacity>
      ) : null}
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
  editButton: {
    padding: 8,
    alignSelf: "flex-start",
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -v "home/index.tsx"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/profile/ProfileHeader.tsx
git commit -m "feat: add edit pencil button to ProfileHeader"
```

---

## Task 5: Create EditProfileModal

**Files:**
- Create: `components/profile/EditProfileModal.tsx`

- [ ] **Step 1: Create the modal component**

Create `components/profile/EditProfileModal.tsx`:

```typescript
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EditProfileModalProps {
  visible: boolean;
  initialUsername: string;
  initialFullName: string | null;
  isLoading: boolean;
  externalError: string | null;
  onSave: (username?: string, fullName?: string) => void;
  onClose: () => void;
}

export function EditProfileModal({
  visible,
  initialUsername,
  initialFullName,
  isLoading,
  externalError,
  onSave,
  onClose,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(initialUsername);
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setUsername(initialUsername);
      setFullName(initialFullName ?? "");
      setUsernameError(null);
      setFullNameError(null);
    }
  }, [visible, initialUsername, initialFullName]);

  const usernameChanged = username !== initialUsername;
  const fullNameChanged = fullName !== (initialFullName ?? "");
  const hasChanges = usernameChanged || fullNameChanged;

  const handleSave = () => {
    let valid = true;

    if (usernameChanged) {
      if (username.length < 3 || username.length > 30) {
        setUsernameError("Username must be 3–30 characters");
        valid = false;
      } else if (/\s/.test(username)) {
        setUsernameError("Username cannot contain whitespace");
        valid = false;
      } else {
        setUsernameError(null);
      }
    }

    if (fullNameChanged) {
      const trimmed = fullName.trim();
      if (trimmed.length > 100) {
        setFullNameError("Full name must be at most 100 characters");
        valid = false;
      } else {
        setFullNameError(null);
      }
    }

    if (!valid) return;

    onSave(
      usernameChanged ? username : undefined,
      fullNameChanged ? fullName.trim() || undefined : undefined,
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Edit Profile</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, usernameError ? styles.inputError : null]}
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setUsernameError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="username"
            placeholderTextColor="#B0BAC8"
          />
          {usernameError ? (
            <Text style={styles.fieldError}>{usernameError}</Text>
          ) : null}

          <Text style={[styles.label, styles.labelSpacing]}>Full Name</Text>
          <TextInput
            style={[styles.input, fullNameError ? styles.inputError : null]}
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              setFullNameError(null);
            }}
            placeholder="Full name"
            placeholderTextColor="#B0BAC8"
          />
          {fullNameError ? (
            <Text style={styles.fieldError}>{fullNameError}</Text>
          ) : null}

          {externalError ? (
            <Text style={styles.externalError}>{externalError}</Text>
          ) : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!hasChanges || isLoading) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    width: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2A44",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4E5D78",
    marginBottom: 6,
  },
  labelSpacing: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D4DCE8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1A2A44",
    backgroundColor: "#F7F9FC",
  },
  inputError: {
    borderColor: "#E74C4C",
  },
  fieldError: {
    fontSize: 12,
    color: "#E74C4C",
    marginTop: 4,
  },
  externalError: {
    fontSize: 13,
    color: "#E74C4C",
    marginTop: 16,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#EEF2F8",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4E5D78",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2E67C7",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#A0B4D0",
  },
  saveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -v "home/index.tsx"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/profile/EditProfileModal.tsx
git commit -m "feat: create EditProfileModal component"
```

---

## Task 6: Wire ProfileScreen

**Files:**
- Modify: `screens/profile/ProfileScreen.tsx`

- [ ] **Step 1: Update ProfileScreen to manage modal state and dispatch updateProfile**

Replace `screens/profile/ProfileScreen.tsx` entirely with:

```typescript
import React, { useCallback, useEffect, useState } from "react";
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
import { clearUpdateError } from "@/redux/slices/profileSlice";
import type { AppDispatch } from "@/redux/store";
import {
  fetchBasicProfile,
  fetchPersonalStats,
  fetchUserBadges,
  updateProfile,
} from "@/redux/thunks/profileThunks";
import { BadgesSection } from "@/components/profile/BadgesSection";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsGrid } from "@/components/profile/StatsGrid";

export function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const basicInfo = useSelector(selectBasicInfo);
  const stats = useSelector(selectPersonalStats);
  const badges = useSelector(selectUserBadges);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);

  const [editModalVisible, setEditModalVisible] = useState(false);

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

  const handleOpenEditModal = useCallback(() => {
    dispatch(clearUpdateError());
    setEditModalVisible(true);
  }, [dispatch]);

  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
  }, []);

  const handleSaveProfile = useCallback(
    async (username?: string, fullName?: string) => {
      const result = await dispatch(updateProfile({ username, fullName }));
      if (updateProfile.fulfilled.match(result)) {
        setEditModalVisible(false);
      }
    },
    [dispatch],
  );

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
          <ProfileHeader
            info={basicInfo}
            isLoading={loading.basicInfo}
            onEditPress={handleOpenEditModal}
          />
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

      {basicInfo ? (
        <EditProfileModal
          visible={editModalVisible}
          initialUsername={basicInfo.username}
          initialFullName={basicInfo.fullName}
          isLoading={loading.update}
          externalError={error.update}
          onSave={handleSaveProfile}
          onClose={handleCloseEditModal}
        />
      ) : null}
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -v "home/index.tsx"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add screens/profile/ProfileScreen.tsx
git commit -m "feat: wire EditProfileModal into ProfileScreen (G01_F02_SF04)"
```

---

## Done

All tasks complete. The edit profile flow is fully wired:
- Pencil button in ProfileHeader → opens EditProfileModal
- Form pre-filled with current username / fullName
- Client validation (length, whitespace) before submitting
- Save disabled when no changes made
- PATCH /api/v1/profile on submit → Redux state updated in-place → modal closes
- API errors (e.g. USERNAME_TAKEN) shown as `externalError` inside the modal
