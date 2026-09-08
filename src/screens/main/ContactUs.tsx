import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import AppHeader from "../../components/common/AppHeader";
import Button from "../../components/common/Button";
import { KeyboardAvoidingScrollView } from "../../components/common/KeyboardAvoidingContainer";
import MainWrapper from "../../components/common/MainWrapper";
import TextInput from "../../components/common/TextInput";
import { palette } from "../../theme";
import { contactUsRules } from "../../utils/rules";

type ContactUsFormData = {
  fullName: string;
  email: string;
  message: string;
};

const ContactUs = () => {
  const navigation = useNavigation();
  const { control, handleSubmit } = useForm<ContactUsFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      message: "",
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDummySubmit = (data: ContactUsFormData) => {
    console.log("Dummy Contact Us form submitted:", data);
    navigation.goBack();
  };

  return (
    <MainWrapper edges={[]} style={styles.wrapper}>
      <AppHeader
        title="Contact Us"
        showBack
        onPressBack={handleBack}
        showIcons={false}
      />

      <KeyboardAvoidingScrollView
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        footer={
          <View style={styles.bottomContainer}>
            <Button
              title="Submit"
              variant="primary"
              fullWidth
              onPress={handleSubmit(handleDummySubmit)}
            />
          </View>
        }
      >
        <View style={styles.inputsContainer}>
          <TextInput
            name="fullName"
            control={control}
            rules={contactUsRules.fullName}
            label="Full Name"
            required
            placeholder="Enter full name"
            placeholderTextColor="#717680"
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputField}
          />

          <TextInput
            name="email"
            control={control}
            rules={contactUsRules.email}
            label="Email Address"
            required
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholderTextColor="#717680"
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputField}
          />

          <TextInput
            name="message"
            control={control}
            rules={contactUsRules.message}
            label="Message"
            required
            placeholder="Write your message"
            placeholderTextColor="#717680"
            multiline
            textAlignVertical="top"
            containerStyle={styles.messageContainer}
            inputContainerStyle={styles.messageInputContainer}
            style={styles.messageInput}
          />
        </View>
      </KeyboardAvoidingScrollView>
    </MainWrapper>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette.white,
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
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
  messageContainer: {
    marginVertical: 0,
  },
  messageInputContainer: {
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: "#E9EAEB",
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(16),
    height: verticalScale(156),
    alignItems: "flex-start",
  },
  messageInput: {
    flex: 1,
    fontSize: moderateScale(12),
    color: palette.contentTitle,
    fontFamily: "Cerebri Sans Pro",
    minHeight: verticalScale(120),
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
