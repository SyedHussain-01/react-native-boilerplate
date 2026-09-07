import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ForgotPassword from "../screens/auth/ForgotPassword";
import OtpVerification from "../screens/auth/OtpVerification";
import ResetPassword from "../screens/auth/ResetPassword";
import Signin from "../screens/auth/Signin";
import Signup from "../screens/auth/Signup";
import PrivacyPolicy from "../screens/main/PrivacyPolicy";
import TermsAndConditions from "../screens/main/TermsAndConditions";
import { AuthStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Signup"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Signin" component={Signin} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="OtpVerification" component={OtpVerification} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
    </Stack.Navigator>
  );
};

export default AuthStack;
