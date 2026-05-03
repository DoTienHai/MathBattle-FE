---
name: FE – API Integration & Redux Agent
description: "Implement API services, Redux state management, async thunks, selectors, and data persistence"
applyTo: "app/services/** app/redux/**"
---

# FE – API Integration & Redux Agent

**Purpose**: Accelerate API integration and state management setup following Redux best practices with proper typing, error handling, and data caching.

**Use when**:
- Creating API services for backend communication
- Building Redux slices and reducers
- Implementing async thunks for API calls
- Creating selectors for state queries
- Setting up error handling and retry logic
- Implementing data persistence with AsyncStorage
- Setting up API interceptors and middleware

---

## Capabilities

### 1. API Service Creation
- ✅ Axios/Fetch client setup
- ✅ Request/response interceptors
- ✅ Authentication token management
- ✅ Error handling and retries
- ✅ Timeout configuration
- ✅ Base URL configuration

### 2. Redux State Management
- ✅ Redux Toolkit slices with builders
- ✅ Async thunks for API calls
- ✅ Error handling in reducers
- ✅ Loading states
- ✅ Request cancellation

### 3. Selectors
- ✅ State selectors
- ✅ Memoized selectors
- ✅ Derived state selectors
- ✅ Normalized state queries

### 4. Data Persistence
- ✅ AsyncStorage integration
- ✅ State hydration
- ✅ Data caching strategies
- ✅ Offline support

### 5. Error Handling
- ✅ Error state management
- ✅ Retry logic
- ✅ Error recovery
- ✅ User-friendly error messages

---

## API Client Setup

### Basic API Client

```typescript
// app/services/api/client.ts
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT_MS } from '@app/constants';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<{ detail: string }>) => {
    const status = error.response?.status;

    // Handle 401 Unauthorized
    if (status === 401) {
      await AsyncStorage.removeItem('authToken');
      // Dispatch logout action or navigate to login
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      });
    }

    // Return error with detail message
    return Promise.reject({
      message: error.response.data?.detail || 'Something went wrong',
      status,
    });
  }
);

export default apiClient;
```

### Typed API Calls

```typescript
// app/services/gameService.ts
import apiClient from './api/client';
import type {
  Game,
  GameCreate,
  GameListResponse,
  GameResponse,
  AnswerSubmission,
  AnswerResult,
} from '@app/types';

export const gameService = {
  /**
   * Fetch list of games with pagination
   */
  async listGames(
    skip: number = 0,
    limit: number = 10
  ): Promise<GameListResponse> {
    const response = await apiClient.get<GameListResponse>(
      '/api/v1/games',
      {
        params: { skip, limit },
      }
    );
    return response.data;
  },

  /**
   * Get single game by ID
   */
  async getGame(gameId: number): Promise<Game> {
    const response = await apiClient.get<Game>(
      `/api/v1/games/${gameId}`
    );
    return response.data;
  },

  /**
   * Start a new game session
   */
  async startGame(difficulty: string): Promise<GameResponse> {
    const response = await apiClient.post<GameResponse>(
      '/api/v1/games/start',
      { difficulty }
    );
    return response.data;
  },

  /**
   * Submit an answer to a game problem
   */
  async submitAnswer(
    gameId: number,
    answer: string
  ): Promise<AnswerResult> {
    const response = await apiClient.post<AnswerResult>(
      `/api/v1/games/${gameId}/answer`,
      { answer }
    );
    return response.data;
  },

  /**
   * Finish game and get results
   */
  async finishGame(gameId: number): Promise<GameResponse> {
    const response = await apiClient.post<GameResponse>(
      `/api/v1/games/${gameId}/finish`
    );
    return response.data;
  },
};
```

---

## Redux Setup

### Redux Store Configuration

```typescript
// app/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useSelector as useReduxSelector, useDispatch as useReduxDispatch } from 'react-redux';

import authReducer from './slices/authSlice';
import gameReducer from './slices/gameSlice';
import userReducer from './slices/userSlice';
import rankingReducer from './slices/rankingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    user: userReducer,
    ranking: rankingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
export const useAppDispatch = () => useReduxDispatch<AppDispatch>();
```

### Redux Slice with Async Thunks

```typescript
// app/redux/slices/gameSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { gameService } from '@app/services';
import type { Game, GameState, GameResponse, AnswerResult } from '@app/types';

const initialState: GameState = {
  games: [],
  currentGame: null,
  gameSession: null,
  loading: false,
  error: null,
  submitting: false,
};

/**
 * Async thunk: Fetch games list
 */
export const fetchGames = createAsyncThunk<
  Game[], // Return type
  { skip: number; limit: number }, // Argument type
  { rejectValue: string } // Reject value type
>(
  'game/fetchGames',
  async ({ skip, limit }, { rejectWithValue }) => {
    try {
      const response = await gameService.listGames(skip, limit);
      return response.games;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch games');
    }
  }
);

/**
 * Async thunk: Fetch single game
 */
export const fetchGame = createAsyncThunk<
  Game,
  number, // gameId
  { rejectValue: string }
>(
  'game/fetchGame',
  async (gameId, { rejectWithValue }) => {
    try {
      return await gameService.getGame(gameId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk: Start a new game
 */
export const startGame = createAsyncThunk<
  GameResponse,
  string, // difficulty
  { rejectValue: string }
>(
  'game/startGame',
  async (difficulty, { rejectWithValue }) => {
    try {
      return await gameService.startGame(difficulty);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk: Submit answer
 */
export const submitAnswer = createAsyncThunk<
  AnswerResult,
  { gameId: number; answer: string },
  { rejectValue: string }
>(
  'game/submitAnswer',
  async ({ gameId, answer }, { rejectWithValue }) => {
    try {
      return await gameService.submitAnswer(gameId, answer);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Redux slice
 */
export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Synchronous actions
    clearCurrentGame(state) {
      state.currentGame = null;
    },
    clearGameSession(state) {
      state.gameSession = null;
    },
    clearError(state) {
      state.error = null;
    },
    setGames(state, action: PayloadAction<Game[]>) {
      state.games = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchGames
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
        state.error = action.payload || 'Failed to fetch games';
      })

      // fetchGame
      .addCase(fetchGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGame.fulfilled, (state, action) => {
        state.currentGame = action.payload;
        state.loading = false;
      })
      .addCase(fetchGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch game';
      })

      // startGame
      .addCase(startGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startGame.fulfilled, (state, action) => {
        state.gameSession = action.payload;
        state.loading = false;
      })
      .addCase(startGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to start game';
      })

      // submitAnswer
      .addCase(submitAnswer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.submitting = false;
        // Handle answer result
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to submit answer';
      });
  },
});

export default gameSlice.reducer;
export const { clearCurrentGame, clearGameSession, clearError, setGames } =
  gameSlice.actions;
```

---

## Redux Selectors

### Selector Pattern

```typescript
// app/redux/selectors/gameSelectors.ts
import type { RootState } from '@app/redux/store';
import type { Game } from '@app/types';

/**
 * Basic selectors
 */
export const selectGames = (state: RootState): Game[] => state.game.games;
export const selectCurrentGame = (state: RootState) => state.game.currentGame;
export const selectGameSession = (state: RootState) => state.game.gameSession;
export const selectGameLoading = (state: RootState): boolean => state.game.loading;
export const selectGameError = (state: RootState): string | null => state.game.error;
export const selectGameSubmitting = (state: RootState): boolean => state.game.submitting;

/**
 * Derived selectors - filtered/transformed data
 */
export const selectEasyGames = (state: RootState): Game[] =>
  state.game.games.filter(game => game.difficulty === 'easy');

export const selectGameById = (state: RootState, gameId: number) =>
  state.game.games.find(game => game.id === gameId);

export const selectGameCount = (state: RootState): number =>
  state.game.games.length;

/**
 * Combined selectors
 */
export const selectGameListState = (state: RootState) => ({
  games: state.game.games,
  loading: state.game.loading,
  error: state.game.error,
});

export const selectGamePlayState = (state: RootState) => ({
  gameSession: state.game.gameSession,
  currentGame: state.game.currentGame,
  submitting: state.game.submitting,
  error: state.game.error,
});
```

---

## Using Redux in Components

### Component Integration

```tsx
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@app/redux/store';
import { fetchGames, selectGames, selectGameLoading } from '@app/redux/slices/gameSlice';
import { GameList } from '@app/components';

const GameListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const games = useAppSelector(selectGames);
  const loading = useAppSelector(selectGameLoading);

  useEffect(() => {
    dispatch(fetchGames({ skip: 0, limit: 10 }));
  }, [dispatch]);

  return (
    <View>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <GameList games={games} />
      )}
    </View>
  );
};

export default GameListScreen;
```

---

## Data Persistence

### AsyncStorage Integration

```typescript
// app/redux/middleware/persistMiddleware.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Middleware } from 'redux';
import type { RootState } from '@app/redux/store';

const PERSIST_KEY = 'mathbattle-state';

export const persistMiddleware: Middleware =
  (store) => (next) => async (action) => {
    const result = next(action);
    
    // Save state after every action
    const state = store.getState();
    try {
      await AsyncStorage.setItem(
        PERSIST_KEY,
        JSON.stringify({
          auth: state.auth,
          user: state.user,
          // Don't persist game sessions
        })
      );
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
    
    return result;
  };

/**
 * Hydrate state from AsyncStorage
 */
export const hydrateState = async (): Promise<Partial<RootState> | null> => {
  try {
    const state = await AsyncStorage.getItem(PERSIST_KEY);
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Failed to hydrate state:', error);
    return null;
  }
};
```

### Store Initialization with Hydration

```typescript
// app/redux/store.ts
import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import { persistMiddleware } from './middleware/persistMiddleware';
import type { RootState } from '@app/redux/store';

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      game: gameReducer,
      user: userReducer,
      ranking: rankingReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(persistMiddleware),
  });
}

export const store = setupStore();
```

### App Initialization

```typescript
// App.tsx
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@app/redux/store';
import { hydrateState } from '@app/redux/middleware/persistMiddleware';
import RootNavigator from '@app/navigation/RootNavigator';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const persistedState = await hydrateState();
      if (persistedState) {
        // Reinitialize store with persisted state
        // (requires setupStore pattern)
      }
      setIsReady(true);
    };

    initializeApp();
  }, []);

  if (!isReady) return null;

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}
```

---

## Error Handling Pattern

```typescript
// app/redux/slices/gameSlice.ts - Error handling example
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    retryLastAction(state, action: PayloadAction<string>) {
      // Retry logic
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
        state.lastFailedAction = 'fetchGames';
        state.lastFailedActionParams = action.meta.arg;
      });
  },
});
```

---

## Example Prompts

1. **Set up API service for user management:**
```
Create userService that:
- Implements getUser(userId: number): Promise<User>
- Implements updateProfile(updates: UserUpdate): Promise<User>
- Implements logout(): Promise<void>
- Handles errors and returns typed responses
- Uses apiClient for HTTP requests
```

2. **Create Redux slice for authentication:**
```
Create authSlice that:
- Has state: user, token, loading, error
- Has thunks: login, register, logout, refreshToken
- Persists token to AsyncStorage
- Handles 401 errors with token refresh
- Includes selectors for isAuthenticated, currentUser
```

3. **Implement data caching strategy:**
```
Set up caching that:
- Caches games list for 5 minutes
- Invalidates cache on new game creation
- Shows cached data while fetching fresh data
- Handles offline scenarios gracefully
```

---

## Checklist

- ✅ API client configured with base URL and timeout
- ✅ Request interceptor adds auth token
- ✅ Response interceptor handles errors
- ✅ Redux store properly typed with TypeScript
- ✅ Slices use createAsyncThunk for API calls
- ✅ Error states in every async thunk
- ✅ Selectors properly typed and memoized
- ✅ Components use useAppDispatch and useAppSelector
- ✅ State persisted to AsyncStorage
- ✅ Proper error handling and user feedback

---

**See also**: `ui-screen-development.agent.md` for using Redux in screens
