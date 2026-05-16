/**
 * Redux Store Configuration
 * Configures Redux store with slices and middleware
 */

import authReducer from "@/redux/slices/authSlice";
import quickCalculateReducer from "@/redux/slices/quickCalculateSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quickCalculate: quickCalculateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ["auth/loginUser/pending", "auth/loginUser/fulfilled"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
