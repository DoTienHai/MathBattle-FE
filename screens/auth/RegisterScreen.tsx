/**
 * RegisterScreen component
 * User registration with email, password, and profile information
 * Features: Form validation, password strength, date picker, phone input
 * Redux integration: Uses Redux for auth state management
 * API: Calls backend /api/v1/auth/register endpoint
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
import TextInput from "@/components/inputs/TextInput";
import {
    selectAuthError,
    selectIsLoading,
} from "@/redux/selectors/authSelectors";
import { clearError } from "@/redux/slices/authSlice";
import { registerUser } from "@/redux/thunks/authThunks";
import type { RegisterFormData, RegisterFormErrors } from "@/types/auth";

interface RegisterScreenProps {}

interface LocalState {
  formData: RegisterFormData;
  errors: RegisterFormErrors;
  showPassword: boolean;
}

const RegisterScreen: React.FC<RegisterScreenProps> = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const authError = useSelector(selectAuthError);
  const validateFormRef = useRef<(() => boolean) | null>(null);

  const [state, setState] = useState<LocalState>({
    formData: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
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
   * Validates password strength
   * Requirements: min 8 chars, uppercase, lowercase, digit, special char
   */
  const validatePasswordStrength = (password: string): boolean => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false; // uppercase
    if (!/[a-z]/.test(password)) return false; // lowercase
    if (!/\d/.test(password)) return false; // digit
    if (!/[!@#$%^&*]/.test(password)) return false; // special char
    return true;
  };

  /**
   * Validates the register form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: RegisterFormErrors = {};

    // Validate first name
    if (!state.formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Validate last name
    if (!state.formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Validate email
    if (!state.formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(state.formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Validate password
    if (!state.formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!validatePasswordStrength(state.formData.password)) {
      newErrors.password =
        "Password must be 8+ chars with uppercase, lowercase, number, and special char (!@#$%^&*)";
    }

    // Validate confirm password
    if (!state.formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (state.formData.password !== state.formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [state.formData]);

  validateFormRef.current = validateForm;

  /**
   * Handles input change
   */
  const handleInputChange = useCallback(
    (field: keyof RegisterFormData, value: string) => {
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, [field]: value },
        errors: { ...prev.errors, [field]: undefined },
      }));
      if (authError) {
        dispatch(clearError());
      }
    },
    [authError, dispatch],
  );

  /**
   * Handles register submission
   */
  const handleRegister = useCallback(async () => {
    if (!validateFormRef.current?.()) {
      return;
    }

    try {
      // Combine first and last name
      const fullName =
        `${state.formData.firstName} ${state.formData.lastName}`.trim();

      // Dispatch register action
      const result = await dispatch(
        registerUser({
          email: state.formData.email.toLowerCase().trim(),
          password: state.formData.password,
          confirm_password: state.formData.confirmPassword,
          full_name: fullName,
        }) as any,
      );

      if (registerUser.fulfilled.match(result)) {
        // Register successful
        Alert.alert(
          "Success",
          "Account created! Please check your email to verify your account.",
        );
        // Navigate back to login
        router.push("/auth/login");
      } else {
        // Register failed - error is already in Redux state
        const errorMessage = result.payload || "Registration failed";
        Alert.alert("Registration Error", errorMessage);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Registration failed. Please try again.",
      );
    }
  }, [state.formData, dispatch]);

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
            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>Register</Text>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/login")}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>Log In</Text>
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

            {/* First and Last Name Row */}
            <View style={styles.row}>
              <View style={styles.halfColumn}>
                <TextInput
                  label="First Name"
                  placeholder="First name"
                  value={state.formData.firstName}
                  onChangeText={(value) =>
                    handleInputChange("firstName", value)
                  }
                  error={state.errors.firstName}
                  editable={!isLoading}
                />
              </View>
              <View style={styles.halfColumn}>
                <TextInput
                  label="Last Name"
                  placeholder="Last name"
                  value={state.formData.lastName}
                  onChangeText={(value) => handleInputChange("lastName", value)}
                  error={state.errors.lastName}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email Input */}
            <TextInput
              label="Email"
              placeholder="your.email@example.com"
              value={state.formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              error={state.errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            {/* Password Input */}
            <TextInput
              label="Set Password"
              placeholder="Create a strong password"
              value={state.formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              error={state.errors.password}
              isPassword={!state.showPassword}
              rightIcon={<PasswordVisibilityIcon />}
              onRightIconPress={() =>
                setState((prev) => ({
                  ...prev,
                  showPassword: !prev.showPassword,
                }))
              }
              editable={!isLoading}
            />

            {/* Confirm Password Input */}
            <TextInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={state.formData.confirmPassword}
              onChangeText={(value) =>
                handleInputChange("confirmPassword", value)
              }
              error={state.errors.confirmPassword}
              isPassword={!state.showPassword}
              rightIcon={<PasswordVisibilityIcon />}
              onRightIconPress={() =>
                setState((prev) => ({
                  ...prev,
                  showPassword: !prev.showPassword,
                }))
              }
              editable={!isLoading}
            />

            {/* Password Requirements Info */}
            <View style={styles.passwordInfoBox}>
              <Text style={styles.passwordInfoTitle}>
                Password Requirements:
              </Text>
              <Text style={styles.passwordInfoItem}>
                • Minimum 8 characters
              </Text>
              <Text style={styles.passwordInfoItem}>
                • At least one uppercase letter
              </Text>
              <Text style={styles.passwordInfoItem}>
                • At least one lowercase letter
              </Text>
              <Text style={styles.passwordInfoItem}>• At least one number</Text>
              <Text style={styles.passwordInfoItem}>
                • At least one special character (!@#$%^&*)
              </Text>
            </View>

            {/* Register Button */}
            <PrimaryButton
              title="Register"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
            />
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  loginLink: {
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  // Row layout
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfColumn: {
    flex: 1,
  },

  // Password info box
  passwordInfoBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  passwordInfoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  passwordInfoItem: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 4,
    lineHeight: 16,
  },
  // Register button
  registerButton: {
    marginBottom: 24,
  },
  // Icon
  icon: {
    fontSize: 18,
  },
});

export default RegisterScreen;
