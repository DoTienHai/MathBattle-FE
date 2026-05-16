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
