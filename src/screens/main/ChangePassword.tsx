import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { scale, verticalScale } from "react-native-size-matters";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import Button from "../../components/common/Button";
import { KeyboardAvoidingScrollView } from "../../components/common/KeyboardAvoidingContainer";
import MainWrapper from "../../components/common/MainWrapper";
import TextInput from "../../components/common/TextInput";
import { palette } from "../../theme";
import { changePasswordRules } from "../../utils/rules";

type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePassword = () => {
  const navigation = useNavigation();
  const { control, handleSubmit } = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDummySubmit = () => {
    navigation.goBack();
  };

  return (
    <MainWrapper edges={[]} style={styles.wrapper}>
      <AppHeader
        title="Change Password"
        showBack
        onPressBack={handleBack}
        showIcons={false}
      />

      <KeyboardAvoidingScrollView
        contentContainerStyle={styles.scrollContent}
        footer={
          <View style={styles.bottomContainer}>
            <Button
              title="Update Password"
              variant="primary"
              fullWidth
              onPress={handleSubmit(handleDummySubmit)}
            />
          </View>
        }
      >
        <AppText weight="Regular" size="base" style={styles.description}>
          Your new password must be different from the previously used passwords
        </AppText>

        <View style={styles.inputsContainer}>
          <TextInput
            name="currentPassword"
            control={control}
            rules={changePasswordRules.currentPassword}
            label="Current password"
            required
            placeholder="Enter current password"
            secureTextEntry
            showPasswordToggle
            placeholderTextColor="#717680"
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputField}
          />

          <TextInput
            name="newPassword"
            control={control}
            rules={changePasswordRules.newPassword}
            label="New password"
            required
            placeholder="Enter new password"
            secureTextEntry
            showPasswordToggle
            placeholderTextColor="#717680"
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputField}
          />

          <TextInput
            name="confirmPassword"
            control={control}
            rules={changePasswordRules.confirmPassword}
            label="Confirm password"
            required
            placeholder="Re-enter your password"
            secureTextEntry
            showPasswordToggle
            placeholderTextColor="#717680"
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputField}
          />
        </View>
      </KeyboardAvoidingScrollView>
    </MainWrapper>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette.white,
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(24),
  },
  description: {
    color: palette.contentBody,
    marginBottom: verticalScale(24),
  },
  inputsContainer: {
    gap: verticalScale(16),
  },
  inputContainer: {
    marginVertical: 0,
  },
  inputField: {
    backgroundColor: palette.background,
    height: verticalScale(46),
    paddingHorizontal: scale(12),
    borderColor: "#E9EAEB",
  },
  bottomContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(35),
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: "#E9EAEB",
  },
});
