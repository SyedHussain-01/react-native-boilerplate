import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useForm } from "react-hook-form";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { resetRootToMainApp } from "../../navigation/navigationRef";
import AppHeader from "../../components/common/AppHeader";
import AppImage from "../../components/common/AppImage";
import AppText from "../../components/common/AppText";
import Button from "../../components/common/Button";
import { KeyboardAvoidingScrollView } from "../../components/common/KeyboardAvoidingContainer";
import MainWrapper from "../../components/common/MainWrapper";
import TextInput from "../../components/common/TextInput";
import { palette } from "../../theme";
import { signinRules } from "../../utils/rules";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

type SigninFormData = {
  email: string;
  password: string;
};

const Signin = () => {
  const navigation = useNavigation<any>();
  const { control, handleSubmit } = useForm<SigninFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleDummySignIn = (data: SigninFormData) => {
    console.log("Dummy Sign In data:", data);
    resetRootToMainApp();
  };

  const handleDummySocialSignIn = () => {
    resetRootToMainApp();
  };

  const handleSignUp = () => {
    navigation.navigate("Signup");
  };

  return (
    <MainWrapper>
      <AppHeader title="Sign In" showIcons={false} titleSize="small" />
      <KeyboardAvoidingScrollView contentContainerStyle={styles.scrollContent}>
        <AppText weight="Medium" size="lg" style={styles.greeting}>
          Let's Sign in
        </AppText>

        <View style={styles.form}>
          <TextInput
            name="email"
            control={control}
            rules={signinRules.email}
            label="Email Address"
            required
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            name="password"
            control={control}
            rules={signinRules.password}
            label="Password"
            required
            placeholder="Enter your password"
            secureTextEntry
            showPasswordToggle
            autoCapitalize="none"
            autoComplete="password"
          />

          <View style={styles.forgotPasswordContainer}>
            <Button
              title="Forgot Password?"
              variant="text"
              onPress={handleForgotPassword}
              textStyle={styles.forgotPasswordText}
            />
          </View>

          <Button
            title="Sign In"
            variant="primary"
            fullWidth
            onPress={handleSubmit(handleDummySignIn)}
            style={styles.signInButton}
          />

          <View style={styles.signUpContainer}>
            <AppText weight="Regular" size="md" style={styles.signUpText}>
              Don't have an account?{" "}
            </AppText>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <AppText weight="Medium" size="md" style={styles.signUpLink}>
                Sign Up
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <AppText weight="Regular" size="md" style={styles.separatorText}>
              or
            </AppText>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <Button
              title="Apple"
              variant="outlined"
              flex={1}
              onPress={handleDummySocialSignIn}
              leftIcon={
                <AppImage
                  source={remotePlaceholders.socialApple}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              }
              textStyle={styles.socialButtonText}
              style={styles.socialButton}
            />
            <Button
              title="Google"
              variant="outlined"
              flex={1}
              onPress={handleDummySocialSignIn}
              leftIcon={
                <AppImage
                  source={remotePlaceholders.socialGoogle}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              }
              textStyle={styles.socialButtonText}
              style={styles.socialButton}
            />
          </View>
        </View>
      </KeyboardAvoidingScrollView>
    </MainWrapper>
  );
};

export default Signin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  greeting: {
    color: palette.textDark,
    textAlign: "left",
    marginBottom: verticalScale(20),
  },
  form: {
    flex: 1,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: verticalScale(24),
    width: "100%",
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "400",
    color: palette.orange,
  },
  signInButton: {
    marginBottom: verticalScale(16),
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  separatorLine: {
    flex: 1,
    height: verticalScale(1),
    backgroundColor: palette.lightGray,
  },
  separatorText: {
    color: palette.textGray,
    marginHorizontal: scale(16),
  },
  socialButtonsContainer: {
    flexDirection: "row",
    gap: scale(12),
    marginBottom: verticalScale(32),
  },
  socialButton: {
    borderColor: palette.lightGray,
  },
  socialIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  socialButtonText: {
    color: palette.textDark,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  signUpText: {
    color: palette.textGray,
  },
  signUpLink: {
    color: palette.orange,
  },
});
