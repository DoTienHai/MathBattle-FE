/**
 * Checkbox component
 * Custom checkbox with label for forms
 */

import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
} from "react-native";

interface CheckboxProps extends Omit<TouchableOpacityProps, "onPress"> {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onToggle,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onToggle(!checked)}
      activeOpacity={0.7}
      {...props}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
});

export default Checkbox;
