---
name: FE – Component Development Agent
description: "Build reusable UI components, component composition, styling, and component testing"
applyTo: "app/components/**"
---

# FE – Component Development Agent

**Purpose**: Accelerate reusable component creation with consistent styling, proper TypeScript typing, and comprehensive testing.

**Use when**:
- Creating reusable UI components (buttons, cards, inputs)
- Building component composition hierarchies
- Styling components with React Native StyleSheet
- Managing component state and callbacks
- Creating themed components
- Building accessible components

---

## Capabilities

### 1. Component Creation
- ✅ Functional components with hooks
- ✅ Full TypeScript typing for props
- ✅ Defaultprops and optional props
- ✅ Component composition
- ✅ Props forwarding and spreading

### 2. Styling
- ✅ React Native StyleSheet optimization
- ✅ Theme-based styling with colors
- ✅ Responsive sizing with Dimensions
- ✅ Dynamic styles based on props
- ✅ Style composition and inheritance

### 3. Component Patterns
- ✅ Container/Presenter pattern
- ✅ Controlled components
- ✅ Compound components
- ✅ Render prop pattern
- ✅ Higher-order components

### 4. State Management
- ✅ Local state with useState
- ✅ Form state handling
- ✅ Animation state
- ✅ Modal state
- ✅ Tab state

### 5. Accessibility
- ✅ testID for testing
- ✅ accessible prop
- ✅ accessibilityLabel
- ✅ accessibilityRole
- ✅ accessibilityState

---

## Component Structure

### Basic Component Template

```tsx
// app/components/buttons/PrimaryButton.tsx

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SIZES } from '@app/constants';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID = 'primary-button',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    color: COLORS.white,
    fontSize: SIZES.typography.button,
    fontWeight: '600',
  },
});
```

### Component Export

```tsx
// app/components/buttons/index.ts
export { PrimaryButton } from './PrimaryButton';
export { SecondaryButton } from './SecondaryButton';
export { IconButton } from './IconButton';

// Usage in other components
import { PrimaryButton, SecondaryButton } from '@app/components/buttons';
```

---

## Common Component Patterns

### 1. Card Component

```tsx
interface CardProps {
  onPress?: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  onPress,
  style,
  children,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
```

### 2. Input Component

```tsx
interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  editable?: boolean;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
}

export const CustomTextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  editable = true,
  maxLength,
  keyboardType = 'default',
}) => {
  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        maxLength={maxLength}
        keyboardType={keyboardType}
        placeholderTextColor={COLORS.placeholder}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    fontSize: SIZES.typography.body,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  label: {
    fontSize: SIZES.typography.label,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.typography.caption,
    marginTop: SIZES.spacing.xs,
  },
});
```

### 3. List Item Component

```tsx
interface GameCardProps {
  game: Game;
  onPress: () => void;
  testID?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onPress,
  testID = 'game-card',
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{game.title}</Text>
        <Badge difficulty={game.difficulty} />
      </View>
      <Text style={styles.description}>{game.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.players}>
          {game.maxPlayers} players
        </Text>
        <ArrowIcon />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  title: {
    fontSize: SIZES.typography.subtitle,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  description: {
    fontSize: SIZES.typography.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  players: {
    fontSize: SIZES.typography.caption,
    color: COLORS.textSecondary,
  },
});
```

### 4. Modal Component

```tsx
interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <PrimaryButton
              title={cancelText}
              onPress={onCancel}
              disabled={loading}
              style={styles.cancelButton}
            />
            <PrimaryButton
              title={confirmText}
              onPress={onConfirm}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    width: '85%',
    maxWidth: 300,
  },
  title: {
    fontSize: SIZES.typography.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  message: {
    fontSize: SIZES.typography.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.lg,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
});
```

---

## Styling Best Practices

### Theme Constants

```typescript
// app/constants/colors.ts
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5AC8FA',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  placeholder: '#C7C7CC',
};

// app/constants/sizes.ts
export const SIZES = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: 32,
    h2: 24,
    h3: 20,
    subtitle: 18,
    body: 16,
    caption: 12,
    button: 16,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};
```

---

## Component Testing

```tsx
// PrimaryButton.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from './PrimaryButton';

describe('PrimaryButton', () => {
  it('renders button with title', () => {
    render(
      <PrimaryButton
        title="Press me"
        onPress={jest.fn()}
      />
    );
    
    expect(screen.getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(
      <PrimaryButton
        title="Press me"
        onPress={onPress}
      />
    );
    
    fireEvent.press(screen.getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    render(
      <PrimaryButton
        title="Press me"
        onPress={onPress}
        disabled
      />
    );
    
    fireEvent.press(screen.getByText('Press me'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    render(
      <PrimaryButton
        title="Press me"
        onPress={jest.fn()}
        loading
      />
    );
    
    expect(screen.getByTestId('primary-button')).toBeTruthy();
  });
});
```

---

## File Organization

```
app/components/
├── buttons/
│   ├── PrimaryButton.tsx
│   ├── SecondaryButton.tsx
│   ├── PrimaryButton.test.tsx
│   └── index.ts
├── cards/
│   ├── GameCard.tsx
│   ├── UserCard.tsx
│   └── index.ts
├── inputs/
│   ├── CustomTextInput.tsx
│   ├── PasswordInput.tsx
│   └── index.ts
├── modals/
│   ├── ConfirmModal.tsx
│   ├── RewardModal.tsx
│   └── index.ts
├── common/
│   ├── Header.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── index.ts
└── index.ts
```

---

## Example Prompts

1. **Create GameCard component:**
```
Create GameCard component that:
- Accepts game object with title, difficulty, description
- Shows difficulty as colored badge (easy=green, medium=yellow, hard=red)
- Has onPress callback for navigation
- Shows shadow and proper spacing
- Includes proper TypeScript types
- Includes testID for testing
```

2. **Create custom TextInput with validation:**
```
Create CustomTextInput component that:
- Shows label above input
- Displays error message below input
- Has error styling (red border)
- Accepts maxLength prop
- Shows character count
- Includes accessibility props
```

3. **Create RewardModal:**
```
Create RewardModal component that:
- Shows reward icon/animation
- Displays reward amount and type
- Has "Claim" button
- Has "Share" button
- Shows confetti animation on claim
- Includes loading state
```

---

## Accessibility Checklist

- ✅ testID prop for all interactive elements
- ✅ accessible={true} for custom components
- ✅ accessibilityLabel for elements without text
- ✅ accessibilityRole for semantic meaning
- ✅ accessibilityState for state indication
- ✅ accessibilityHint for additional context

---

**See also**: `ui-screen-development.agent.md` for building screens with components
