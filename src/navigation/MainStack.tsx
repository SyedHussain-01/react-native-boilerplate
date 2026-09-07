import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform } from "react-native";
import { useGetMeQuery } from "../api/auth";
import { usePurchases } from "../hooks/usePurchases";
import { useSubscriptionPaywall } from "../hooks/useSubscriptionPaywall";
import { useAuthStore } from "../store/auth.store";
import ChangePassword from "../screens/main/ChangePassword";
import ContactUs from "../screens/main/ContactUs";
import Notifications from "../screens/main/Notifications";
import PrivacyPolicy from "../screens/main/PrivacyPolicy";
import Settings from "../screens/main/Settings";
import TermsAndConditions from "../screens/main/TermsAndConditions";
import { palette } from "../theme";
import { MainStackParamList } from "../types/navigation";
import BottomBar from "./BottomBar";
import ProfileSetup from "../screens/onboarding/ProfileSetup";

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainStack: React.FC = () => {
  const token = useAuthStore((s) => s?.token);
  // const { isSubscribed, isPurchasesUserSynced } = usePurchases();

  // useGetMeQuery({ enabled: Boolean(token?.trim?.()?.length) });
  // useSubscriptionPaywall(isSubscribed, isPurchasesUserSynced);

  return (
    <>
      <Stack.Navigator
        // initialRouteName={isSubscribed ? "BottomBar" : "ManageSubscription"}
        initialRouteName={"BottomBar"}
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor:
              Platform.OS === "android" ? palette.background : "transparent",
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="BottomBar"
          component={BottomBar}
          options={{
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUs}
          options={{
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
          options={{
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="TermsAndConditions"
          component={TermsAndConditions}
          options={{
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetup}
          options={{
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </Stack.Navigator>
    </>
  );
};

export default MainStack;
