import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import OtpInputs from "react-native-otp-inputs";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import Button from "../../components/common/Button";
import { KeyboardAvoidingScrollView } from "../../components/common/KeyboardAvoidingContainer";
import MainWrapper from "../../components/common/MainWrapper";
import {
  resetRootToMainApp,
  resetRootToOnboardingProfileSetup,
} from "../../navigation/navigationRef";
import { palette } from "../../theme";
import { AuthStackParamList } from "../../types/navigation";

const OtpVerification = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [otp, setOtp] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const route = useRoute();
  const { email, userId, from } = route.params as {
    email: string;
    userId?: string;
    from: "forgot-password" | "signup" | "signin";
  };

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [timeRemaining]);

  const handleOtpChange = (code: string) => {
    setOtp(code);
  };

  const handleContinue = () => {
    if (otp.length !== 4) {
      return;
    }

    if (from === "forgot-password") {
      navigation.navigate("ResetPassword", {
        userId: userId || "dummy-user-001",
        email,
        otp,
      });
      return;
    }

    if (from === "signup") {
      resetRootToOnboardingProfileSetup();
      return;
    }

    resetRootToMainApp();
  };

  const handleResend = () => {
    if (canResend) {
      setTimeRemaining(59);
      setCanResend(false);
      setOtp("");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isContinueDisabled = otp.length !== 4;

  return (
    <MainWrapper>
      <AppHeader
        title="OTP Verification"
        showBack
        showIcons={false}
        titleSize="small"
      />
      <KeyboardAvoidingScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionsContainer}>
          <AppText weight="Regular" size="md" style={styles.instructionsText}>
            Please enter the OTP you received on{" "}
          </AppText>
          <AppText weight="Medium" size="md" style={styles.emailText}>
            {email}
          </AppText>
        </View>

        <View style={styles.otpContainer}>
          <OtpInputs
            handleChange={handleOtpChange}
            numberOfInputs={4}
            autofillFromClipboard={false}
            inputStyles={styles.otpInput}
            inputContainerStyles={styles.otpInputContainer}
          />
        </View>

        <View style={styles.timerContainer}>
          <AppText weight="Regular" size="md" style={styles.timerText}>
            Expires in:{" "}
          </AppText>
          <AppText weight="Regular" size="md" style={styles.timerValue}>
            {formatTime(timeRemaining)}
          </AppText>
        </View>

        <View style={styles.resendContainer}>
          <AppText weight="Regular" size="md" style={styles.resendText}>
            Didn't receive code?{" "}
          </AppText>
          <TouchableOpacity
            onPress={handleResend}
            disabled={!canResend}
            activeOpacity={0.7}
          >
            <AppText
              weight="Regular"
              size="md"
              style={canResend ? styles.resendLink : styles.resendLinkDisabled}
            >
              Resend
            </AppText>
          </TouchableOpacity>
        </View>

        <Button
          title="Continue"
          variant="primary"
          fullWidth
          onPress={handleContinue}
          disabled={isContinueDisabled}
          style={styles.continueButton}
        />
      </KeyboardAvoidingScrollView>
    </MainWrapper>
  );
};

export default OtpVerification;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  instructionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: verticalScale(32),
  },
  instructionsText: {
    color: palette.textDark,
    textAlign: "left",
  },
  emailText: {
    color: palette.textDark,
    textAlign: "left",
  },
  otpContainer: {
    marginBottom: verticalScale(24),
    alignItems: "center",
  },
  otpInputContainer: {
    flexDirection: "row",
    gap: scale(12),
    justifyContent: "center",
    paddingHorizontal: scale(4),
  },
  otpInput: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderWidth: 1,
    borderColor: palette.lightGray,
    borderRadius: scale(12),
    textAlign: "center",
    fontSize: moderateScale(24),
    fontFamily: "PlusJakartaSans-Medium",
    color: palette.textDark,
    backgroundColor: palette.white,
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  timerText: {
    color: palette.textDark,
  },
  timerValue: {
    color: palette.orange,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  resendText: {
    color: palette.textDark,
  },
  resendLink: {
    color: palette.orange,
    textDecorationLine: "underline",
  },
  resendLinkDisabled: {
    color: palette.textGray,
    textDecorationLine: "none",
  },
  continueButton: {
    marginBottom: verticalScale(32),
  },
});
