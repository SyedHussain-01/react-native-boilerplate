import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale } from "react-native-size-matters";
import GetStartedContent from "../../components/get_started";
import SignInSignUpButtons from "../../components/get_started/SignInSignUpButtons";
import { palette } from "../../theme";
import { AuthStackParamList } from "../../types/navigation";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

const GetStartedThree = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleSignIn = () => {
    // Navigate to sign in screen
    // navigation.navigate("SignIn");
    console.log("Sign In pressed");
    navigation.navigate("Signin");
  };

  const handleSignUp = () => {
    // Navigate to sign up screen
    // navigation.navigate("SignUp");
    console.log("Sign Up pressed");
    navigation.navigate("Signup");
  };

  const handleTerms = () => {
    // Navigate to terms screen or open terms
    console.log("Terms of Use pressed");
  };

  const handlePrivacy = () => {
    // Navigate to privacy screen or open privacy policy
    console.log("Privacy Policy pressed");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        <View style={[styles.paginationDot, styles.paginationDotInactive]} />
        <View style={[styles.paginationDot, styles.paginationDotInactive]} />
        <View style={[styles.paginationDot, styles.paginationDotActive]} />
      </View>

      <GetStartedContent
        image={remotePlaceholders.getStartedAltHero}
        logoImage={remotePlaceholders.logoWhite}
        heading="How it works"
        description="Explain the core flow here. Replace this placeholder copy with a short description of how users get value from your product."
        buttonComponent={
          <SignInSignUpButtons
            onPressSignIn={handleSignIn}
            onPressSignUp={handleSignUp}
            onPressTerms={handleTerms}
            onPressPrivacy={handlePrivacy}
          />
        }
      />
    </SafeAreaView>
  );
};

export default GetStartedThree;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: verticalScale(12),
    paddingRight: scale(24),
    paddingBottom: verticalScale(8),
    gap: scale(8),
  },
  paginationDot: {
    width: scale(8),
    height: verticalScale(8),
    borderRadius: scale(4),
  },
  paginationDotActive: {
    backgroundColor: palette.orange,
  },
  paginationDotInactive: {
    backgroundColor: palette.lightGray,
  },
});