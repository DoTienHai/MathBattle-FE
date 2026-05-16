import { createAsyncThunk } from "@reduxjs/toolkit";
import { quickCalculateService } from "@/services/quickCalculateService";
import type {
  EndSessionData,
  EndReason,
  NextOperationData,
  StartSessionData,
  SubmitAnswerData,
  TimeoutData,
} from "@/types/quickCalculate";

// SF01 — Start a new quick calculate session
export const startSessionThunk = createAsyncThunk<
  StartSessionData,
  void,
  { rejectValue: string }
>("quickCalculate/startSession", async (_, { rejectWithValue }) => {
  try {
    const response = await quickCalculateService.startSession();
    if (!response.success || !response.data) {
      return rejectWithValue(
        response.error?.message ?? "Failed to start session",
      );
    }
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ??
      error?.message ??
      "Failed to start session";
    return rejectWithValue(message);
  }
});

// SF02 — Fetch the next question for a session
export const getNextOperationThunk = createAsyncThunk<
  NextOperationData,
  string, // sessionId
  { rejectValue: string }
>(
  "quickCalculate/getNextOperation",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await quickCalculateService.getNextOperation(sessionId);
      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message ?? "Failed to load question",
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        error?.message ??
        "Failed to load question";
      return rejectWithValue(message);
    }
  },
);

// SF03 — Report that the timer expired for a given operation
export const reportTimeoutThunk = createAsyncThunk<
  TimeoutData,
  { sessionId: string; operationId: string },
  { rejectValue: string }
>(
  "quickCalculate/reportTimeout",
  async ({ sessionId, operationId }, { rejectWithValue }) => {
    try {
      const response = await quickCalculateService.reportTimeout(sessionId, {
        operation_id: operationId,
      });
      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message ?? "Failed to report timeout",
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        error?.message ??
        "Failed to report timeout";
      return rejectWithValue(message);
    }
  },
);

// SF04 + SF05 — Submit an answer and receive evaluation
export const submitAnswerThunk = createAsyncThunk<
  SubmitAnswerData,
  { sessionId: string; operationId: string; answer: string },
  { rejectValue: string }
>(
  "quickCalculate/submitAnswer",
  async ({ sessionId, operationId, answer }, { rejectWithValue }) => {
    try {
      const response = await quickCalculateService.submitAnswer(sessionId, {
        operation_id: operationId,
        answer,
        submitted_at: new Date().toISOString(),
      });
      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message ?? "Failed to submit answer",
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        error?.message ??
        "Failed to submit answer";
      return rejectWithValue(message);
    }
  },
);

// SF07 — End the session (manual quit or explicit end)
export const endSessionThunk = createAsyncThunk<
  EndSessionData,
  { sessionId: string; endReason: EndReason },
  { rejectValue: string }
>(
  "quickCalculate/endSession",
  async ({ sessionId, endReason }, { rejectWithValue }) => {
    try {
      const response = await quickCalculateService.endSession(sessionId, {
        end_reason: endReason,
      });
      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message ?? "Failed to end session",
        );
      }
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        error?.message ??
        "Failed to end session";
      return rejectWithValue(message);
    }
  },
);
