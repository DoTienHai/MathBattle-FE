/**
 * LoginScreen component
 * Main login screen with email/password authentication
 * Features: Form validation, password visibility toggle, social login, remember me
 * Redux integration: Uses Redux for auth state management
 * API: Calls backend /api/v1/auth/login endpoint
 */

import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import PrimaryButton from "@/components/buttons/PrimaryButton";
import SocialButton from "@/components/buttons/SocialButton";
import TextInput from "@/components/inputs/TextInput";
import Checkbox from "@/components/ui/Checkbox";
import {
    selectAuthError,
    selectIsAuthenticated,
    selectIsLoading,
} from "@/redux/selectors/authSelectors";
import { clearError } from "@/redux/slices/authSlice";
import { loginUser } from "@/redux/thunks/authThunks";
import type { LoginFormData, LoginFormErrors } from "@/types/auth";

interface LoginScreenProps {}

interface LocalState {
  formData: LoginFormData;
  errors: LoginFormErrors;
  showPassword: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const validateFormRef = useRef<(() => boolean) | null>(null);

  const [state, setState] = useState<LocalState>({
    formData: {
      email: "",
      password: "",
      rememberMe: false,
    },
    errors: {},
    showPassword: false,
  });

  /**
   * Validates email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validates the login form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!state.formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(state.formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!state.formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (state.formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [state.formData]);

  validateFormRef.current = validateForm;

  /**
   * Handles email input change
   */
  const handleEmailChange = useCallback(
    (email: string) => {
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, email },
        errors: { ...prev.errors, email: undefined },
      }));
      // Clear auth error when user starts typing
      if (authError) {
        dispatch(clearError());
      }
    },
    [authError, dispatch],
  );

  /**
   * Handles password input change
   */
  const handlePasswordChange = useCallback(
    (password: string) => {
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, password },
        errors: { ...prev.errors, password: undefined },
      }));
      // Clear auth error when user starts typing
      if (authError) {
        dispatch(clearError());
      }
    },
    [authError, dispatch],
  );

  /**
   * Toggles password visibility
   */
  const handleTogglePasswordVisibility = useCallback(() => {
    setState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  /**
   * Handles remember me toggle
   */
  const handleToggleRememberMe = useCallback((rememberMe: boolean) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, rememberMe },
    }));
  }, []);

  /**
   * Handles login submission
   */
  const handleLogin = useCallback(async () => {
    if (!validateFormRef.current?.()) {
      return;
    }

    try {
      // Dispatch login action
      const result = await dispatch(
        loginUser({
          email: state.formData.email.toLowerCase().trim(),
          password: state.formData.password,
        }) as any,
      );

      if (loginUser.fulfilled.match(result)) {
        // Login successful
        Alert.alert("Success", "Logged in successfully!");
        // Navigation to home should be handled by app state/navigation logic
        // if (navigation?.replace) {
        //   navigation.replace('Home');
        // }
      } else {
        // Login failed - error is already in Redux state
        const errorMessage = result.payload || "Login failed";
        Alert.alert("Login Error", errorMessage);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Login failed. Please try again.");
    }
  }, [state.formData, dispatch]);

  /**
   * Handles social login
   */
  const handleSocialLogin = useCallback((provider: "google" | "facebook") => {
    Alert.alert(
      "Social Login",
      `${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not yet implemented.`,
    );
    // TODO: Implement social login with appropriate SDK
  }, []);

  /**
   * Password visibility toggle icon component
   */
  const PasswordVisibilityIcon = () => (
    <Text style={styles.icon}>{state.showPassword ? "👁️" : "👁️‍🗨️"}</Text>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>📊</Text>
              <Text style={styles.logoText}>Logoipsum</Text>
            </View>

            <Text style={styles.heading}>Sign in to your Account</Text>

            <View style={styles.signUpPrompt}>
              <Text style={styles.signUpText}>
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/register")}
                activeOpacity={0.7}
              >
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* API Error Display */}
            {authError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>❌ {authError}</Text>
              </View>
            )}

            {/* Email Input */}
            <TextInput
              label="Email Address"
              placeholder="Loisbecket@gmail.com"
              value={state.formData.email}
              onChangeText={handleEmailChange}
              error={state.errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            {/* Password Input */}
            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={state.formData.password}
              onChangeText={handlePasswordChange}
              error={state.errors.password}
              isPassword={!state.showPassword}
              rightIcon={<PasswordVisibilityIcon />}
              onRightIconPress={handleTogglePasswordVisibility}
              editable={!isLoading}
            />

            {/* Remember Me & Forgot Password */}
            <View style={styles.rememberForgotContainer}>
              <Checkbox
                label="Remember me"
                checked={state.formData.rememberMe}
                onToggle={handleToggleRememberMe}
              />
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Coming Soon",
                    "Forgot password feature is coming soon!",
                  )
                }
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <PrimaryButton
              title="Log In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            />

            {/* Or Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or login with</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              <SocialButton
                provider="google"
                onPress={() => handleSocialLogin("google")}
                style={styles.socialButton}
              />
              <SocialButton
                provider="facebook"
                onPress={() => handleSocialLogin("facebook")}
                style={styles.socialButton}
              />
            </View>

            {/* Terms of Service */}
            <Text style={styles.termsText}>
              By logging in you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Header Section
  headerSection: {
    backgroundColor: "#0D0D1B",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  signUpPrompt: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  // Content Section
  contentSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    flex: 1,
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#DC2626",
  },
  rememberForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  forgotPasswordLink: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
  },
  loginButton: {
    marginBottom: 24,
  },
  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginHorizontal: 12,
  },
  // Social Buttons
  socialButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
  },
  // Terms
  termsText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: "600",
    color: "#2563EB",
  },
  // Password visibility icon
  icon: {
    fontSize: 18,
  },
});

export default LoginScreen;
