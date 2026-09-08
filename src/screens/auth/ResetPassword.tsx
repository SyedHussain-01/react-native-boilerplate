import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { scale, verticalScale } from "react-native-size-matters";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import Button from "../../components/common/Button";
import { KeyboardAvoidingScrollView } from "../../components/common/KeyboardAvoidingContainer";
import MainWrapper from "../../components/common/MainWrapper";
import TextInput from "../../components/common/TextInput";
import { palette } from "../../theme";
import { AuthStackParamList } from "../../types/navigation";
import { resetPasswordRules } from "../../utils/rules";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute();
  const { userId, email, otp } = route.params as {
    userId: string;
    email: string;
    otp: string;
  };

  const { control, handleSubmit } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleDummySubmit = (data: ResetPasswordFormData) => {
    console.log("Dummy reset password:", { userId, email, otp, ...data });
    navigation.navigate("Signin");
  };

  return (
    <MainWrapper>
      <AppHeader
        title="Reset Password"
        showBack
        showIcons={false}
        titleSize="small"
      />
      <KeyboardAvoidingScrollView contentContainerStyle={styles.scrollContent}>
        <AppText weight="Regular" size="base" style={styles.instructions}>
          Your new password must be different from the previously used password
        </AppText>

        <TextInput
          name="password"
          control={control}
          rules={resetPasswordRules.password}
          label="Password"
          required
          placeholder="Enter your password"
          secureTextEntry
          showPasswordToggle
          autoCapitalize="none"
          autoComplete="password-new"
          containerStyle={styles.inputContainer}
        />

        <TextInput
          name="confirmPassword"
          control={control}
          rules={resetPasswordRules.confirmPassword}
          label="Confirm Password"
          required
          placeholder="Confirm your password"
          secureTextEntry
          showPasswordToggle
          autoCapitalize="none"
          autoComplete="password-new"
          containerStyle={styles.inputContainer}
        />

        <Button
          title="Continue"
          variant="primary"
          fullWidth
          onPress={handleSubmit(handleDummySubmit)}
          style={styles.continueButton}
        />
      </KeyboardAvoidingScrollView>
    </MainWrapper>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  instructions: {
    color: palette.textDark,
    textAlign: "left",
    lineHeight: verticalScale(20),
    marginBottom: verticalScale(24),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  continueButton: {
    marginTop: verticalScale(8),
  },
});
