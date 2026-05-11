import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Problem {
  question: string;
  answer: number;
}

function generateProblem(): Problem {
  const ops = ["+", "-", "*"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number;
  let b: number;
  let answer: number;

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a - b;
      break;
    case "*":
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      answer = a * b;
      break;
  }

  return { question: `${a} ${op} ${b} = ?`, answer };
}

export default function QuickCalculateScreen() {
  const router = useRouter();
  const [problem, setProblem] = useState<Problem>(generateProblem);
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = useCallback(() => {
    const userAnswer = parseInt(input.trim(), 10);
    if (isNaN(userAnswer)) return;

    if (userAnswer === problem.answer) {
      setFeedback("correct");
      setStreak((s) => s + 1);
    } else {
      setFeedback("wrong");
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setProblem(generateProblem());
      setInput("");
      inputRef.current?.focus();
    }, 700);
  }, [input, problem.answer]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.bubbleTopRight} />
        <View style={styles.bubbleTopLeft} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="back-button"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: "#D1FAE5" }]}>
            <Ionicons name="flash" size={32} color="#059669" />
          </View>
          <Text style={styles.headerTitle}>Quick Calculate</Text>
          <Text style={styles.headerSub}>
            Speed math challenges for mental agility
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Streak badge */}
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={20} color="#F59E0B" />
          <Text style={styles.streakText}>Streak: {streak}</Text>
        </View>

        {/* Problem card */}
        <View
          style={[
            styles.problemCard,
            feedback === "correct" && styles.problemCardCorrect,
            feedback === "wrong" && styles.problemCardWrong,
          ]}
        >
          <Text style={styles.problemQuestion}>{problem.question}</Text>

          {feedback === "correct" && (
            <View style={styles.feedbackBadge}>
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              <Text style={[styles.feedbackText, { color: "#10B981" }]}>
                Correct!
              </Text>
            </View>
          )}
          {feedback === "wrong" && (
            <View style={styles.feedbackBadge}>
              <Ionicons name="close-circle" size={22} color="#EF4444" />
              <Text style={[styles.feedbackText, { color: "#EF4444" }]}>
                Answer: {problem.answer}
              </Text>
            </View>
          )}
        </View>

        {/* Input row */}
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Your answer..."
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            testID="answer-input"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.85}
            testID="submit-button"
          >
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            setStreak(0);
            setFeedback(null);
            setProblem(generateProblem());
            setInput("");
          }}
          testID="skip-button"
        >
          <Text style={styles.skipText}>Skip problem</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  header: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    overflow: "hidden",
    position: "relative",
  },
  bubbleTopRight: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: -30,
    right: -20,
  },
  bubbleTopLeft: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.10)",
    bottom: -20,
    left: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
    gap: 4,
  },
  backLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerContent: {
    alignItems: "flex-start",
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  content: {
    padding: 16,
    gap: 16,
    alignItems: "center",
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
  },
  streakText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F59E0B",
  },
  problemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  problemCardCorrect: {
    borderColor: "#10B981",
  },
  problemCardWrong: {
    borderColor: "#EF4444",
  },
  problemQuestion: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0D0D1B",
    letterSpacing: 1,
  },
  feedbackBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: "600",
    color: "#0D0D1B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: "#10B981",
    borderRadius: 14,
    width: 54,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
