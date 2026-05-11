/**
 * Auth Redux Selectors
 * Memoized selectors for accessing auth state
 */

import type { RootState } from "@/redux/store";

export const selectAuthState = (state: RootState) => state.auth;

export const selectUser = (state: RootState) => state.auth.user;

export const selectToken = (state: RootState) => state.auth.token;

export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;

export const selectIsLoading = (state: RootState) => state.auth.isLoading;

export const selectAuthError = (state: RootState) => state.auth.error;

export const selectLastLoginTime = (state: RootState) =>
  state.auth.lastLoginTime;

export const selectUserEmail = (state: RootState) => state.auth.user?.email;

export const selectUserId = (state: RootState) => state.auth.user?.user_id;

export const selectUserFullName = (state: RootState) =>
  state.auth.user?.full_name;

export const selectIsEmailVerified = (state: RootState) =>
  state.auth.user?.is_verified || false;
