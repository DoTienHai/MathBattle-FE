import type { ApiResponse } from "@/types/auth";

// ─── Session ──────────────────────────────────────────────────────────────────

export interface InitialRampConfig {
  ramp_level: number;
  time_limit_per_question: number;
  max_questions: number | null;
  max_errors_allowed: number;
}

export interface StartSessionData {
  session_id: string;
  initial_ramp_config: InitialRampConfig;
  started_at: string;
}

export type StartSessionResponse = ApiResponse<StartSessionData>;

// ─── Next Operation (SF02) ────────────────────────────────────────────────────

export interface NextOperationData {
  operation_id: string;
  question_id: string;
  question_index: number;
  content: string;
  time_limit: number;
  generated_at: string;
}

export type NextOperationResponse = ApiResponse<NextOperationData>;

// ─── Timeout (SF03) ───────────────────────────────────────────────────────────

export interface SessionStats {
  correct_count: number;
  wrong_count: number;
  questions_answered: number;
  current_streak: number;
}

export interface TimeoutData {
  operation_id: string;
  timed_out: boolean;
  correct_answer: number;
  session_stats: SessionStats;
  session_ended: boolean;
  end_reason: string;
}

export interface TimeoutRequest {
  operation_id: string;
}

export type TimeoutResponse = ApiResponse<TimeoutData>;

// ─── Submit Answer (SF04 + SF05) ──────────────────────────────────────────────

export interface SubmitAnswerRequest {
  operation_id: string;
  answer: string;
  submitted_at: string;
}

export interface SubmitAnswerData {
  operation_id: string;
  received: boolean;
  server_received_at: string;
  is_correct: boolean;
  correct_answer: number;
  user_answer: number;
  consecutive_correct: number;
  session_stats: SessionStats;
  session_ended?: boolean;
  end_reason?: string;
}

export type SubmitAnswerResponse = ApiResponse<SubmitAnswerData>;

// ─── End Session (SF07) ───────────────────────────────────────────────────────

export type EndReason = "time_up" | "max_questions" | "max_errors" | "manual";

export interface EndSessionRequest {
  end_reason: EndReason;
}

export interface FinalStats {
  correct_count: number;
  wrong_count: number;
  questions_answered: number;
  accuracy_percent: number;
  max_streak: number;
  max_ramp_level: number;
  duration_seconds: number;
}

export interface EndSessionData {
  session_id: string;
  end_reason: EndReason;
  final_score: number;
  stats: FinalStats;
  ended_at: string;
}

export type EndSessionResponse = ApiResponse<EndSessionData>;

// ─── Redux State ──────────────────────────────────────────────────────────────

export type GamePhase =
  | "idle"
  | "loading_session"
  | "loading_question"
  | "playing"
  | "feedback_correct"
  | "feedback_wrong"
  | "feedback_timeout"
  | "ended";

export interface CurrentOperation {
  operationId: string;
  questionId: string;
  questionIndex: number;
  content: string;
  timeLimit: number;
  generatedAt: string;
}

export interface LastAnswerResult {
  isCorrect: boolean;
  correctAnswer: number;
  userAnswer: number;
  consecutiveCorrect: number;
}

export interface SessionResult {
  endReason: string;
  finalScore: number;
  stats: FinalStats;
  endedAt: string;
}

export interface QuickCalculateState {
  sessionId: string | null;
  startedAt: string | null;
  gamePhase: GamePhase;
  currentOperation: CurrentOperation | null;
  sessionStats: SessionStats | null;
  lastAnswerResult: LastAnswerResult | null;
  sessionResult: SessionResult | null;
  isLoading: boolean;
  error: string | null;
  maxStreak: number;
  sessionServerEnded: boolean;
}
