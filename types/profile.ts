import type { ApiResponse } from "@/types/auth";

// ─── Camelcase FE types (Redux state) ─────────────────────────────────────────

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
  winRate: number;
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

// ─── Snake_case API data shapes (matching BE JSON) ────────────────────────────

export interface BasicProfileData {
  user_id: number;
  username: string;
  full_name: string | null;
  current_level: number;
  join_date: string;
}

export interface PersonalStatsData {
  elo: number;
  current_streak: number;
  longest_streak: number;
  win_rate: number;
  global_rank: number;
  levels_completed: number;
}

export interface BadgeItem {
  badge_id: number;
  name: string;
  description: string;
  icon_url: string;
  category: string;
  earned_at: string;
}

export interface UserBadgesData {
  total: number;
  badges: BadgeItem[];
}

export type BasicProfileResponse = ApiResponse<BasicProfileData>;
export type PersonalStatsResponse = ApiResponse<PersonalStatsData>;
export type UserBadgesResponse = ApiResponse<UserBadgesData>;

// ─── Redux State ──────────────────────────────────────────────────────────────

export interface ProfileState {
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
