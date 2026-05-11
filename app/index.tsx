import { Redirect } from "expo-router";
import React from "react";
import { useSelector } from "react-redux";

import { selectIsAuthenticated } from "@/redux/selectors/authSelectors";

export default function IndexRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/login" />;
}
