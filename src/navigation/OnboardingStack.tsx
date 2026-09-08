import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useAuthStore } from "../store/auth.store";
import { getOnboardingEntryScreen } from "../utils/onboardingRouting";
import { OnboardingStackParamList } from "../types/navigation";
import OnboardingPlaceholder from "../screens/onboarding/OnboardingPlaceholder";
import ProfileSetup from "../screens/onboarding/ProfileSetup";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingStack: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const initialRouteName = getOnboardingEntryScreen(user);

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="OnboardingPlaceholder" component={OnboardingPlaceholder} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
