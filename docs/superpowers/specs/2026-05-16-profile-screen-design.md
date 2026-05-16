# Profile Screen Design

**Date**: 2026-05-16  
**Feature**: G01_F02 — User Profile (SF01 + SF02 + SF03)  
**Status**: Approved

---

## Overview

Implement the Profile tab (renamed from Stats) as a single scrollable screen combining:
- **SF01** — Basic profile info (`GET /api/v1/profile`)
- **SF02** — Personal statistics (`GET /api/v1/profile/stats`)
- **SF03** — Badges & achievements (`GET /api/v1/profile/badges`)

The existing `stats` tab is renamed to "Profile" (icon: person). The file name `app/(tabs)/stats.tsx` remains unchanged to avoid route breaking.

---

## Navigation Change

`app/(tabs)/_layout.tsx`:
- Tab `name="stats"` keeps its route name
- `title` changes from `"Stats"` → `"Profile"`
- Icon changes from `bar-chart / bar-chart-outline` → `person / person-outline`

---

## Screen Layout

Single `ScrollView` (vertical), no inner tabs:

```
+----------------------------------+
|  HEADER (blue bg, bubble deco)   |
|  [ AV ]  @username   Level 5     |
|  John Doe       Member since ... |
+----------------------------------+
|  STATS GRID (3 cols × 2 rows)    |
|  [ ELO 1250 ] [RANK #42] [65%]  |
|  [STREAK 5d ] [BEST 12d] [LVL 8]|
+----------------------------------+
|  BADGES  (2 earned)              |
|  [FV]  [HS]  →scroll horizontal→ |
+----------------------------------+
```

---

## Redux Architecture (Approach A — 1 slice, 3 thunks)

### State shape — `redux/slices/profileSlice.ts`

```typescript
interface ProfileState {
  basicInfo: BasicProfileInfo | null;
  stats: PersonalStats | null;
  badges: UserBadges | null;
  loading: {
    basicInfo: boolean;
    stats: boolean;
    badges: boolean;
  };
  error: {
    basicInfo: string | null;
    stats: string | null;
    badges: string | null;
  };
}
```

Each section has independent `loading` and `error` flags — a failed stats call does not block the profile header from rendering.

### Thunks — `redux/thunks/profileThunks.ts`

| Thunk | Endpoint |
|---|---|
| `fetchBasicProfile` | `GET /api/v1/profile` |
| `fetchPersonalStats` | `GET /api/v1/profile/stats` |
| `fetchUserBadges` | `GET /api/v1/profile/badges?limit=50&offset=0` |

All three are dispatched in parallel on `ProfileScreen` mount via `Promise.all`.

### Selectors — `redux/selectors/profileSelectors.ts`

```
selectBasicInfo(state)
selectPersonalStats(state)
selectUserBadges(state)
selectProfileLoading(state)   // { basicInfo, stats, badges }
selectProfileError(state)     // { basicInfo, stats, badges }
```

---

## Types — `types/profile.ts`

```typescript
export interface BasicProfileInfo {
  userId: number;
  username: string;
  fullName: string | null;
  currentLevel: number;
  joinDate: string;
}

export interface PersonalStats {
  elo: number;
  currentStreak: number;
  longestStreak: number;
  winRate: number;       // 0.0–1.0 from API, displayed as %
  globalRank: number;
  levelsCompleted: number;
}

export interface Badge {
  badgeId: number;
  name: string;
  description: string;
  iconUrl: string;
  category: string;
  earnedAt: string;
}

export interface UserBadges {
  total: number;
  badges: Badge[];
}
```

---

## API Service — `services/profileService.ts`

Three independent functions, each calling `client` and returning typed data from `response.data.data`. Errors throw with the `error.code` string from the BE response envelope.

---

## UI Components

### `screens/profile/ProfileScreen.tsx`
- On mount: dispatches all 3 thunks in parallel
- Renders `ProfileHeader`, `StatsGrid`, `BadgesSection` inside a `ScrollView`
- Pull-to-refresh re-dispatches all 3 thunks

### `components/profile/ProfileHeader.tsx`
- Props: `BasicProfileInfo | null`, `isLoading: boolean`
- Avatar: blue circle with 2-letter initials from `fullName` or `username`
- Displays: `@username`, `Level X`, `fullName` (if non-null), join date as `"Member since MMM YYYY"`
- Loading state: skeleton placeholders (grey rectangles)

### `components/profile/StatsGrid.tsx`
- Props: `PersonalStats | null`, `isLoading: boolean`
- 6 cards in a 3-column grid using `StyleSheet` flex layout
- `winRate` displayed as `"65%"` (multiply by 100, round)
- `globalRank` displayed as `"#42"`
- `currentStreak` / `longestStreak` displayed as `"5 days"` / `"12 days"`
- Loading state: 6 skeleton cards

### `components/profile/BadgesSection.tsx`
- Props: `UserBadges | null`, `isLoading: boolean`
- Section header: `"Badges (X earned)"`
- Horizontal `FlatList`, `keyExtractor` = `badgeId.toString()`
- Each badge item: coloured circle with first letter of badge name + name below
  - `icon_url` is stored but not used in MVP (CDN not yet available)
- Tap → `Modal` showing name, description, earned date
- Empty state: `"No badges yet — start playing to earn your first!"`
- Loading state: 3 skeleton badge circles

---

## Data Flow

```
ProfileScreen mount
  → Promise.all([
      dispatch(fetchBasicProfile()),
      dispatch(fetchPersonalStats()),
      dispatch(fetchUserBadges()),
    ])
  → profileSlice extraReducers update state
  → selectors feed ProfileHeader, StatsGrid, BadgesSection
```

---

## Error Handling

- Each section shows its own inline error message if its thunk rejects
- Other sections are unaffected
- Pull-to-refresh retries all 3 thunks

---

## Files Summary

| File | Action |
|---|---|
| `types/profile.ts` | Create |
| `services/profileService.ts` | Create |
| `redux/slices/profileSlice.ts` | Create |
| `redux/thunks/profileThunks.ts` | Create |
| `redux/selectors/profileSelectors.ts` | Create |
| `screens/profile/ProfileScreen.tsx` | Create |
| `components/profile/ProfileHeader.tsx` | Create |
| `components/profile/StatsGrid.tsx` | Create |
| `components/profile/BadgesSection.tsx` | Create |
| `app/(tabs)/stats.tsx` | Modify — render ProfileScreen |
| `app/(tabs)/_layout.tsx` | Modify — rename tab to Profile, change icon |

---

## Out of Scope (MVP)

- Locked/unearned badges with progress indicators
- Badge category filter
- Public profile (`GET /api/v1/users/{username}/profile`)
- Avatar image upload
- Badge showcase (pin 3 badges)
- Caching global rank in Redis
