import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EditProfileModalProps {
  visible: boolean;
  initialUsername: string;
  initialFullName: string | null;
  isLoading: boolean;
  externalError: string | null;
  onSave: (username?: string, fullName?: string) => void;
  onClose: () => void;
}

export function EditProfileModal({
  visible,
  initialUsername,
  initialFullName,
  isLoading,
  externalError,
  onSave,
  onClose,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(initialUsername);
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setUsername(initialUsername);
      setFullName(initialFullName ?? "");
      setUsernameError(null);
      setFullNameError(null);
    }
  }, [visible, initialUsername, initialFullName]);

  const usernameChanged = username !== initialUsername;
  const fullNameChanged = fullName !== (initialFullName ?? "");
  const hasChanges = usernameChanged || fullNameChanged;

  const handleSave = () => {
    let valid = true;

    if (usernameChanged) {
      if (username.length < 3 || username.length > 30) {
        setUsernameError("Username must be 3–30 characters");
        valid = false;
      } else if (/\s/.test(username)) {
        setUsernameError("Username cannot contain whitespace");
        valid = false;
      } else {
        setUsernameError(null);
      }
    }

    if (fullNameChanged) {
      const trimmed = fullName.trim();
      if (trimmed.length > 100) {
        setFullNameError("Full name must be at most 100 characters");
        valid = false;
      } else {
        setFullNameError(null);
      }
    }

    if (!valid) return;

    onSave(
      usernameChanged ? username : undefined,
      fullNameChanged ? fullName.trim() || undefined : undefined,
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Edit Profile</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, usernameError ? styles.inputError : null]}
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setUsernameError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="username"
            placeholderTextColor="#B0BAC8"
          />
          {usernameError ? (
            <Text style={styles.fieldError}>{usernameError}</Text>
          ) : null}

          <Text style={[styles.label, styles.labelSpacing]}>Full Name</Text>
          <TextInput
            style={[styles.input, fullNameError ? styles.inputError : null]}
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              setFullNameError(null);
            }}
            placeholder="Full name"
            placeholderTextColor="#B0BAC8"
          />
          {fullNameError ? (
            <Text style={styles.fieldError}>{fullNameError}</Text>
          ) : null}

          {externalError ? (
            <Text style={styles.externalError}>{externalError}</Text>
          ) : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!hasChanges || isLoading) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    width: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2A44",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4E5D78",
    marginBottom: 6,
  },
  labelSpacing: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D4DCE8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1A2A44",
    backgroundColor: "#F7F9FC",
  },
  inputError: {
    borderColor: "#E74C4C",
  },
  fieldError: {
    fontSize: 12,
    color: "#E74C4C",
    marginTop: 4,
  },
  externalError: {
    fontSize: 13,
    color: "#E74C4C",
    marginTop: 16,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#EEF2F8",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4E5D78",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2E67C7",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#A0B4D0",
  },
  saveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
