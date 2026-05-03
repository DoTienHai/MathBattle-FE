---
name: FE – Navigation & Routing Agent
description: "Implement React Navigation stacks, tabs, deep linking, navigation params, and routing architecture"
applyTo: "app/navigation/**"
---

# FE – Navigation & Routing Agent

**Purpose**: Accelerate navigation setup following React Navigation best practices with proper typing, deep linking, and navigation flow management.

**Use when**:
- Setting up navigation stacks and tab navigators
- Configuring deep linking and universal links
- Implementing navigation params with TypeScript
- Building navigation flow for different auth states
- Handling navigation events (focus, blur)
- Creating dynamic navigation based on state

---

## Capabilities

### 1. Navigation Structure
- ✅ Stack Navigator configuration
- ✅ Bottom Tab Navigator setup
- ✅ Top Tab Navigator for secondary navigation
- ✅ Modal stacks
- ✅ Conditional navigation based on auth state

### 2. Type-Safe Navigation
- ✅ Navigation param type definitions
- ✅ Type-safe screen props
- ✅ Route typing with navigation param lists
- ✅ Screen options typing

### 3. Deep Linking
- ✅ URL scheme configuration
- ✅ Deep link path setup
- ✅ Linking configuration
- ✅ Parameter parsing from URLs

### 4. Navigation Events
- ✅ Focus listener
- ✅ Blur listener
- ✅ Navigation state changes
- ✅ Action prevention

### 5. Dynamic Navigation
- ✅ State-based navigation switching
- ✅ Auth flow integration
- ✅ Conditional screen hiding
- ✅ Dynamic tab management

---

## Type Definitions

### Navigation Param Lists

```typescript
// app/types/navigation.ts
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Auth Stack - Used before user is authenticated
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {
    token: string;
    email: string;
  };
};

/**
 * Game Stack - Games feature navigation
 */
export type GameStackParamList = {
  GameList: undefined;
  GameDetail: {
    gameId: number;
  };
  GamePlay: {
    gameId: number;
    sessionId: string;
  };
  GameResult: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
  };
};

/**
 * Home Stack - Home feature navigation
 */
export type HomeStackParamList = {
  HomeScreen: undefined;
  DailyQuestDetail: {
    questId: number;
  };
  QuestPlay: {
    questId: number;
  };
};

/**
 * Profile Stack - Profile feature navigation
 */
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  SettingsScreen: undefined;
  AchievementsDetail: undefined;
};

/**
 * Ranking Stack - Ranking feature navigation
 */
export type RankingStackParamList = {
  RankingScreen: undefined;
  UserDetail: {
    userId: number;
  };
};

/**
 * App Tab Navigator - Main navigation after auth
 */
export type AppTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  GameStack: NavigatorScreenParams<GameStackParamList>;
  RankingStack: NavigatorScreenParams<RankingStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
};

/**
 * Root Navigator - Top-level navigation
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
  Onboarding: undefined;
};

/**
 * Type-safe screen props
 */
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type GameScreenProps<T extends keyof GameStackParamList> =
  NativeStackScreenProps<GameStackParamList, T>;

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AppTabScreenProps<T extends keyof AppTabParamList> =
  BottomTabScreenProps<AppTabParamList, T>;
```

---

## Navigation Structure

### Root Navigator

```typescript
// app/navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  LinkingOptions,
} from '@react-navigation/native';
import type { RootStackParamList } from '@app/types';
import { useAppSelector } from '@app/redux/store';
import { selectAuthToken, selectIsLoading } from '@app/redux/selectors/authSelectors';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import OnboardingScreen from '@app/screens/Onboarding/OnboardingScreen';
import SplashScreen from '@app/screens/SplashScreen';

// Deep linking configuration
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['mathbattle://', 'https://mathbattle.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token/:email',
        },
      },
      App: {
        screens: {
          HomeStack: {
            screens: {
              HomeScreen: 'home',
              DailyQuestDetail: 'quest/:questId',
            },
          },
          GameStack: {
            screens: {
              GameList: 'games',
              GameDetail: 'game/:gameId',
              GamePlay: 'game/:gameId/play/:sessionId',
            },
          },
          RankingStack: {
            screens: {
              RankingScreen: 'ranking',
              UserDetail: 'user/:userId',
            },
          },
          ProfileStack: {
            screens: {
              ProfileScreen: 'profile',
              SettingsScreen: 'settings',
            },
          },
        },
      },
      Onboarding: 'onboarding',
    },
  },
};

const RootNavigator: React.FC = () => {
  const authToken = useAppSelector(selectAuthToken);
  const isLoading = useAppSelector(selectIsLoading);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  // Check if user has seen onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      // Load from storage
      setHasSeenOnboarding(true); // placeholder
    };
    checkOnboarding();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      linking={linking}
      fallback={<SplashScreen />}
    >
      {authToken ? (
        hasSeenOnboarding ? (
          <AppNavigator />
        ) : (
          <OnboardingScreen />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
```

### Auth Navigator

```typescript
// app/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@app/types';
import LoginScreen from '@app/screens/Auth/LoginScreen';
import RegisterScreen from '@app/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '@app/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@app/screens/Auth/ResetPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Forgot Password',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          title: 'Reset Password',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
```

### App Navigator (Main Navigation)

```typescript
// app/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { AppTabParamList } from '@app/types';

import HomeNavigator from './stacks/HomeNavigator';
import GameNavigator from './stacks/GameNavigator';
import RankingNavigator from './stacks/RankingNavigator';
import ProfileNavigator from './stacks/ProfileNavigator';

import { Home, Gamepad2, Trophy, User } from 'react-native-feather';
import { COLORS, SIZES } from '@app/constants';

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          height: 56,
          paddingBottom: SIZES.spacing.sm,
        },
        tabBarLabelStyle: {
          fontSize: SIZES.typography.caption,
          marginTop: -SIZES.spacing.xs,
        },
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="GameStack"
        component={GameNavigator}
        options={{
          title: 'Games',
          tabBarIcon: ({ color, size }) => (
            <Gamepad2 color={color} size={size} />
          ),
          tabBarBadge: 3, // Example: show unplayed games
        }}
      />
      <Tab.Screen
        name="RankingStack"
        component={RankingNavigator}
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color, size }) => (
            <Trophy color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
```

### Game Stack Navigator (Example Feature Stack)

```typescript
// app/navigation/stacks/GameNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { GameStackParamList } from '@app/types';

import GameListScreen from '@app/screens/Game/GameListScreen';
import GameDetailScreen from '@app/screens/Game/GameDetailScreen';
import GamePlayScreen from '@app/screens/Game/GamePlayScreen';
import GameResultScreen from '@app/screens/Game/GameResultScreen';

const Stack = createNativeStackNavigator<GameStackParamList>();

const GameNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 2,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="GameList"
        component={GameListScreen}
        options={{
          title: 'Games',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="GameDetail"
        component={GameDetailScreen}
        options={({ route }) => ({
          title: 'Game Details',
          headerShown: true,
        })}
      />
      <Stack.Group
        screenOptions={{
          presentation: 'fullScreenModal',
          headerShown: false,
          animationEnabled: true,
        }}
      >
        <Stack.Screen
          name="GamePlay"
          component={GamePlayScreen}
        />
        <Stack.Screen
          name="GameResult"
          component={GameResultScreen}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default GameNavigator;
```

---

## Navigation in Components

### Using Navigation Props

```tsx
import type { GameScreenProps } from '@app/types';

interface GamePlayScreenProps extends GameScreenProps<'GamePlay'> {}

const GamePlayScreen: React.FC<GamePlayScreenProps> = ({
  navigation,
  route,
}) => {
  const { gameId, sessionId } = route.params;

  const handleGameEnd = (score: number) => {
    navigation.replace('GameResult', {
      score,
      correctAnswers: 8,
      totalQuestions: 10,
    });
  };

  const handleQuit = () => {
    navigation.goBack();
  };

  return (
    <View>
      {/* Game content */}
    </View>
  );
};

export default GamePlayScreen;
```

### Navigation Hooks

```tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { GameStackParamList } from '@app/types';

const GameDetailScreen: React.FC = () => {
  const navigation = useNavigation<
    NativeStackNavigationProp<GameStackParamList, 'GameDetail'>
  >();
  const route = useRoute();

  const { gameId } = route.params;

  const handlePlayGame = () => {
    navigation.navigate('GamePlay', {
      gameId,
      sessionId: 'new-session',
    });
  };

  return <View>{/* Screen content */}</View>;
};

export default GameDetailScreen;
```

---

## Navigation Events

### Listen to Navigation Events

```tsx
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const GameListScreen: React.FC = () => {
  useFocusEffect(
    useCallback(() => {
      // Screen focused - refresh data
      console.log('Screen focused');
      // Dispatch fetch action

      return () => {
        // Screen blurred - cleanup
        console.log('Screen blurred');
      };
    }, [])
  );

  return <View>{/* Screen content */}</View>;
};
```

### Navigation Listener

```tsx
const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer
      onReady={() => {
        console.log('Navigation is ready');
      }}
      onStateChange={(state) => {
        console.log('Navigation state changed:', state);
        // Track screen views for analytics
      }}
    >
      {/* Navigators */}
    </NavigationContainer>
  );
};
```

---

## Deep Linking Example

### Handling Deep Links

```typescript
// app/navigation/linking.ts
import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '@app/types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['mathbattle://', 'https://mathbattle.app'],
  config: {
    screens: {
      App: {
        screens: {
          GameStack: {
            screens: {
              GamePlay: 'game/:gameId/play/:sessionId',
            },
          },
        },
      },
    },
  },
  // Async predicate to prevent navigation
  async getInitialURL() {
    // Check deep link from cold start
    const url = await getInitialURL();
    if (url != null) {
      return url;
    }
    return undefined;
  },
};

export async function getInitialURL() {
  const url = await dynamicLinks().getInitialLink();
  return url?.url;
}
```

---

## Navigation Performance Optimization

```tsx
// Avoid re-renders of navigation container
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(
  name: keyof RootStackParamList,
  params?: object
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

export function goBack() {
  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}
```

---

## File Organization

```
app/navigation/
├── RootNavigator.tsx           # Top-level navigator
├── AuthNavigator.tsx           # Auth stack
├── AppNavigator.tsx            # Main app tabs
├── stacks/
│   ├── HomeNavigator.tsx       # Home stack
│   ├── GameNavigator.tsx       # Game stack
│   ├── RankingNavigator.tsx    # Ranking stack
│   └── ProfileNavigator.tsx    # Profile stack
└── linking.ts                  # Deep linking config
```

---

## Example Prompts

1. **Set up GamePlay to GameResult navigation:**
```
Create navigation from GamePlay to GameResult that:
- Passes score and stats as params
- Uses fullScreenModal presentation
- Has proper TypeScript typing
- Includes back button on GameResult
- Handles orientation changes
```

2. **Implement deep linking for game URLs:**
```
Set up deep linking that:
- Opens app from URL: mathbattle://game/123/play/session-456
- Handles both cold start and warm state
- Shows proper loading while auth is verified
- Navigates to correct screen with params
```

3. **Add navigation event logging:**
```
Add analytics that:
- Tracks when each screen is focused
- Logs navigation actions
- Measures time spent on screens
- Sends to Firebase Analytics
```

---

## Checklist

- ✅ All navigation param lists typed with TypeScript
- ✅ Screen props typed correctly
- ✅ Navigation refs typed properly
- ✅ Deep linking configured
- ✅ Auth flow separated from app flow
- ✅ Tab navigation for main sections
- ✅ Stack navigation within features
- ✅ Navigation events handled (focus/blur)
- ✅ Back button behavior configured
- ✅ Modal presentation for overlays

---

**See also**: `ui-screen-development.agent.md` for screen implementation
