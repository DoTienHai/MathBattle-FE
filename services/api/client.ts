/**
 * API Client Configuration
 * Centralized axios instance with interceptors for auth, error handling, etc.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance } from "axios";

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
const API_TIMEOUT_MS = 30000;

/**
 * Create axios instance with default config
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor: Add auth token to headers
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error: any) {
      // Silently ignore if AsyncStorage is not available (app startup)
      // or token retrieval fails - non-critical for first requests (login/register)
      if (error.message && error.message.includes("Native module is null")) {
        // Skip token injection on startup
      } else {
        console.warn("Warning retrieving auth token:", error.message);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor: Handle errors and refresh token if needed
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      try {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("user");
        // Navigation to login should be handled by app state
      } catch (err) {
        console.error("Error clearing storage:", err);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Network Logger - Store API requests/responses in AsyncStorage for debugging
 */
export const networkLogger = {
  logs: [] as {
    timestamp: string;
    method: string;
    url: string;
    status?: number;
    error?: string;
  }[],

  async addLog(
    method: string,
    url: string,
    status?: number,
    error?: string,
  ): Promise<void> {
    const log = {
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      status,
      error,
    };

    this.logs.push(log);

    // Keep only last 50 logs
    if (this.logs.length > 50) {
      this.logs.shift();
    }

    try {
      await AsyncStorage.setItem("@networkLogs", JSON.stringify(this.logs));
    } catch (e) {
      console.warn("Failed to save network logs");
    }
  },

  async getLogs() {
    try {
      const stored = await AsyncStorage.getItem("@networkLogs");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  async clearLogs() {
    this.logs = [];
    await AsyncStorage.removeItem("@networkLogs");
  },
};

// Add network logger interceptor
apiClient.interceptors.request.use((config) => {
  const startTime = Date.now();

  // Log request details
  console.log(`[API REQUEST] 🚀 Starting request`);
  console.log(`  Method: ${config.method?.toUpperCase()}`);
  console.log(`  URL: ${config.baseURL}${config.url}`);
  console.log(`  Base URL: ${config.baseURL}`);
  console.log(`  Full URL: ${config.baseURL}${config.url}`);
  console.log(`  Endpoint: ${config.url}`);
  console.log(`  Headers:`, {
    "Content-Type": config.headers["Content-Type"],
    Authorization: config.headers.Authorization ? "✅ Set" : "❌ Not set",
  });

  // Store start time on config for use in response
  (config as any).__startTime = startTime;

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any).__startTime;
    const duration = Date.now() - startTime;
    const method = response.config.method?.toUpperCase() || "GET";
    const url = response.config.url || "";

    console.log(`[API SUCCESS] ✅ ${method} ${url}`);
    console.log(`  Status: ${response.status}`);
    console.log(`  Duration: ${duration}ms`);

    networkLogger.addLog(method, url, response.status);

    return response;
  },
  (error: AxiosError) => {
    const startTime = (error.config as any)?.__startTime;
    const duration = startTime ? Date.now() - startTime : 0;
    const method = error.config?.method?.toUpperCase() || "GET";
    const url = error.config?.url || "";
    const baseURL = error.config?.baseURL || "unknown";
    const status = error.response?.status;
    const errorCode = error.code;

    console.error(`[API ERROR] ❌ ${method} ${url}`);
    console.error(`  Base URL: ${baseURL}`);
    console.error(`  Full URL: ${baseURL}${url}`);
    console.error(`  Status: ${status || "No response"}`);
    console.error(`  Error Code: ${errorCode}`);
    console.error(`  Duration: ${duration}ms`);
    console.error(`  Message: ${error.message}`);
    console.error(`  Request Config:`, {
      timeout: error.config?.timeout,
      method: error.config?.method,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });

    if (error.response) {
      console.error(`  Response Status: ${error.response.status}`);
      console.error(`  Response Data:`, error.response.data);
    } else if (error.request) {
      console.error(`  No response received (Network error)`);
      console.error(`  Request was sent but no response`);
    } else {
      console.error(`  Error: ${error.message}`);
    }

    networkLogger.addLog(method, url, status, error.message);

    return Promise.reject(error);
  },
);

export default apiClient;
