import type { RootState } from "@/redux/store";

export const selectGamePhase = (state: RootState) =>
  state.quickCalculate.gamePhase;

export const selectSessionId = (state: RootState) =>
  state.quickCalculate.sessionId;

export const selectCurrentOperation = (state: RootState) =>
  state.quickCalculate.currentOperation;

export const selectSessionStats = (state: RootState) =>
  state.quickCalculate.sessionStats;

export const selectLastAnswerResult = (state: RootState) =>
  state.quickCalculate.lastAnswerResult;

export const selectSessionResult = (state: RootState) =>
  state.quickCalculate.sessionResult;

export const selectIsLoading = (state: RootState) =>
  state.quickCalculate.isLoading;

export const selectError = (state: RootState) => state.quickCalculate.error;

export const selectIsPlaying = (state: RootState) =>
  state.quickCalculate.gamePhase === "playing";

export const selectIsSessionEnded = (state: RootState) =>
  state.quickCalculate.gamePhase === "ended";

export const selectSessionServerEnded = (state: RootState) =>
  state.quickCalculate.sessionServerEnded;
