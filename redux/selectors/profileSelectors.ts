import type { RootState } from "@/redux/store";

export const selectBasicInfo = (state: RootState) => state.profile.basicInfo;
export const selectPersonalStats = (state: RootState) => state.profile.stats;
export const selectUserBadges = (state: RootState) => state.profile.badges;
export const selectProfileLoading = (state: RootState) =>
  state.profile.loading;
export const selectProfileError = (state: RootState) => state.profile.error;
