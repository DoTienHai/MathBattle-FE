---
name: MathBattle-FE Project Architecture
description: "System design, architecture, and project workflow documentation for React Native mobile app"
---

# 🧠 AGENTS.md: Project Brain

Câu hỏi: **"Hệ thống này hoạt động như thế nào?"** ← File này trả lời.

---

## System Architecture

### Overview
**MathBattle-FE** là một React Native mobile application cho nền tảng học toán tương tác. Hệ thống được thiết kế:
- **Cross-platform** (iOS & Android từ một codebase)
- **Component-based** (reusable UI components)
- **Type-safe** (TypeScript)
- **State management** (Redux + async thunks)
- **Testable** (Jest + React Native Testing Library)

### Technology Stack
```
┌──────────────────────────────┐
│    React Native (Framework)  │
├──────────────────────────────┤
│   TypeScript (Type Safety)   │
├──────────────────────────────┤
│   Redux Toolkit + RTK Query  │
│   (State Management)         │
├──────────────────────────────┤
│   React Navigation           │
│   (Navigation & Routing)     │
├──────────────────────────────┤
│   Axios / Fetch              │
│   (HTTP Client)              │
├──────────────────────────────┤
│   Jest + Testing Library     │
│   (Testing)                  │
├──────────────────────────────┤
│   Firebase (Analytics)       │
├──────────────────────────────┤
│   Native Modules (optional)  │
│   (Platform-specific code)   │
└──────────────────────────────┘
```

---

## Project Structure & Why

```
MathBattle-FE/
│
├── app/                        ← Application source code
│   ├── screens/               ← Screen components (page-level)
│   │   ├── Auth/              (Login, Register, Forgot Password)
│   │   ├── Home/              (Dashboard, main game screen)
│   │   ├── Game/              (Game play, battles)
│   │   ├── Ranking/           (Leaderboard, achievements)
│   │   └── Profile/           (User profile, customization)
│   │
│   ├── components/            ← Reusable UI components
│   │   ├── buttons/           (CustomButton, IconButton)
│   │   ├── cards/             (GameCard, AchievementCard)
│   │   ├── modals/            (ConfirmModal, RewardModal)
│   │   ├── inputs/            (TextInput, PasswordInput)
│   │   └── common/            (Header, Footer, Loaders)
│   │
│   ├── redux/                 ← State management
│   │   ├── slices/            (authSlice, gameSlice, userSlice)
│   │   ├── thunks/            (async actions)
│   │   ├── selectors/         (derived state selectors)
│   │   └── store.ts           (Redux store configuration)
│   │
│   ├── services/              ← API communication
│   │   ├── api/               (API client setup)
│   │   ├── gameService.ts     (Game-related API calls)
│   │   ├── userService.ts     (User-related API calls)
│   │   ├── authService.ts     (Authentication API calls)
│   │   └── rankingService.ts  (Ranking/leaderboard calls)
│   │
│   ├── hooks/                 ← Custom React hooks
│   │   ├── useGame.ts         (Game logic hook)
│   │   ├── useAuth.ts         (Authentication hook)
│   │   ├── useTimer.ts        (Timer/countdown hook)
│   │   └── useApi.ts          (API call hook with loading/error)
│   │
│   ├── navigation/            ← Navigation setup
│   │   ├── RootNavigator.tsx  (Main navigation structure)
│   │   ├── AuthNavigator.tsx  (Auth flow navigation)
│   │   └── AppNavigator.tsx   (Main app navigation)
│   │
│   ├── types/                 ← TypeScript types & interfaces
│   │   ├── models.ts          (User, Game, Score types)
│   │   ├── api.ts             (API request/response types)
│   │   └── navigation.ts      (Navigation param types)
│   │
│   ├── constants/             ← App-wide constants
│   │   ├── colors.ts          (Color palette)
│   │   ├── strings.ts         (i18n/localization strings)
│   │   └── config.ts          (API URLs, timeouts)
│   │
│   ├── utils/                 ← Helper functions
│   │   ├── storage.ts         (AsyncStorage helpers)
│   │   ├── validators.ts      (Form validation)
│   │   └── formatters.ts      (Date, number formatting)
│   │
│   ├── assets/                ← Static assets
│   │   ├── images/            (PNG, JPG, SVG)
│   │   ├── animations/        (Lottie JSON files)
│   │   └── fonts/             (Custom fonts)
│   │
│   └── App.tsx               ← Entry point
│
├── tests/                     ← Test suite
│   ├── __tests__/screens/     (Screen tests)
│   ├── __tests__/components/  (Component tests)
│   ├── __tests__/redux/       (Redux tests)
│   ├── __tests__/hooks/       (Hooks tests)
│   └── __tests__/services/    (Service tests)
│
├── docs/                      ← Documentation
│   ├── 00_Research/           (Background research)
│   ├── 01_Design/             (Feature specs & wireframes)
│   └── 98_Tools/              (Development utilities)
│
├── index.js                   ← App entry point
├── app.json                   ← Expo/RN config
└── copilot-instructions.md    ← Coding rules (HOW file)
```

**Tại sao cấu trúc này?**
- `screens/` → Dễ maintain khi có nhiều màn hình phức tạp
- `components/` → Reusable components, consistent UI/UX
- `redux/` → Centralized state management, debug-friendly
- `services/` → Tách API logic khỏi components
- `hooks/` → Share logic giữa các components
- `types/` → Single source of truth for data types

---

## Data Flow

```
User Interaction (Button press, form submit)
    ↓
Component triggers Redux Action/Thunk
    ↓
├─→ RTK Query / Axios calls API
│   ├─→ HTTP Request to Backend
│   ├─→ Validation via TypeScript
│   └─→ Response handling
    ↓
Redux Slice updates state
    ↓
Component re-renders via selectors
    ↓
AsyncStorage persists state (if needed)
    ↓
UI Update
```

---

## Development Workflow (Feature-based)

```
1. Design Phase (docs/01_Design/)
   └─→ Create wireframes, user flows
   ↓
2. Create Type Definitions
   └─→ Add types in app/types/models.ts
   └─→ Add API response types in app/types/api.ts
   ↓
3. Build Redux Infrastructure
   └─→ Create slice in app/redux/slices/
   └─→ Create thunks in app/redux/thunks/
   └─→ Create selectors in app/redux/selectors/
   ↓
4. Implement API Service
   └─→ Create service in app/services/
   └─→ Add API client setup
   ↓
5. Build UI Components
   └─→ Reusable components in app/components/
   └─→ Screen in app/screens/
   └─→ Connect to Redux via hooks/selectors
   ↓
6. Create Custom Hook (if needed)
   └─→ Hook in app/hooks/
   └─→ Simplify component logic
   ↓
7. Add Navigation
   └─→ Add route in app/navigation/
   └─→ Wire up params and stack navigation
   ↓
8. Write Tests
   └─→ Component tests in tests/__tests__/components/
   └─→ Redux tests in tests/__tests__/redux/
   └─→ Integration tests
   ↓
9. Test on Device/Simulator
   └─→ iOS Simulator
   └─→ Android Emulator
   ↓
10. Deploy
```

---

## Key Design Decisions

| Decision | Why | Trade-off |
|----------|-----|-----------|
| **TypeScript** | Type safety, IDE support, early errors | More verbose code |
| **Redux + RTK** | Predictable state, time-travel debug | Learning curve |
| **React Navigation** | Best-in-class mobile navigation | Limited customization |
| **Component-based** | Reusable, testable, maintainable | More component files |
| **Feature-based routing** | Easy to understand | More navigation setup |
| **Custom hooks** | Shareable logic | Hook dependencies |

---

## Screen Overview

| Screen | Purpose | Features |
|--------|---------|----------|
| **AuthScreen** | Login/Register | Email/password, social login, validation |
| **HomeScreen** | Dashboard | Daily quest, quick stats, navigation |
| **GameScreen** | Game play | Problem display, timer, answer input |
| **BattleScreen** | Live PvP | Real-time opponent, scoring, countdown |
| **RankingScreen** | Leaderboard | Top 100, filters, badges |
| **ProfileScreen** | User profile | Avatar, stats, settings, customization |
| **SettingsScreen** | App settings | Sound, language, privacy, account |

---

## Component Hierarchy Example

```
App
├── NavigationContainer
│   ├── AuthNavigator
│   │   ├── LoginScreen
│   │   ├── RegisterScreen
│   │   └── ForgotPasswordScreen
│   │
│   └── AppNavigator (Tab Navigator)
│       ├── HomeStack
│       │   ├── HomeScreen
│       │   │   ├── DailyQuestCard
│       │   │   ├── RecentGamesCard
│       │   │   └── StatisticsCard
│       │   └── QuestDetailScreen
│       │
│       ├── GameStack
│       │   ├── GameListScreen
│       │   └── GamePlayScreen
│       │       ├── ProblemDisplay
│       │       ├── TimerWidget
│       │       └── AnswerInput
│       │
│       ├── RankingStack
│       │   └── RankingScreen
│       │       ├── RankingFilters
│       │       └── RankingList
│       │           └── RankingCard
│       │
│       └── ProfileStack
│           ├── ProfileScreen
│           │   ├── AvatarDisplay
│           │   ├── StatisticsWidget
│           │   └── AchievementList
│           └── SettingsScreen
```

---

## API Integration

```
const gameService = {
  // Get list of games
  listGames: async (skip: number, limit: number) → Game[]
  
  // Get single game
  getGame: async (gameId: number) → Game
  
  // Start a new game
  startGame: async (difficulty: string) → GameSession
  
  // Submit answer
  submitAnswer: async (gameId: number, answer: string) → AnswerResult
  
  // Get leaderboard
  getLeaderboard: async (limit: number) → Ranking[]
  
  // Get user profile
  getUserProfile: async () → User
  
  // Update user profile
  updateProfile: async (updates: UserUpdate) → User
}
```

---

## Performance Considerations

1. **Image Optimization**
   - Use WebP format where possible
   - Lazy load images for lists
   - Cache downloaded images

2. **Navigation Performance**
   - Use Tab Navigator for main sections
   - Lazy load screen components
   - Avoid deep stack nesting

3. **State Management**
   - Use selectors for derived state
   - Normalize Redux state
   - Use RTK Query for API caching

4. **Component Rendering**
   - Use React.memo for expensive components
   - Virtualize long lists
   - Avoid inline function definitions

---

## Testing Strategy

| Test Type | Purpose | Tools |
|-----------|---------|-------|
| **Unit** | Test components in isolation | Jest, RTL |
| **Integration** | Test components + Redux | Jest, RTL |
| **E2E** | Test full user flows | Detox (native) |
| **Redux** | Test actions/reducers | Jest |
| **Hooks** | Test custom hooks | React Hooks Testing Library |

---

## When to Use Each Tool/Agent

| Task | Use | Because |
|------|-----|---------|
| Create screen | `/UI/Screen Development` | Needs navigation, redux connection |
| Build component | `/Component Development` | Reusable, needs TypeScript types |
| API integration | `/API Integration` | Needs service + Redux + error handling |
| State management | `/Redux Management` | Needs slices, thunks, selectors |
| Fix navigation | `/Navigation & Routing` | Needs screen linking, params |
| Write tests | `/Testing` | Needs mocks, fixtures, assertions |
| Optimize performance | `/Performance` | Needs profiling + optimization |

---

## Deployment Checklist

- ✅ TypeScript compilation with no errors
- ✅ All tests passing
- ✅ Bundle size optimized
- ✅ App permissions configured
- ✅ API URLs set for production
- ✅ Analytics configured
- ✅ Build signed APK/IPA
- ✅ Tested on real devices

---

**Last Updated**: May 2026  
**Status**: Planning Phase → Development Ready  
**See also**: `copilot-instructions.md` for "HOW to code"
