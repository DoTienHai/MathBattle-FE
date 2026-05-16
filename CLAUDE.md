# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MathBattle-FE is a React Native (Expo) mobile app for an interactive math learning platform. It is cross-platform (iOS & Android) and uses file-based routing via Expo Router.

Backend runs at `http://localhost:8000` (configured via `EXPO_PUBLIC_API_URL` in `.env`).

---

## Commands

```bash
# Start dev server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios

# Lint
npx expo lint
```

No test runner is configured yet (no `__tests__` directory or jest config exists).

---

## Architecture

### Navigation (Expo Router — file-based)

```
app/
├── _layout.tsx          # Root: wraps app with <Providers> (Redux), Stack navigator
├── index.tsx            # Auth guard: redirects to /(tabs)/home or /auth/login
├── (tabs)/
│   ├── _layout.tsx      # Bottom tab navigator
│   ├── home/index.tsx   # Home dashboard + sub-routes (daily-quiz, level-quiz, etc.)
│   ├── stats.tsx
│   ├── leaders.tsx
│   └── settings.tsx
└── auth/
    ├── login.tsx
    └── register.tsx
```

Route guards live in `app/index.tsx` — it reads `isAuthenticated` from Redux and redirects accordingly. Do not add auth logic elsewhere.

### State Management (Redux Toolkit)

The store (`redux/store.ts`) has one slice so far: `auth`.

Each feature follows this 3-file pattern:
- `redux/slices/<feature>Slice.ts` — state shape + synchronous reducers
- `redux/thunks/<feature>Thunks.ts` — `createAsyncThunk` actions that call services
- `redux/selectors/<feature>Selectors.ts` — plain selector functions off `RootState`

The Redux `<Providers>` wrapper is in `providers.tsx` (not inside `app/`), imported by the root layout.

### API Layer

`services/api/client.ts` — Axios instance that:
- Reads `EXPO_PUBLIC_API_URL` as `baseURL`
- Injects `Authorization: Bearer <token>` from AsyncStorage on every request
- Clears tokens and logs on 401 responses
- Logs all requests/responses (last 50 stored in AsyncStorage via a network logger)

Service files (`services/authService.ts`, etc.) call `client` and return typed data. Thunks call services and dispatch to slices.

### Screens vs. Pages

`app/(tabs|auth)/*.tsx` files are thin Expo Router pages — they import and render from `screens/`. Business logic lives in `screens/`, not in `app/`.

---

## Coding Rules (from copilot-instructions.md)

### TypeScript
- **Strict mode on** — no `any` unless absolutely unavoidable.
- All component props, function parameters, and return types must be explicitly typed.
- Use `interface` for object shapes; `type` for unions/aliases.

### Naming
| Thing | Convention |
|---|---|
| Component files | `PascalCase.tsx` |
| Utility/service files | `camelCase.ts` |
| Constants | `UPPER_SNAKE_CASE` |
| Redux slices/selectors | `<feature>Slice.ts` / `<feature>Selectors.ts` |

### Imports — ordered in this sequence, separated by a blank line:
1. React & React Native
2. Third-party libraries
3. Redux (slices, thunks, selectors)
4. Types
5. Services
6. Utils & constants
7. Components

**No relative imports across feature boundaries.** Use the `@/*` path alias (maps to the project root).

```typescript
// ❌ import { UserCard } from '../../../components/cards/UserCard';
// ✅ import { UserCard } from '@/components/cards/UserCard';
```

### Components
- Functional components with hooks only — no class components.
- Define props `interface` before the component.
- Hooks at the top, effects grouped, handlers defined in component body.
- Memoize expensive list items with `React.memo`.
- Never pass JSX as inline arrow functions in `onPress` — extract to a named handler.

### Redux patterns
- Slices: synchronous reducers + `extraReducers` for thunk lifecycle.
- Thunks: typed with `createAsyncThunk<ReturnType, ArgType, { rejectValue: string }>`.
- Components access state only via selectors, never directly from `state.auth.x`.

### Styling
- `StyleSheet.create` only — no inline style objects.

---

## Feature Development Workflow

When adding a new feature, follow this order:
1. Define TypeScript types in `types/`
2. Create Redux slice + thunks + selectors
3. Implement API service method
4. Build reusable components in `components/`
5. Build the screen in `screens/`
6. Wire up the Expo Router page in `app/`
7. Write tests (component + Redux)

---

## What's Implemented vs. Planned

| Area | Status |
|---|---|
| Auth (login, register, logout, refresh) | Implemented |
| Home dashboard (menu cards) | Implemented |
| Tab navigation structure | Implemented |
| Game screens (daily-quiz, level-quiz, mini-game, quick-calculate) | Shells only |
| Stats, Leaderboard, Settings screens | Shells only |
| Social login (Google / Facebook) | Stubs — not functional |
| Game Redux slices | Not created yet |

Design specs for backend features are in `docs/01_Design/BE/sub_functions/`.
