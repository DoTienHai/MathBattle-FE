/**
 * Authentication Service
 * Handles all auth-related API calls (login, register, logout, etc.)
 */

import { apiClient } from "@/services/api/client";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
} from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Helper function to save token to AsyncStorage
 */
const saveTokenToStorage = async (
  access_token: string,
  refresh_token?: string,
  user?: any,
): Promise<void> => {
  try {
    await AsyncStorage.setItem("authToken", access_token);
    if (refresh_token) {
      await AsyncStorage.setItem("refreshToken", refresh_token);
    }
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }
  } catch (error) {
    console.error("Error saving token to storage:", error);
    throw error;
  }
};

/**
 * Login user with email and password
 */
export const authService = {
  /**
   * POST /api/v1/auth/login
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/api/v1/auth/login",
        credentials,
      );

      if (response.data.success && response.data.data?.access_token) {
        // Store token and user data
        const { access_token, refresh_token, user } = response.data.data;
        await saveTokenToStorage(access_token, refresh_token, user);
      }

      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data;
      throw new Error(
        apiError?.error?.message ||
          error.message ||
          "Login failed. Please try again.",
      );
    }
  },

  /**
   * POST /api/v1/auth/register
   * Register new user with email, password, and optional full_name
   */
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      console.log(
        "[Register] Starting registration with email:",
        userData.email,
      );
      console.log(
        "[Register] API Base URL:",
        process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000",
      );

      const response = await apiClient.post<LoginResponse>(
        "/api/v1/auth/register",
        userData,
      );

      console.log("[Register] ✅ Success:", response.data);

      if (response.data.success && response.data.data?.access_token) {
        // Optionally save token after registration
        const { access_token, refresh_token, user } = response.data.data;
        await saveTokenToStorage(access_token, refresh_token, user);
      }

      return response.data;
    } catch (error: any) {
      console.error("[Register] ❌ Network Error Details:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestURL: error.config?.url,
        requestBaseURL: error.config?.baseURL,
      });

      const apiError = error.response?.data;
      throw new Error(
        apiError?.error?.message ||
          error.message ||
          "Registration failed. Please try again.",
      );
    }
  },

  /**
   * POST /api/v1/auth/logout
   * Logout current user and clear token
   */
  async logout(): Promise<void> {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    const payload = refreshToken ? { refresh_token: refreshToken } : {};

    console.log("[Logout] Sending request to /api/v1/auth/logout", payload);
    await apiClient.post("/api/v1/auth/logout", payload);
  },

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  async getCurrentUser(): Promise<LoginResponse> {
    try {
      const response = await apiClient.get<LoginResponse>("/api/v1/auth/me");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error?.message || "Failed to fetch user profile",
      );
    }
  },

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/api/v1/auth/refresh",
      );

      if (response.data.success && response.data.data?.access_token) {
        const { access_token, refresh_token } = response.data.data;
        await saveTokenToStorage(access_token, refresh_token);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error?.message ||
          "Token refresh failed. Please login again.",
      );
    }
  },

  /**
   * POST /api/v1/auth/verify-email
   * Verify email with token sent to user's email
   */
  async verifyEmail(token: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/api/v1/auth/verify-email",
        { token },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error?.message || "Email verification failed",
      );
    }
  },

  /**
   * POST /api/v1/auth/forgot-password
   * Request password reset email
   */
  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>("/api/v1/auth/forgot-password", { email });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error?.message ||
          "Failed to request password reset",
      );
    }
  },

  /**
   * POST /api/v1/auth/reset-password
   * Reset password with reset token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/api/v1/auth/reset-password",
        { token, new_password: newPassword },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error?.message || "Password reset failed",
      );
    }
  },
};

export default authService;
