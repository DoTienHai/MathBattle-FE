import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch } from "@/redux/store";
import {
  selectCurrentOperation,
  selectError,
  selectGamePhase,
  selectIsLoading,
  selectLastAnswerResult,
  selectSessionId,
  selectSessionResult,
  selectSessionServerEnded,
  selectSessionStats,
} from "@/redux/selectors/quickCalculateSelectors";
import { resetGame } from "@/redux/slices/quickCalculateSlice";
import {
  endSessionThunk,
  getNextOperationThunk,
  reportTimeoutThunk,
  startSessionThunk,
  submitAnswerThunk,
} from "@/redux/thunks/quickCalculateThunks";

// ─── Constants ────────────────────────────────────────────────────────────────

const FEEDBACK_DURATION_MS = 1200;
const ACCENT = "#10B981";
const DANGER = "#EF4444";
const WARNING = "#F59E0B";
const BG = "#F0F4FF";

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CountdownBarProps {
  timeLimit: number;
  onExpire: () => void;
  running: boolean;
}

function CountdownBar({ timeLimit, onExpire, running }: CountdownBarProps) {
  const progress = useRef(new Animated.Value(1)).current;
  const hasExpired = useRef(false);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    progress.setValue(1);
    hasExpired.current = false;

    if (!running) return;

    animRef.current = Animated.timing(progress, {
      toValue: 0,
      duration: timeLimit * 1000,
      useNativeDriver: false,
    });

    animRef.current.start(({ finished }) => {
      if (finished && !hasExpired.current) {
        hasExpired.current = true;
        onExpire();
      }
    });

    return () => {
      animRef.current?.stop();
    };
  }, [timeLimit, running]);

  const barColor = progress.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: [DANGER, WARNING, ACCENT, ACCENT],
  });

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerTrack}>
        <Animated.View
          style={[
            styles.timerFill,
            { flex: progress as any, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function QuickCalculateScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const gamePhase = useSelector(selectGamePhase);
  const sessionId = useSelector(selectSessionId);
  const currentOperation = useSelector(selectCurrentOperation);
  const sessionStats = useSelector(selectSessionStats);
  const lastAnswerResult = useSelector(selectLastAnswerResult);
  const sessionResult = useSelector(selectSessionResult);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const sessionServerEnded = useSelector(selectSessionServerEnded);

  const [answer, setAnswer] = useState("");
  const inputRef = useRef<TextInput>(null);
  const timerRunning = gamePhase === "playing";

  // ── Focus input when question loads ──────────────────────────────────────
  useEffect(() => {
    if (gamePhase === "playing") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [gamePhase, currentOperation?.operationId]);

  // ── After feedback, load next question or transition to ended ────────────
  useEffect(() => {
    if (gamePhase === "feedback_correct" && sessionId) {
      const t = setTimeout(() => {
        setAnswer("");
        dispatch(getNextOperationThunk(sessionId));
      }, FEEDBACK_DURATION_MS);
      return () => clearTimeout(t);
    }

    if (
      (gamePhase === "feedback_wrong" || gamePhase === "feedback_timeout") &&
      sessionId
    ) {
      const t = setTimeout(() => {
        if (sessionServerEnded) {
          // Server already ended the session (max_errors=1).
          // sessionResult was built in the slice — just transition to ended.
          dispatch({ type: "quickCalculate/setGamePhase", payload: "ended" });
        } else {
          // Manual-ended or edge case — ask server for final stats.
          dispatch(endSessionThunk({ sessionId, endReason: "max_errors" }));
        }
      }, FEEDBACK_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [gamePhase, sessionId, sessionServerEnded, dispatch]);

  // ── Reset local state when game resets ───────────────────────────────────
  useEffect(() => {
    if (gamePhase === "idle") {
      setAnswer("");
    }
  }, [gamePhase]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleStart = useCallback(async () => {
    if (isLoading) return; // guard against double-tap
    dispatch(resetGame());
    const result = await dispatch(startSessionThunk());
    if (startSessionThunk.fulfilled.match(result)) {
      dispatch(getNextOperationThunk(result.payload.session_id));
    }
  }, [isLoading, dispatch]);

  const handleSubmit = useCallback(() => {
    const trimmed = answer.trim();
    if (!trimmed || !sessionId || !currentOperation) return;
    if (isNaN(parseInt(trimmed, 10))) return;

    dispatch(
      submitAnswerThunk({
        sessionId,
        operationId: currentOperation.operationId,
        answer: trimmed,
      }),
    );
    setAnswer("");
  }, [answer, sessionId, currentOperation, dispatch]);

  const handleTimeout = useCallback(() => {
    // Don't fire if answer was already submitted (isLoading) or game already ended
    if (!sessionId || !currentOperation || isLoading || gamePhase !== "playing") return;
    dispatch(
      reportTimeoutThunk({
        sessionId,
        operationId: currentOperation.operationId,
      }),
    );
  }, [sessionId, currentOperation, isLoading, gamePhase, dispatch]);

  const handleQuit = useCallback(() => {
    if (
      sessionId &&
      gamePhase !== "idle" &&
      gamePhase !== "ended"
    ) {
      dispatch(endSessionThunk({ sessionId, endReason: "manual" }));
    } else {
      dispatch(resetGame());
      router.back();
    }
  }, [sessionId, gamePhase, dispatch, router]);

  const handlePlayAgain = useCallback(() => {
    dispatch(resetGame());
  }, [dispatch]);

  const handleNumPad = useCallback(
    (val: string) => {
      if (val === "⌫") {
        setAnswer((prev) => prev.slice(0, -1));
      } else if (val === "-") {
        setAnswer((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
      } else {
        setAnswer((prev) => (prev.length < 10 ? prev + val : prev));
      }
    },
    [],
  );

  // ─── Render helpers ────────────────────────────────────────────────────────

  function renderHeader() {
    const score = sessionStats?.correct_count ?? 0;
    const streak = sessionStats?.current_streak ?? 0;

    return (
      <View style={styles.header}>
        <View style={styles.bubbleTopRight} />
        <View style={styles.bubbleTopLeft} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleQuit}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="back-button"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          <Text style={styles.backLabel}>
            {gamePhase === "idle" || gamePhase === "ended" ? "Back" : "Quit"}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerMeta}>
          <View style={styles.headerIcon}>
            <Ionicons name="flash" size={28} color={ACCENT} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Quick Calculate</Text>
            {gamePhase !== "idle" && gamePhase !== "ended" && (
              <Text style={styles.headerSub}>
                Score: {score}  ·  🔥 {streak}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ── IDLE phase ─────────────────────────────────────────────────────────────
  if (gamePhase === "idle") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <View style={styles.centeredContent}>
          <View style={styles.introCard}>
            <Text style={styles.introEmoji}>⚡</Text>
            <Text style={styles.introTitle}>Quick Calculate</Text>
            <Text style={styles.introDesc}>
              Answer math problems as fast as you can.{"\n"}
              One wrong answer or timeout ends the game.{"\n"}
              How far can you go?
            </Text>

            <View style={styles.rulesRow}>
              <RuleChip icon="timer-outline" label="Time per question decreases" />
              <RuleChip icon="close-circle-outline" label="1 mistake = game over" />
              <RuleChip icon="trending-up-outline" label="Difficulty ramps up" />
            </View>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <TouchableOpacity
              style={[styles.startButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleStart}
              disabled={isLoading}
              activeOpacity={0.85}
              testID="start-button"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.startButtonText}>Start Game</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── LOADING phase ─────────────────────────────────────────────────────────
  if (
    gamePhase === "loading_session" ||
    (gamePhase === "loading_question" && !currentOperation)
  ) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>
            {gamePhase === "loading_session" ? "Starting session…" : "Loading question…"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── ENDED phase ───────────────────────────────────────────────────────────
  if (gamePhase === "ended") {
    const stats = sessionResult?.stats;
    const score = sessionResult?.finalScore ?? sessionStats?.correct_count ?? 0;
    const accuracy = stats?.accuracy_percent?.toFixed(1) ?? "—";
    const maxStreak = stats?.max_streak ?? 0;
    const duration = stats?.duration_seconds ?? 0;
    const endReason = sessionResult?.endReason ?? "unknown";

    const endLabel: Record<string, string> = {
      max_errors: "Wrong answer",
      time_up: "Time's up",
      manual: "You quit",
    };

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <View style={styles.centeredContent}>
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>
              {score >= 10 ? "🏆" : score >= 5 ? "⭐" : "💪"}
            </Text>
            <Text style={styles.resultTitle}>Game Over!</Text>
            <Text style={styles.resultReason}>
              {endLabel[endReason] ?? endReason}
            </Text>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreLabel}>Correct Answers</Text>
            </View>

            <View style={styles.statsGrid}>
              <StatBox label="Accuracy" value={`${accuracy}%`} />
              <StatBox label="Best Streak" value={`${maxStreak}`} />
              <StatBox
                label="Duration"
                value={`${Math.floor(duration / 60)}m ${duration % 60}s`}
              />
              <StatBox
                label="Questions"
                value={`${stats?.questions_answered ?? sessionStats?.questions_answered ?? score}`}
              />
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handlePlayAgain}
              activeOpacity={0.85}
              testID="play-again-button"
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── PLAYING + FEEDBACK phases ─────────────────────────────────────────────
  const isFeedback =
    gamePhase === "feedback_correct" ||
    gamePhase === "feedback_wrong" ||
    gamePhase === "feedback_timeout";

  const feedbackCorrect = gamePhase === "feedback_correct";
  const feedbackWrong =
    gamePhase === "feedback_wrong" || gamePhase === "feedback_timeout";

  const score = sessionStats?.correct_count ?? 0;
  const streak = sessionStats?.current_streak ?? 0;
  const questionIndex = currentOperation?.questionIndex ?? 0;
  const timeLimit = currentOperation?.timeLimit ?? 15;
  const content = currentOperation?.content ?? "";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {renderHeader()}

      <View style={styles.gameContent}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Ionicons name="checkmark-circle" size={16} color={ACCENT} />
            <Text style={styles.statPillText}>{score}</Text>
          </View>
          <Text style={styles.questionIndexText}>#{questionIndex + 1}</Text>
          <View style={styles.statPill}>
            <Ionicons name="flame" size={16} color={WARNING} />
            <Text style={[styles.statPillText, { color: WARNING }]}>{streak}</Text>
          </View>
        </View>

        {/* Countdown bar */}
        <CountdownBar
          timeLimit={timeLimit}
          onExpire={handleTimeout}
          running={timerRunning}
        />

        {/* Question card */}
        <View
          style={[
            styles.questionCard,
            feedbackCorrect && styles.questionCardCorrect,
            feedbackWrong && styles.questionCardWrong,
          ]}
        >
          {!isFeedback && (
            <Text style={styles.questionContent}>{content}</Text>
          )}

          {feedbackCorrect && lastAnswerResult && (
            <View style={styles.feedbackContent}>
              <Ionicons name="checkmark-circle" size={56} color={ACCENT} />
              <Text style={[styles.feedbackTitle, { color: ACCENT }]}>
                Correct!
              </Text>
              <Text style={styles.feedbackAnswer}>
                {lastAnswerResult.correctAnswer}
              </Text>
            </View>
          )}

          {feedbackWrong && lastAnswerResult && (
            <View style={styles.feedbackContent}>
              <Ionicons name="close-circle" size={56} color={DANGER} />
              <Text style={[styles.feedbackTitle, { color: DANGER }]}>
                {gamePhase === "feedback_timeout" ? "Time's Up!" : "Wrong!"}
              </Text>
              <Text style={styles.feedbackSubtitle}>Correct answer:</Text>
              <Text style={[styles.feedbackAnswer, { color: DANGER }]}>
                {lastAnswerResult.correctAnswer}
              </Text>
            </View>
          )}
        </View>

        {/* Answer input + submit */}
        {!isFeedback && (
          <>
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="?"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={answer}
                onChangeText={setAnswer}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
                editable={gamePhase === "playing"}
                testID="answer-input"
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!answer.trim() || isLoading) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!answer.trim() || isLoading}
                activeOpacity={0.85}
                testID="submit-button"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Number pad */}
            <View style={styles.numPad}>
              {[["7", "8", "9"], ["4", "5", "6"], ["1", "2", "3"], ["-", "0", "⌫"]].map(
                (row, ri) => (
                  <View key={ri} style={styles.numPadRow}>
                    {row.map((key) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.numKey,
                          key === "⌫" && styles.numKeyDelete,
                          key === "-" && styles.numKeySign,
                        ]}
                        onPress={() => handleNumPad(key)}
                        activeOpacity={0.7}
                        testID={`num-key-${key}`}
                      >
                        <Text
                          style={[
                            styles.numKeyText,
                            key === "⌫" && styles.numKeyDeleteText,
                          ]}
                        >
                          {key}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ),
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function RuleChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.ruleChip}>
      <Ionicons name={icon as any} size={15} color={ACCENT} />
      <Text style={styles.ruleChipText}>{label}</Text>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statBoxValue}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // Header
  header: {
    backgroundColor: "#0D1B2A",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    overflow: "hidden",
  },
  bubbleTopRight: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(16,185,129,0.12)",
    top: -35,
    right: -25,
  },
  bubbleTopLeft: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16,185,129,0.08)",
    bottom: -25,
    left: 50,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    alignSelf: "flex-start",
    gap: 4,
  },
  backLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  // Shared centered layout
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // Loading
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Intro card
  introCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  introEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0D1B2A",
    marginBottom: 10,
  },
  introDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  rulesRow: {
    width: "100%",
    gap: 8,
    marginBottom: 24,
  },
  ruleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  ruleChipText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 13,
    color: DANGER,
    marginBottom: 12,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    justifyContent: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // Game content
  gameContent: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statPillText: {
    fontSize: 15,
    fontWeight: "700",
    color: ACCENT,
  },
  questionIndexText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600",
  },

  // Countdown bar
  timerContainer: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  timerTrack: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    flexDirection: "row",
  },
  timerFill: {
    borderRadius: 5,
  },

  // Question card
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  questionCardCorrect: {
    borderColor: ACCENT,
    backgroundColor: "#F0FDF4",
  },
  questionCardWrong: {
    borderColor: DANGER,
    backgroundColor: "#FEF2F2",
  },
  questionContent: {
    fontSize: 42,
    fontWeight: "900",
    color: "#0D1B2A",
    letterSpacing: 1,
    textAlign: "center",
  },
  feedbackContent: {
    alignItems: "center",
    gap: 6,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  feedbackSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  feedbackAnswer: {
    fontSize: 36,
    fontWeight: "900",
    color: ACCENT,
  },

  // Input row
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: "700",
    color: "#0D1B2A",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    width: 58,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },

  // Number pad
  numPad: {
    gap: 8,
  },
  numPadRow: {
    flexDirection: "row",
    gap: 8,
  },
  numKey: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  numKeyDelete: {
    backgroundColor: "#FEF2F2",
  },
  numKeySign: {
    backgroundColor: "#F0F9FF",
  },
  numKeyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D1B2A",
  },
  numKeyDeleteText: {
    color: DANGER,
  },

  // Result card
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  resultEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0D1B2A",
  },
  resultReason: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 20,
    marginTop: 4,
  },
  scoreBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 52,
    fontWeight: "900",
    color: ACCENT,
    lineHeight: 58,
  },
  scoreLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0D1B2A",
  },
  statBoxLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
});
