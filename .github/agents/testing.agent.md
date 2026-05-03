---
name: FE – Testing & Quality Agent
description: "Write unit tests, component tests, integration tests, fixtures, mocking, and coverage analysis"
applyTo: "tests/** **/*.test.tsx **/*.test.ts"
---

# FE – Testing & Quality Agent

**Purpose**: Accelerate testing coverage with comprehensive unit, component, and integration tests following React Native and Jest best practices.

**Use when**:
- Writing component unit tests
- Creating integration tests for user flows
- Setting up test fixtures and factories
- Mocking Redux, API calls, and navigation
- Measuring code coverage
- Testing error scenarios and edge cases

---

## Capabilities

### 1. Component Testing
- ✅ Render component with React Native Testing Library
- ✅ User interaction simulation (press, type, scroll)
- ✅ Snapshot testing for visual regression
- ✅ Props and state variation testing
- ✅ Accessibility testing

### 2. Integration Testing
- ✅ End-to-end screen flows
- ✅ Navigation between screens
- ✅ Redux store integration
- ✅ API mock responses
- ✅ Error state handling

### 3. Redux Testing
- ✅ Action creator testing
- ✅ Reducer state changes
- ✅ Async thunk testing
- ✅ Selector testing
- ✅ Store integration

### 4. Mocking
- ✅ Mock API responses with MSW or jest.mock
- ✅ Mock Redux store
- ✅ Mock Navigation
- ✅ Mock AsyncStorage
- ✅ Mock native modules

### 5. Coverage Analysis
- ✅ Line coverage
- ✅ Branch coverage
- ✅ Function coverage
- ✅ Coverage reports

---

## Testing Setup

### Jest Configuration

```json
// package.json
{
  "jest": {
    "preset": "react-native",
    "testEnvironment": "node",
    "setupFilesAfterEnv": [
      "<rootDir>/tests/setup.ts",
      "@testing-library/jest-native/extend-expect"
    ],
    "collectCoverageFrom": [
      "app/**/*.{ts,tsx}",
      "!app/**/*.d.ts",
      "!app/types/**",
      "!app/**/*.stories.tsx"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    },
    "moduleNameMapper": {
      "^@app/(.*)$": "<rootDir>/app/$1"
    }
  }
}
```

### Test Setup File

```typescript
// tests/setup.ts
import '@testing-library/jest-native/extend-expect';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useColorScheme: () => 'light',
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
  };
});

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
```

---

## Component Testing

### Basic Component Test

```typescript
// app/components/buttons/PrimaryButton.test.tsx
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

    const button = screen.getByTestId('primary-button');
    fireEvent.press(button);
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

    expect(screen.queryByText('Press me')).toBeNull();
    // Check for ActivityIndicator
  });

  it('matches snapshot', () => {
    const tree = render(
      <PrimaryButton
        title="Press me"
        onPress={jest.fn()}
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
```

### Component with Props Variations

```typescript
// app/components/cards/GameCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GameCard } from './GameCard';
import type { Game } from '@app/types';

describe('GameCard', () => {
  const mockGame: Game = {
    id: 1,
    title: 'Math Quiz',
    difficulty: 'easy',
    description: 'Basic math problems',
    maxPlayers: 4,
    createdAt: '2024-01-01',
  };

  it('renders game information', () => {
    render(
      <GameCard
        game={mockGame}
        onPress={jest.fn()}
      />
    );

    expect(screen.getByText('Math Quiz')).toBeTruthy();
    expect(screen.getByText('Basic math problems')).toBeTruthy();
  });

  it('displays difficulty badge', () => {
    render(
      <GameCard
        game={mockGame}
        onPress={jest.fn()}
      />
    );

    expect(screen.getByText('easy')).toBeTruthy();
  });

  it('navigates when pressed', () => {
    const onPress = jest.fn();
    render(
      <GameCard
        game={mockGame}
        onPress={onPress}
      />
    );

    fireEvent.press(screen.getByTestId('game-card'));
    expect(onPress).toHaveBeenCalledWith(mockGame);
  });

  it('shows different difficulty colors', () => {
    const hardGame = { ...mockGame, difficulty: 'hard' as const };
    const { rerender } = render(
      <GameCard
        game={mockGame}
        onPress={jest.fn()}
      />
    );

    rerender(
      <GameCard
        game={hardGame}
        onPress={jest.fn()}
      />
    );

    expect(screen.getByText('hard')).toBeTruthy();
  });
});
```

---

## Redux Testing

### Redux Slice Testing

```typescript
// app/redux/slices/gameSlice.test.ts
import gameReducer, {
  setGames,
  clearGames,
  clearError,
} from './gameSlice';
import type { GameState } from '@app/types';

describe('gameSlice', () => {
  const initialState: GameState = {
    games: [],
    currentGame: null,
    gameSession: null,
    loading: false,
    error: null,
    submitting: false,
  };

  it('handles setGames action', () => {
    const games = [
      { id: 1, title: 'Game 1', difficulty: 'easy' },
      { id: 2, title: 'Game 2', difficulty: 'hard' },
    ];

    const state = gameReducer(initialState, setGames(games));

    expect(state.games).toEqual(games);
  });

  it('handles clearGames action', () => {
    const stateWithGames = {
      ...initialState,
      games: [{ id: 1, title: 'Game 1', difficulty: 'easy' }],
    };

    const state = gameReducer(stateWithGames, clearGames());

    expect(state.games).toEqual([]);
  });

  it('handles clearError action', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error',
    };

    const state = gameReducer(stateWithError, clearError());

    expect(state.error).toBeNull();
  });
});
```

### Async Thunk Testing

```typescript
// app/redux/thunks/gameThunks.test.ts
import { configureStore } from '@reduxjs/toolkit';
import { fetchGames } from './gameThunks';
import gameReducer from '../slices/gameSlice';
import * as gameService from '@app/services/gameService';

// Mock the service
jest.mock('@app/services/gameService');

describe('gameThunks', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: gameReducer,
      },
    });
    jest.clearAllMocks();
  });

  it('handles fetchGames.pending', async () => {
    const mockGames = [
      { id: 1, title: 'Game 1', difficulty: 'easy' },
    ];

    (gameService.gameService.listGames as jest.Mock).mockResolvedValue({
      games: mockGames,
    });

    await store.dispatch(fetchGames({ skip: 0, limit: 10 }));

    const state = store.getState().game;
    expect(state.games).toEqual(mockGames);
    expect(state.loading).toBeFalsy();
    expect(state.error).toBeNull();
  });

  it('handles fetchGames.rejected', async () => {
    const error = 'Network error';
    (gameService.gameService.listGames as jest.Mock).mockRejectedValue(
      new Error(error)
    );

    await store.dispatch(fetchGames({ skip: 0, limit: 10 }));

    const state = store.getState().game;
    expect(state.error).toBeTruthy();
    expect(state.games).toEqual([]);
  });
});
```

### Selector Testing

```typescript
// app/redux/selectors/gameSelectors.test.ts
import {
  selectGames,
  selectGameLoading,
  selectEasyGames,
} from './gameSelectors';
import type { RootState } from '@app/redux/store';

describe('gameSelectors', () => {
  const mockState: RootState = {
    game: {
      games: [
        { id: 1, title: 'Easy Game', difficulty: 'easy' },
        { id: 2, title: 'Hard Game', difficulty: 'hard' },
      ],
      loading: false,
      error: null,
      currentGame: null,
      gameSession: null,
      submitting: false,
    },
    auth: { /* ... */ },
    user: { /* ... */ },
    ranking: { /* ... */ },
  };

  it('selectGames returns all games', () => {
    const games = selectGames(mockState);
    expect(games).toHaveLength(2);
  });

  it('selectGameLoading returns loading state', () => {
    const loading = selectGameLoading(mockState);
    expect(loading).toBeFalsy();
  });

  it('selectEasyGames returns only easy games', () => {
    const easyGames = selectEasyGames(mockState);
    expect(easyGames).toHaveLength(1);
    expect(easyGames[0].difficulty).toBe('easy');
  });
});
```

---

## Screen/Integration Testing

### Screen Test with Redux

```typescript
// app/screens/Game/GameListScreen.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GameListScreen from './GameListScreen';
import gameReducer from '@app/redux/slices/gameSlice';
import * as gameService from '@app/services/gameService';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

jest.mock('@app/services/gameService');

describe('GameListScreen', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: gameReducer,
      },
    });
  });

  it('displays loading state initially', () => {
    render(
      <Provider store={store}>
        <GameListScreen />
      </Provider>
    );

    // Check for loading indicator
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('displays games after loading', async () => {
    const mockGames = [
      { id: 1, title: 'Game 1', difficulty: 'easy' },
      { id: 2, title: 'Game 2', difficulty: 'hard' },
    ];

    (gameService.gameService.listGames as jest.Mock).mockResolvedValue({
      games: mockGames,
    });

    render(
      <Provider store={store}>
        <GameListScreen />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeTruthy();
      expect(screen.getByText('Game 2')).toBeTruthy();
    });
  });

  it('displays error state', async () => {
    (gameService.gameService.listGames as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    render(
      <Provider store={store}>
        <GameListScreen />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeTruthy();
    });
  });
});
```

### Screen Test with Navigation

```typescript
// app/screens/Game/GameDetailScreen.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GameDetailScreen from './GameDetailScreen';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: { gameId: 123 },
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

describe('GameDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to GamePlay when Play button pressed', () => {
    render(<GameDetailScreen />);

    fireEvent.press(screen.getByText('Play'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('GamePlay', {
      gameId: 123,
    });
  });

  it('goes back when back pressed', () => {
    render(<GameDetailScreen />);

    fireEvent.press(screen.getByTestId('back-button'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
```

---

## Mocking Patterns

### Mock API Service

```typescript
// __mocks__/services/gameService.ts
export const gameService = {
  listGames: jest.fn(),
  getGame: jest.fn(),
  startGame: jest.fn(),
  submitAnswer: jest.fn(),
};
```

### Mock Redux Store

```typescript
// tests/redux/mockStore.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/redux/slices/authSlice';
import gameReducer from '@app/redux/slices/gameSlice';

export function createMockStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      game: gameReducer,
    },
    preloadedState,
  });
}
```

### Mock AsyncStorage

```typescript
// __mocks__/AsyncStorage.ts
export default {
  getItem: jest.fn(async (key) => null),
  setItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => null),
  clear: jest.fn(async () => null),
};
```

---

## Test Utilities

### Custom Render Function

```typescript
// tests/utils/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '@app/redux/store';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
```

### Factory Functions

```typescript
// tests/factories/gameFactory.ts
import type { Game } from '@app/types';

export function createGame(overrides?: Partial<Game>): Game {
  return {
    id: 1,
    title: 'Test Game',
    difficulty: 'easy',
    description: 'Test description',
    maxPlayers: 4,
    createdAt: '2024-01-01',
    ...overrides,
  };
}

export function createGames(count: number): Game[] {
  return Array.from({ length: count }, (_, i) =>
    createGame({ id: i + 1, title: `Game ${i + 1}` })
  );
}
```

---

## File Organization

```
tests/
├── setup.ts                       # Jest setup
├── __mocks__/
│   └── services/
│       └── gameService.ts
├── factories/
│   ├── gameFactory.ts
│   ├── userFactory.ts
│   └── index.ts
├── utils/
│   ├── test-utils.tsx
│   └── mockStore.ts
├── redux/
│   ├── slices/
│   │   └── gameSlice.test.ts
│   └── selectors/
│       └── gameSelectors.test.ts
├── components/
│   └── buttons/
│       └── PrimaryButton.test.tsx
└── screens/
    └── Game/
        └── GameListScreen.test.tsx
```

---

## Example Prompts

1. **Write tests for GameCard:**
```
Write comprehensive tests for GameCard that:
- Test rendering with props
- Test onPress callback
- Test different difficulty levels
- Test with accessibility props
- Include snapshot test
```

2. **Test fetchGames thunk:**
```
Write tests for fetchGames async thunk that:
- Mock gameService
- Test pending state
- Test fulfilled state
- Test rejected state
- Test with Redux store
```

3. **Test GameListScreen integration:**
```
Write integration test for GameListScreen that:
- Provides Redux store
- Mocks navigation
- Tests loading state
- Tests game list rendering
- Tests error handling
```

---

## Coverage Targets

| Category | Target |
|----------|--------|
| Lines | 70%+ |
| Branches | 70%+ |
| Functions | 70%+ |
| Statements | 70%+ |

---

## Checklist

- ✅ Jest configured with React Native preset
- ✅ Testing Library installed and configured
- ✅ Redux mocks created
- ✅ Navigation mocks created
- ✅ AsyncStorage mocks created
- ✅ Factory functions for test data
- ✅ Custom render function with providers
- ✅ Component tests written
- ✅ Redux tests written
- ✅ Screen integration tests written
- ✅ Coverage reports generated

---

**See also**: `component-development.agent.md`, `ui-screen-development.agent.md`
