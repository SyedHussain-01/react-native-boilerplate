import { useNavigation } from "@react-navigation/native";
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
import { forgotPasswordRules } from "../../utils/rules";

type ForgotPasswordFormData = {
  email: string;
};

const ForgotPassword = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: "",
    },
  });

  const handleDummySubmit = (data: ForgotPasswordFormData) => {
    navigation.navigate("OtpVerification", {
      email: data.email,
      userId: "dummy-user-001",
      from: "forgot-password",
    });
  };

  return (
    <MainWrapper>
      <AppHeader
        title="Forgot Password"
        showBack
        showIcons={false}
        titleSize="small"
      />
      <KeyboardAvoidingScrollView contentContainerStyle={styles.scrollContent}>
        <AppText weight="Medium" size="md" style={styles.instructions}>
          Enter the phone number associated with your account to receive a 4-digit verification code
        </AppText>

        <TextInput
          name="email"
          control={control}
          rules={forgotPasswordRules.email}
          label="Email Address"
          required
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
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

export default ForgotPassword;

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
    marginBottom: verticalScale(16),
  },
  inputContainer: {
    marginBottom: verticalScale(24),
  },
  continueButton: {
    marginTop: verticalScale(8),
  },
});
