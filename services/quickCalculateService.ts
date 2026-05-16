import { apiClient } from "@/services/api/client";
import type {
  EndSessionRequest,
  EndSessionResponse,
  NextOperationResponse,
  StartSessionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  TimeoutRequest,
  TimeoutResponse,
} from "@/types/quickCalculate";

const BASE = "/api/v1/games/quick-calculate";

export const quickCalculateService = {
  // SF01 — Start a new session (no request body)
  async startSession(): Promise<StartSessionResponse> {
    const response = await apiClient.post<StartSessionResponse>(
      `${BASE}/sessions`,
    );
    return response.data;
  },

  // SF02 — Fetch next question
  async getNextOperation(sessionId: string): Promise<NextOperationResponse> {
    const response = await apiClient.post<NextOperationResponse>(
      `${BASE}/sessions/${sessionId}/next`,
    );
    return response.data;
  },

  // SF03 — Report timeout for current operation
  async reportTimeout(
    sessionId: string,
    body: TimeoutRequest,
  ): Promise<TimeoutResponse> {
    const response = await apiClient.post<TimeoutResponse>(
      `${BASE}/sessions/${sessionId}/timeout`,
      body,
    );
    return response.data;
  },

  // SF04 + SF05 — Submit answer (acknowledgement + evaluation combined)
  async submitAnswer(
    sessionId: string,
    body: SubmitAnswerRequest,
  ): Promise<SubmitAnswerResponse> {
    const response = await apiClient.post<SubmitAnswerResponse>(
      `${BASE}/sessions/${sessionId}/answer`,
      body,
    );
    return response.data;
  },

  // SF07 — End session (manual quit)
  async endSession(
    sessionId: string,
    body: EndSessionRequest,
  ): Promise<EndSessionResponse> {
    const response = await apiClient.post<EndSessionResponse>(
      `${BASE}/sessions/${sessionId}/end`,
      body,
    );
    return response.data;
  },
};
