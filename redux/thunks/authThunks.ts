/**
 * Auth Redux Thunks
 * Async actions for authentication API calls (login, register, logout)
 */

import { authService } from "@/services/authService";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Login thunk - POST /api/v1/auth/login
 * Handles user login with email and password
 */
export const loginUser = createAsyncThunk<
  { user: User; token: string; refreshToken?: string },
  LoginRequest,
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Login failed");
    }

    const { access_token, refresh_token, user, user_id, email } = response.data;

    // Map API response to user object
    const userData: User = user || {
      user_id: user_id || 0,
      email: email || "",
      full_name: response.data.full_name,
      is_verified: true,
    };

    const token = access_token || response.data.token || "";

    if (!token) {
      throw new Error("No access token received");
    }

    return {
      user: userData,
      token,
      refreshToken: refresh_token || response.data.refreshToken,
    };
  } catch (error: any) {
    const errorMessage = error.message || "Login failed. Please try again.";
    console.error("[Auth Thunk] Login error:", errorMessage);
    return rejectWithValue(errorMessage);
  }
});

/**
 * Register thunk - POST /api/v1/auth/register
 * Handles new user registration
 */
export const registerUser = createAsyncThunk<
  { user: User; token: string; refreshToken?: string },
  RegisterRequest,
  { rejectValue: string }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Registration failed");
    }

    const { access_token, refresh_token, user, user_id, email } = response.data;

    const registeredUser: User = user || {
      user_id: user_id || 0,
      email: email || "",
      full_name: response.data.full_name,
      is_verified: false, // Email not verified yet after registration
    };

    const token = access_token || response.data.token || "";

    // If backend doesn't return token immediately after registration,
    // return success without token (user will need to login)
    console.log("[Register Thunk] Token received:", token ? "✅ Yes" : "❌ No");

    return {
      user: registeredUser,
      token: token || "", // Allow empty token - user needs to login
      refreshToken: refresh_token || response.data.refreshToken,
    };
  } catch (error: any) {
    const errorMessage =
      error.message || "Registration failed. Please try again.";
    console.error("[Auth Thunk] Register error:", errorMessage);
    return rejectWithValue(errorMessage);
  }
});

/**
 * Logout thunk - POST /api/v1/auth/logout
 * Handles user logout and token cleanup
 */
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    let logoutError: string | null = null;

    try {
      console.log("[Auth Thunk] Starting logout...");
      await authService.logout();
      console.log("[Auth Thunk] Logout API call success");
    } catch (error: any) {
      logoutError = error.message || "Logout API failed";
      console.error("[Auth Thunk] Logout error:", logoutError);
    } finally {
      // Always clear local auth data, even when API fails
      await AsyncStorage.removeItem("authToken").catch(console.error);
      await AsyncStorage.removeItem("refreshToken").catch(console.error);
      await AsyncStorage.removeItem("user").catch(console.error);
      console.log("[Auth Thunk] Local auth storage cleared");
    }

    if (logoutError) {
      return rejectWithValue(logoutError);
    }
  },
);

/**
 * Get current user thunk - GET /api/v1/auth/me
 * Fetch current authenticated user profile
 */
export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getCurrentUser();

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Failed to fetch user");
    }

    const { user, user_id, email } = response.data;

    return (
      user || {
        user_id: user_id || 0,
        email: email || "",
        full_name: response.data.full_name,
      }
    );
  } catch (error: any) {
    const errorMessage = error.message || "Failed to fetch user profile";
    console.error("[Auth Thunk] Get user error:", errorMessage);
    return rejectWithValue(errorMessage);
  }
});

/**
 * Refresh token thunk - POST /api/v1/auth/refresh
 * Get new access token using refresh token
 */
export const refreshAccessToken = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("auth/refreshAccessToken", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.refreshToken();

    if (!response.success || !response.data?.access_token) {
      throw new Error(response.error?.message || "Token refresh failed");
    }

    return response.data.access_token;
  } catch (error: any) {
    const errorMessage = error.message || "Failed to refresh token";
    console.error("[Auth Thunk] Refresh token error:", errorMessage);
    return rejectWithValue(errorMessage);
  }
});

/**
 * Verify email thunk - POST /api/v1/auth/verify-email
 * Verify user email with token from email link
 */
export const verifyEmail = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("auth/verifyEmail", async (token, { rejectWithValue }) => {
  try {
    const response = await authService.verifyEmail(token);

    if (!response.success) {
      throw new Error(response.error?.message || "Email verification failed");
    }
  } catch (error: any) {
    const errorMessage = error.message || "Email verification failed";
    console.error("[Auth Thunk] Verify email error:", errorMessage);
    return rejectWithValue(errorMessage);
  }
});

/**
 * Forgot password thunk - POST /api/v1/auth/forgot-password
 * Request password reset email
 */
export const requestPasswordReset = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>("auth/requestPasswordReset", async (email, { rejectWithValue }) => {
  try {
    const response = await authService.forgotPassword(email);

    if (!response.success) {
      throw new Error(response.message || "Failed to request password reset");
    }

    return { message: response.message };
  } catch (error: any) {
    const errorMessage = error.message || "Failed to request password reset";
    console.error("[Auth Thunk] Password reset request error:", errorMessage);
    return rejectWithValue(errorMessage);
  }
});

/**
 * Reset password thunk - POST /api/v1/auth/reset-password
 * Reset password with token from email
 */
export const resetPassword = createAsyncThunk<
  { user: User; token: string },
  { token: string; newPassword: string },
  { rejectValue: string }
>("auth/resetPassword", async ({ token, newPassword }, { rejectWithValue }) => {
  try {
    const response = await authService.resetPassword(token, newPassword);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Password reset failed");
    }

    const { access_token, user, user_id, email } = response.data;

    const userData: User = user || {
      user_id: user_id || 0,
      email: email || "",
      full_name: response.data.full_name,
    };

    return {
      user: userData,
      token: access_token || response.data.token || "",
    };
  } catch (error: any) {
    const errorMessage = error.message || "Password reset failed";
    console.error("[Auth Thunk] Reset password error:", errorMessage);
    return rejectWithValue(errorMessage);
  }
});
