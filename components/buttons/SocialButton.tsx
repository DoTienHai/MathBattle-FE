/**
 * SocialButton component
 * Button for social login providers (Google, Facebook, etc.)
 */

import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from "react-native";

interface SocialButtonProps extends Omit<TouchableOpacityProps, "style"> {
  provider: "google" | "facebook";
  onPress: () => void;
  style?: ViewStyle;
}

// Simplified icons (you can replace with actual icon components)
const GoogleIcon = () => <Text style={styles.icon}>🔵</Text>;

const FacebookIcon = () => <Text style={styles.icon}>f</Text>;

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  style,
  ...props
}) => {
  const icon = provider === "google" ? <GoogleIcon /> : <FacebookIcon />;
  const label = provider === "google" ? "Google" : "Facebook";

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
});

export default SocialButton;
