import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  CurrentOperation,
  FinalStats,
  GamePhase,
  QuickCalculateState,
  SessionStats,
} from "@/types/quickCalculate";
import {
  endSessionThunk,
  getNextOperationThunk,
  reportTimeoutThunk,
  startSessionThunk,
  submitAnswerThunk,
} from "@/redux/thunks/quickCalculateThunks";

const initialState: QuickCalculateState = {
  sessionId: null,
  startedAt: null,
  gamePhase: "idle",
  currentOperation: null,
  sessionStats: null,
  lastAnswerResult: null,
  sessionResult: null,
  isLoading: false,
  error: null,
  maxStreak: 0,
  sessionServerEnded: false,
};

function buildFinalStats(
  stats: SessionStats,
  maxStreak: number,
  startedAt: string | null,
): FinalStats {
  const total = stats.questions_answered;
  const accuracy =
    total > 0 ? Math.round((stats.correct_count / total) * 1000) / 10 : 0;
  const durationSeconds = startedAt
    ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    : 0;
  return {
    correct_count: stats.correct_count,
    wrong_count: stats.wrong_count,
    questions_answered: total,
    accuracy_percent: accuracy,
    max_streak: maxStreak,
    max_ramp_level: 0,
    duration_seconds: durationSeconds,
  };
}

const quickCalculateSlice = createSlice({
  name: "quickCalculate",
  initialState,
  reducers: {
    setGamePhase(state, action: PayloadAction<GamePhase>) {
      state.gamePhase = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetGame() {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // ── SF01: Start Session ────────────────────────────────────────────────
    builder
      .addCase(startSessionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.gamePhase = "loading_session";
      })
      .addCase(startSessionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessionId = action.payload.session_id;
        state.startedAt = action.payload.started_at;
        state.gamePhase = "loading_question";
      })
      .addCase(startSessionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to start session";
        state.gamePhase = "idle";
      });

    // ── SF02: Get Next Operation ───────────────────────────────────────────
    builder
      .addCase(getNextOperationThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.gamePhase = "loading_question";
        state.lastAnswerResult = null;
      })
      .addCase(getNextOperationThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const op = action.payload;
        const operation: CurrentOperation = {
          operationId: op.operation_id,
          questionId: op.question_id,
          questionIndex: op.question_index,
          content: op.content,
          timeLimit: op.time_limit,
          generatedAt: op.generated_at,
        };
        state.currentOperation = operation;
        state.gamePhase = "playing";
      })
      .addCase(getNextOperationThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to load question";
        state.gamePhase = "idle";
      });

    // ── SF03: Report Timeout ───────────────────────────────────────────────
    builder
      .addCase(reportTimeoutThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reportTimeoutThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.sessionStats = data.session_stats;
        state.lastAnswerResult = {
          isCorrect: false,
          correctAnswer: data.correct_answer,
          userAnswer: NaN,
          consecutiveCorrect: 0,
        };
        // Server already ended the session on timeout (max_errors=1)
        state.sessionServerEnded = true;
        state.sessionResult = {
          endReason: data.end_reason ?? "max_errors",
          finalScore: data.session_stats.correct_count,
          stats: buildFinalStats(data.session_stats, state.maxStreak, state.startedAt),
          endedAt: new Date().toISOString(),
        };
        state.gamePhase = "feedback_timeout";
      })
      .addCase(reportTimeoutThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to report timeout";
      });

    // ── SF04+SF05: Submit Answer ───────────────────────────────────────────
    builder
      .addCase(submitAnswerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitAnswerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;

        // Track max streak across all correct answers
        if (data.consecutive_correct > state.maxStreak) {
          state.maxStreak = data.consecutive_correct;
        }

        state.sessionStats = data.session_stats;
        state.lastAnswerResult = {
          isCorrect: data.is_correct,
          correctAnswer: data.correct_answer,
          userAnswer: data.user_answer,
          consecutiveCorrect: data.consecutive_correct,
        };

        if (!data.is_correct) {
          // Server auto-ends session on any wrong answer (max_errors=1).
          // Build the result here so we never need to call endSessionThunk.
          state.sessionServerEnded = true;
          state.sessionResult = {
            endReason: data.end_reason ?? "max_errors",
            finalScore: data.session_stats.correct_count,
            stats: buildFinalStats(
              data.session_stats,
              state.maxStreak,
              state.startedAt,
            ),
            endedAt: new Date().toISOString(),
          };
        }

        state.gamePhase = data.is_correct ? "feedback_correct" : "feedback_wrong";
      })
      .addCase(submitAnswerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to submit answer";
      });

    // ── SF07: End Session (manual quit only) ──────────────────────────────
    builder
      .addCase(endSessionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(endSessionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.sessionResult = {
          endReason: data.end_reason,
          finalScore: data.final_score,
          stats: data.stats,
          endedAt: data.ended_at,
        };
        state.gamePhase = "ended";
      })
      .addCase(endSessionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to end session";
        state.gamePhase = "ended";
      });
  },
});

export const { setGamePhase, clearError, resetGame } =
  quickCalculateSlice.actions;

export default quickCalculateSlice.reducer;
