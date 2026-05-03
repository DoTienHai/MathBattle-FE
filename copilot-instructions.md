---
name: MathBattle-FE Coding Rules
description: "Code standards, style guide, and implementation patterns for React Native development"
---

# 📝 copilot-instructions.md: Coding Rules

Câu hỏi: **"Viết code như thế nào cho đúng?"** ← File này trả lời.

---

## 1. TypeScript (MANDATORY)

**Rule**: Every file, component, function must use TypeScript with strict types.

```tsx
// ❌ WRONG
const MyComponent = ({ name, age }) => {
  return <Text>{name} is {age}</Text>;
};

// ✅ CORRECT
interface UserProps {
  name: string;
  age: number;
  onPress?: () => void;
}

const MyComponent: React.FC<UserProps> = ({ name, age, onPress }) => {
  return <Text onPress={onPress}>{name} is {age}</Text>;
};
```

**Type definitions checklist:**
```typescript
// For component props
interface ComponentProps {
  title: string;
  count?: number;
  onPress: () => void;
}

// For API responses
interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

// For Redux state
interface GameState {
  games: Game[];
  loading: boolean;
  error: string | null;
}

// For service functions
async function getUser(userId: number): Promise<User> {
  ...
}
```

---

## 2. Code Style & Naming

### File Organization
```
✅ CORRECT structure:
app/
├── components/
│   └── buttons/
│       ├── PrimaryButton.tsx        (Component file)
│       ├── PrimaryButton.styles.ts  (Styles)
│       ├── PrimaryButton.test.tsx   (Tests)
│       └── index.ts                 (Export)
├── screens/
│   └── GameScreen.tsx               (One screen per file)
├── redux/
│   └── slices/
│       ├── gameSlice.ts             (Slice definition)
│       └── gameSelectors.ts         (Selectors)
└── services/
    └── gameService.ts              (API service)
```

### Naming Conventions

```typescript
// Components (PascalCase)
export const GameCard: React.FC<GameCardProps> = () => {};
export const UserProfile: React.FC<UserProfileProps> = () => {};

// Files (PascalCase for components, camelCase for utilities)
GameCard.tsx          ✅
userProfile.tsx       ❌ (should be UserProfile.tsx)
gameService.ts        ✅
GameService.ts        ❌ (should be gameService.ts)

// Functions and variables (camelCase)
const calculateScore = (points: number): number => {};
const getUserFromStore = useSelector(...);

// Constants (UPPER_SNAKE_CASE)
const MAX_GAME_SCORE = 1000;
const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;
const API_TIMEOUT_MS = 5000;

// Redux slices (feature.slice.ts)
gameSlice.ts          ✅
userSlice.ts          ✅

// Redux selectors (feature.selectors.ts)
gameSelectors.ts      ✅
```

### Import Organization

```typescript
// ① React & React Native
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

// ② Third-party libraries
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

// ③ Redux
import { selectGames, selectLoading } from '@app/redux/slices/gameSlice';
import { fetchGames } from '@app/redux/thunks/gameThunks';

// ④ Types
import type { Game, User, RootState } from '@app/types';

// ⑤ Services
import { gameService } from '@app/services';

// ⑥ Utils & Constants
import { formatDate, calculateScore } from '@app/utils';
import { COLORS, SIZES } from '@app/constants';

// ⑦ Components
import { GameCard } from '@app/components/cards';
import { CustomButton } from '@app/components/buttons';
```

**Rule**: No relative imports in cross-feature code. Use absolute paths with `@app/` alias.

```typescript
// ❌ WRONG
import { UserCard } from '../../../components/cards/UserCard';

// ✅ CORRECT
import { UserCard } from '@app/components/cards/UserCard';
```

---

## 3. React Component Structure

### Functional Components Only

```tsx
// ❌ WRONG - Class component
class GameScreen extends React.Component {
  render() {
    return <View>...</View>;
  }
}

// ✅ CORRECT - Functional component with hooks
interface GameScreenProps {
  gameId: number;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameId }) => {
  const [score, setScore] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGame(gameId));
  }, [gameId, dispatch]);

  return <View>...</View>;
};

export default GameScreen;
```

### Component Best Practices

```tsx
// ✅ DO
// 1. Define types first
interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

// 2. Use React.FC for typing
const CustomButton: React.FC<Props> = ({ 
  title, 
  onPress, 
  disabled = false 
}) => {
  // 3. Hooks at top level
  const [pressed, setPressed] = useState(false);

  // 4. Effects grouped
  useEffect(() => {
    // Effect logic
  }, []);

  // 5. Handlers defined in component
  const handlePress = () => {
    setPressed(true);
    onPress();
  };

  // 6. Return JSX
  return (
    <TouchableOpacity 
      onPress={handlePress}
      disabled={disabled}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

// ❌ DON'T
// - Pass JSX as inline functions
// - Use any type
// - Props destructuring in signature without types
// - State updates in render
// - Multiple useEffects without separation
```

---

## 4. Redux State Management

### Slice Structure

```typescript
// app/redux/slices/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Game, GameState } from '@app/types';

const initialState: GameState = {
  games: [],
  currentGame: null,
  loading: false,
  error: null,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Synchronous actions
    setCurrentGame(state, action: PayloadAction<Game>) {
      state.currentGame = action.payload;
    },
    clearGames(state) {
      state.games = [];
    },
  },
  extraReducers: (builder) => {
    // Handle async thunks
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.games = action.payload;
        state.loading = false;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default gameSlice.reducer;
export const { setCurrentGame, clearGames } = gameSlice.actions;
```

### Async Thunks

```typescript
// app/redux/thunks/gameThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { gameService } from '@app/services';
import type { Game } from '@app/types';

export const fetchGames = createAsyncThunk<
  Game[],           // Return type
  { skip: number; limit: number }, // Argument type
  { rejectValue: string } // Return type for errors
>(
  'game/fetchGames',
  async ({ skip, limit }, { rejectWithValue }) => {
    try {
      const games = await gameService.listGames(skip, limit);
      return games;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Selectors

```typescript
// app/redux/selectors/gameSelectors.ts
import type { RootState } from '@app/redux/store';

export const selectGames = (state: RootState) => state.game.games;
export const selectCurrentGame = (state: RootState) => state.game.currentGame;
export const selectGameLoading = (state: RootState) => state.game.loading;
export const selectGameError = (state: RootState) => state.game.error;

// Memoized selector for filtered games
export const selectEasyGames = (state: RootState) =>
  state.game.games.filter(game => game.difficulty === 'easy');
```

### Using Redux in Components

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { selectGames, selectGameLoading } from '@app/redux/selectors/gameSelectors';
import { fetchGames } from '@app/redux/thunks/gameThunks';

const GameListScreen: React.FC = () => {
  const dispatch = useDispatch();
  const games = useSelector(selectGames);
  const loading = useSelector(selectGameLoading);

  useEffect(() => {
    dispatch(fetchGames({ skip: 0, limit: 10 }));
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      data={games}
      renderItem={({ item }) => <GameCard game={item} />}
      keyExtractor={item => item.id.toString()}
    />
  );
};
```

---

## 5. API Services & HTTP Requests

### Service Structure

```typescript
// app/services/gameService.ts
import { apiClient } from '@app/services/api';
import type { Game, GameResponse } from '@app/types';

export const gameService = {
  async listGames(skip: number = 0, limit: number = 10): Promise<Game[]> {
    try {
      const response = await apiClient.get('/api/v1/games', {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch games: ${error}`);
    }
  },

  async getGame(gameId: number): Promise<Game> {
    const response = await apiClient.get(`/api/v1/games/${gameId}`);
    return response.data;
  },

  async startGame(difficulty: string): Promise<GameResponse> {
    const response = await apiClient.post('/api/v1/games/start', {
      difficulty
    });
    return response.data;
  },

  async submitAnswer(gameId: number, answer: string): Promise<AnswerResult> {
    const response = await apiClient.post(
      `/api/v1/games/${gameId}/answer`,
      { answer }
    );
    return response.data;
  },
};
```

### API Client Setup

```typescript
// app/services/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT_MS } from '@app/constants';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

// Request interceptor for auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);
```

---

## 6. Custom Hooks

### Hook Pattern

```typescript
// app/hooks/useGame.ts
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGame } from '@app/redux/thunks';
import { selectCurrentGame, selectGameLoading } from '@app/redux/selectors';

interface UseGameReturn {
  game: Game | null;
  loading: boolean;
  error: string | null;
}

export const useGame = (gameId: number): UseGameReturn => {
  const dispatch = useDispatch();
  const game = useSelector(selectCurrentGame);
  const loading = useSelector(selectGameLoading);

  useEffect(() => {
    if (gameId) {
      dispatch(fetchGame(gameId));
    }
  }, [gameId, dispatch]);

  return { game, loading, error: null };
};
```

### HTTP Request Hook

```typescript
// app/hooks/useApi.ts
import { useState, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T,>(
  fn: () => Promise<T>,
  deps: any[] = []
): UseApiState<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await fn();
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: (error as Error).message,
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
};
```

---

## 7. Navigation Setup

### Navigation Typing

```typescript
// app/types/navigation.ts
import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type GameStackParamList = {
  GameList: undefined;
  GameDetail: { gameId: number };
  GamePlay: { gameId: number };
};

export type AppTabParamList = {
  Home: undefined;
  Game: NavigatorScreenParams<GameStackParamList>;
  Ranking: undefined;
  Profile: undefined;
};
```

### Screen Navigation

```tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GameStackParamList } from '@app/types/navigation';

type GamePlayScreenProps = NativeStackScreenProps<
  GameStackParamList,
  'GamePlay'
>;

const GamePlayScreen: React.FC<GamePlayScreenProps> = ({ route, navigation }) => {
  const { gameId } = route.params;

  const handleFinish = () => {
    navigation.navigate('GameList');
  };

  return <View>{/* Screen content */}</View>;
};

export default GamePlayScreen;
```

---

## 8. Error Handling & Loading States

### Pattern for Async Operations

```tsx
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const MyComponent: React.FC = () => {
  const [state, setState] = useState<AsyncState<Game>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const loadGame = async () => {
      setState({ data: null, loading: true, error: null });
      try {
        const game = await gameService.getGame(123);
        setState({ data: game, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: (error as Error).message,
        });
      }
    };

    loadGame();
  }, []);

  if (state.loading) return <LoadingSpinner />;
  if (state.error) return <ErrorMessage message={state.error} />;
  if (!state.data) return <EmptyState />;

  return <GameCard game={state.data} />;
};
```

---

## 9. Testing Rules

### Test File Structure

```typescript
// GameCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GameCard } from './GameCard';

describe('GameCard', () => {
  it('should render game title', () => {
    const game = { id: 1, title: 'Math Quiz', difficulty: 'easy' };
    render(<GameCard game={game} />);
    
    expect(screen.getByText('Math Quiz')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    render(<GameCard game={game} onPress={onPress} />);
    
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

---

## 10. Performance Best Practices

```tsx
// ✅ DO - Memoize expensive components
const GameCard = React.memo<GameCardProps>(({ game, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{game.title}</Text>
    </TouchableOpacity>
  );
});

// ✅ DO - Use FlatList with keyExtractor
<FlatList
  data={games}
  renderItem={({ item }) => <GameCard game={item} />}
  keyExtractor={item => item.id.toString()}
  removeClippedSubviews
/>

// ❌ DON'T - Inline function definitions
const handlePress = () => { /* ... */ };  // ✅ Define outside
onPress={() => handlePress()}             // ❌ Inline

// ✅ DO - Use lazy loading for images
<Image
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  progressiveRenderingEnabled
/>
```

---

## 11. TypeScript Strict Mode

**tsconfig.json requirements:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**No `any` types allowed unless absolutely necessary:**
```typescript
// ❌ WRONG
const data: any = fetchData();

// ✅ CORRECT
const data: Game[] = await gameService.listGames();
```

---

## Summary Checklist

- ✅ TypeScript strict mode enabled
- ✅ All functions have type hints
- ✅ All component props typed
- ✅ Absolute imports with @app/ alias
- ✅ Redux for state management
- ✅ Services for API calls
- ✅ React hooks in functional components
- ✅ Custom hooks for shared logic
- ✅ Error boundaries for error handling
- ✅ Proper loading states
- ✅ Tests for components and functions
- ✅ No inline styles (use StyleSheet)
- ✅ Accessibility considerations (testID, accessible props)

---

**Last Updated**: May 2026  
**Status**: Development Guidelines Ready  
**See also**: `AGENTS.md` for project architecture
