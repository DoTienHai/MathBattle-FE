import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import {
    selectIsLoading,
    selectUserEmail,
    selectUserFullName,
} from "@/redux/selectors/authSelectors";
import type { AppDispatch } from "@/redux/store";
import { getCurrentUser, logoutUser } from "@/redux/thunks/authThunks";

interface SettingsItemProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  value: string;
  actionLabel: string;
  danger?: boolean;
  onActionPress?: () => void;
  actionDisabled?: boolean;
}

function SettingsItem({
  icon,
  title,
  value,
  actionLabel,
  danger = false,
  onActionPress,
  actionDisabled = false,
}: SettingsItemProps) {
  const handleActionPress = () => {
    console.log("[SettingsItem] Action pressed:", actionLabel);
    if (!actionDisabled) {
      onActionPress?.();
    }
  };

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <View style={styles.iconBadge}>
          <Ionicons name={icon} size={22} color="#1F7FE4" />
        </View>
        <View style={styles.itemTextBlock}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemValue}>{value}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handleActionPress}
        disabled={actionDisabled}
        hitSlop={8}
        testID={`settings-action-${actionLabel.toLowerCase().replace(/\s+/g, "-")}`}
        style={({ pressed }) => [
          styles.actionButton,
          pressed && !actionDisabled && styles.actionButtonPressed,
        ]}
      >
        <Text
          style={[
            styles.actionText,
            danger && styles.dangerText,
            actionDisabled && styles.actionTextDisabled,
          ]}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const userFullName = useSelector(selectUserFullName);
  const userEmail = useSelector(selectUserEmail);
  const isLoading = useSelector(selectIsLoading);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  const executeLogout = async () => {
    console.log("[Settings] executeLogout started");
    setIsLoggingOut(true);
    try {
      const resultAction = await dispatch(logoutUser());

      if (logoutUser.rejected.match(resultAction)) {
        const message =
          (resultAction.payload as string) ||
          resultAction.error?.message ||
          "Logout failed";

        console.error("[Settings] Logout rejected:", message);
        Alert.alert("Logout Error", message);
      } else {
        console.log("[Settings] Logout fulfilled");
      }
    } finally {
      setIsLoggingOut(false);
      console.log("[Settings] executeLogout finished");
    }
  };

  const handleLogout = () => {
    if (isLoggingOut) {
      console.log("[Settings] Logout blocked because isLoggingOut=true");
      Alert.alert("Please wait", "Logout is in progress...");
      return;
    }

    console.log("[Settings] Opening logout confirmation modal");
    setShowLogoutConfirm(true);
  };

  useEffect(() => {
    if (!userFullName || !userEmail) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, userEmail, userFullName]);

  const displayFullName = userFullName?.trim() || "Not available";
  const displayEmail = userEmail?.trim() || "Not available";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.bubbleTopRight} />
          <View style={styles.bubbleTopLeft} />
          <Text style={styles.screenTitle}>Settings</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <SettingsItem
              icon="person-circle"
              title="Full name"
              value={
                isLoading && !userFullName ? "Loading..." : displayFullName
              }
              actionLabel="Edit"
            />

            <View style={styles.separator} />

            <SettingsItem
              icon="mail"
              title="User email"
              value={isLoading && !userEmail ? "Loading..." : displayEmail}
              actionLabel={isLoggingOut ? "Logging out..." : "Log Out"}
              onActionPress={handleLogout}
              actionDisabled={isLoggingOut}
              danger
            />

            <View style={styles.separator} />

            <SettingsItem
              icon="trash"
              title="Delete"
              value="Account"
              actionLabel="Delete"
              danger
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={showLogoutConfirm}
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  console.log("[Settings] Logout cancelled from modal");
                  setShowLogoutConfirm(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalLogoutButton}
                onPress={() => {
                  console.log("[Settings] Modal Log Out button pressed");
                  setShowLogoutConfirm(false);
                  void executeLogout();
                }}
              >
                <Text style={styles.modalLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9EDF5",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: "#2E67C7",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    overflow: "hidden",
  },
  bubbleTopRight: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(167, 183, 255, 0.35)",
    right: -24,
    top: -46,
  },
  bubbleTopLeft: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(167, 183, 255, 0.28)",
    left: 20,
    top: 12,
  },
  screenTitle: {
    fontSize: 52,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 58,
  },
  content: {
    marginTop: -14,
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: "#0E264A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemRow: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E7F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemTextBlock: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#355182",
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#5A6D8A",
  },
  actionButton: {
    minWidth: 96,
    minHeight: 40,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: 8,
  },
  actionButtonPressed: {
    opacity: 0.65,
  },
  actionText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1F7FE4",
  },
  actionTextDisabled: {
    color: "#A7AFC0",
  },
  dangerText: {
    color: "#E74C4C",
  },
  separator: {
    height: 1,
    backgroundColor: "#E8EDF4",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A2A44",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: "#4E5D78",
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#EEF2F8",
  },
  modalCancelText: {
    color: "#355182",
    fontWeight: "600",
    fontSize: 14,
  },
  modalLogoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FFE9E9",
  },
  modalLogoutText: {
    color: "#D64545",
    fontWeight: "700",
    fontSize: 14,
  },
});
