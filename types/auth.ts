/**
 * Authentication Domain Types
 * Defines all auth-related types and interfaces matching API response structure
 */

/**
 * User profile type
 */
export interface User {
  user_id: number;
  email: string;
  full_name?: string;
  username?: string;
  is_verified?: boolean;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request body
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name?: string;
}

/**
 * API response data for login/register
 */
export interface LoginResponseData {
  user_id?: number;
  email?: string;
  full_name?: string;
  access_token?: string;
  refresh_token?: string;
  token?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
}

/**
 * Standard API error response
 */
export interface ApiError {
  code: string;
  message: string;
}

/**
 * Standard API response format (matches backend structure)
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

/**
 * Login response type (extends standard API response)
 */
export type LoginResponse = ApiResponse<LoginResponseData>;

/**
 * Register response type
 */
export type RegisterResponse = ApiResponse<LoginResponseData>;

/**
 * Local form data types
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Redux Auth State
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  lastLoginTime: number | null;
}

/**
 * Social login providers
 */
export type SocialLoginProvider = "google" | "facebook" | "apple";
