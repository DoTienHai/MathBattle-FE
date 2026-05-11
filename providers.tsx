/**
 * Redux Provider Wrapper
 * Wraps the app with Redux Provider and other global providers
 */

import store from "@/redux/store";
import React from "react";
import { Provider } from "react-redux";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default Providers;
