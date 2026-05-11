/**
 * Reusable TextInput component
 * Supports email, password, and text input variants with validation
 */

import React, { useState } from "react";
import {
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

interface CustomTextInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  isPassword?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  isPassword = false,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        <RNTextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
  },
  inputWrapperError: {
    borderColor: "#EF4444",
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    paddingVertical: 12,
  },
  rightIcon: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#EF4444",
    marginTop: 6,
  },
});

export default TextInput;
