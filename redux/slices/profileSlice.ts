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
