import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { useGetMeQuery } from "../api/auth";
import { useAuthStore } from "../store/auth.store";
import { RootStackParamList } from "../types/navigation";
import {
  getRootRouteAfterAuth,
  shouldEnterMainApp,
} from "../utils/onboardingRouting";
import { resetRootToMainApp } from "./navigationRef";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import OnboardingStack from "./OnboardingStack";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!token;

  // useGetMeQuery({ enabled: Boolean(token?.trim()) });

  useEffect(() => {
    if (isAuthenticated && user && shouldEnterMainApp(user)) {
      resetRootToMainApp();
    }
  }, [isAuthenticated, user]);

  const rootRoute = isAuthenticated ? getRootRouteAfterAuth(user) : "Auth";

  return (
    <Stack.Navigator
      initialRouteName={rootRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Onboarding" component={OnboardingStack} />
      <Stack.Screen name="MainApp" component={MainStack} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
