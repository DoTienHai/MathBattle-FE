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
