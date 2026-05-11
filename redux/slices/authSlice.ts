import {
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
} from "@/redux/thunks/authThunks";
import type { AuthState, User } from "@/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  lastLoginTime: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ===== Synchronous Actions =====

    /**
     * Set auth loading state
     */
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    /**
     * Set auth error message
     */
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    /**
     * Clear auth error
     */
    clearError(state) {
      state.error = null;
    },

    /**
     * Set user data after successful login
     */
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },

    /**
     * Set authentication tokens
     */
    setTokens(
      state,
      action: PayloadAction<{ token: string; refreshToken?: string }>,
    ) {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },

    /**
     * Mark user as authenticated
     */
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },

    /**
     * Update last login time
     */
    setLastLoginTime(state, action: PayloadAction<number>) {
      state.lastLoginTime = action.payload;
    },

    /**
     * Set complete auth state from API response
     */
    setAuthData(
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken?: string;
      }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      state.lastLoginTime = Date.now();
      state.error = null;
    },

    /**
     * Logout user - clear all auth data
     */
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastLoginTime = null;
    },

    /**
     * Initialize auth from stored data (e.g., after app restart)
     */
    initializeAuth(
      state,
      action: PayloadAction<{
        user: User | null;
        token: string | null;
        refreshToken?: string | null;
      }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = !!(action.payload.token && action.payload.user);
    },
  },

  extraReducers: (builder) => {
    // ===== Login Thunk Handlers =====
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.lastLoginTime = Date.now();
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
      });

    // ===== Register Thunk Handlers =====
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.lastLoginTime = Date.now();
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
        state.isAuthenticated = false;
      });

    // ===== Logout Thunk Handlers =====
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastLoginTime = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.lastLoginTime = null;
      });

    // ===== Get Current User Thunk Handlers =====
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch user";
      });

    // ===== Refresh Token Thunk Handlers =====
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        // Don't set loading for token refresh (silent operation)
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.error = action.payload || "Token refresh failed";
        // If refresh fails, logout user
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // ===== Verify Email Thunk Handlers =====
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
        if (state.user) {
          state.user.is_verified = true;
        }
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Email verification failed";
      });

    // ===== Request Password Reset Thunk Handlers =====
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to request password reset";
      });

    // ===== Reset Password Thunk Handlers =====
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Password reset failed";
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setUser,
  setTokens,
  setAuthenticated,
  setLastLoginTime,
  setAuthData,
  logout,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;
