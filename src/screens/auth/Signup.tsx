import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useForm } from "react-hook-form";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import AppHeader from "../../components/common/AppHeader";
import AppImage from "../../components/common/AppImage";
import AppText from "../../components/common/AppText";
import Button from "../../components/common/Button";
import ImagePickerBottomSheet, {
  ImagePickerBottomSheetRef,
} from "../../components/common/ImagePickerBottomSheet";
import { KeyboardAvoidingScrollView } from "../../components/common/KeyboardAvoidingContainer";
import MainWrapper from "../../components/common/MainWrapper";
import TextInput from "../../components/common/TextInput";
import useImagePicker from "../../hooks/useImagePicker";
import { palette } from "../../theme";
import { AuthStackParamList } from "../../types/navigation";
import { signupRules } from "../../utils/rules";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  password: string;
  confirmPassword: string;
};

const Signup = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [agreeToTerms, setAgreeToTerms] = useState(true);

  const { images, pickImageFromLibrary, pickImageFromCamera } = useImagePicker({
    allowsMultipleSelection: false,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  const { control, handleSubmit } = useForm<SignupFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      referralCode: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedProfileImage = images[0];
  const imagePickerBottomSheetRef = useRef<ImagePickerBottomSheetRef>(null);

  const handleDummySignup = (data: SignupFormData) => {
    console.log("Dummy Sign Up data:", data);
    navigation.navigate("OtpVerification", {
      email: data.email,
      userId: "dummy-user-001",
      from: "signup",
    });
  };

  const handleSignIn = () => {
    navigation.navigate("Signin");
  };

  const handleDummySocialSignup = () => {
    navigation.navigate("OtpVerification", {
      email: "social.signup@example.com",
      userId: "dummy-social-user-001",
      from: "signup",
    });
  };

  const handleTerms = () => {
    navigation.navigate("TermsAndConditions");
  };

  const handlePrivacy = () => {
    navigation.navigate("PrivacyPolicy");
  };

  const handleProfilePicture = () => {
    imagePickerBottomSheetRef.current?.expand();
  };

  const handleCameraPress = async () => {
    await pickImageFromCamera();
  };

  const handleGalleryPress = async () => {
    await pickImageFromLibrary();
  };

  return (
    <MainWrapper>
      <AppHeader title="Sign Up" showIcons={false} titleSize="small" />
      <KeyboardAvoidingScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="interactive"
      >
        <AppText weight="Medium" size="lg" style={styles.greeting}>
          Let's Sign up
        </AppText>

        <TouchableOpacity
          style={styles.profilePictureContainer}
          onPress={handleProfilePicture}
          activeOpacity={0.8}
        >
          <View style={styles.profilePicture}>
            {selectedProfileImage ? (
              <AppImage
                source={{ uri: selectedProfileImage.uri }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Feather name="user" size={40} color={palette.textGray} />
            )}
          </View>
          <View style={styles.cameraIconContainer}>
            <Feather name="camera" size={16} color={palette.white} />
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <TextInput
                name="firstName"
                control={control}
                rules={signupRules.firstName}
                label="First Name"
                required
                placeholder="Enter your first name"
                containerStyle={styles.nameInputContainer}
              />
            </View>
            <View style={styles.nameField}>
              <TextInput
                name="lastName"
                control={control}
                rules={signupRules.lastName}
                label="Last Name"
                required
                placeholder="Enter your last name"
                containerStyle={styles.nameInputContainer}
              />
            </View>
          </View>

          <TextInput
            name="email"
            control={control}
            rules={signupRules.email}
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
            rules={signupRules.password}
            label="Password"
            required
            placeholder="Enter your password"
            secureTextEntry
            showPasswordToggle
            autoCapitalize="none"
            autoComplete="password"
          />

          <TextInput
            name="confirmPassword"
            control={control}
            rules={signupRules.confirmPassword}
            label="Confirm Password"
            required
            placeholder="Re-enter your password"
            secureTextEntry
            showPasswordToggle
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
            >
              {agreeToTerms && (
                <Feather name="check" size={16} color={palette.white} />
              )}
            </View>
            <AppText weight="Regular" size="base" style={styles.checkboxText}>
              By creating an account you agree to our{" "}
              <AppText
                weight="SemiBold"
                size="base"
                style={styles.linkText}
                onPress={handleTerms}
              >
                Terms & Conditions
              </AppText>{" "}
              and{" "}
              <AppText
                weight="SemiBold"
                size="base"
                style={styles.linkText}
                onPress={handlePrivacy}
              >
                Privacy Policy
              </AppText>
              .
            </AppText>
          </TouchableOpacity>

          <Button
            title="Sign Up"
            variant="primary"
            fullWidth
            onPress={handleSubmit(handleDummySignup)}
            style={styles.signUpButton}
          />

          <View style={styles.signInContainer}>
            <AppText weight="Regular" size="md" style={styles.signInText}>
              Already have an account?{" "}
            </AppText>
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
              <AppText weight="Medium" size="md" style={styles.signInLink}>
                Sign In
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
              onPress={handleDummySocialSignup}
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
              onPress={handleDummySocialSignup}
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

      <ImagePickerBottomSheet
        ref={imagePickerBottomSheetRef}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />
    </MainWrapper>
  );
};

export default Signup;

const styles = StyleSheet.create({
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
  profilePictureContainer: {
    alignSelf: "flex-start",
    marginBottom: verticalScale(16),
    position: "relative",
  },
  profilePicture: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: palette.lightGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: palette.lightGray,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: palette.darkBlue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: palette.white,
  },
  form: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    gap: scale(12),
    marginBottom: 0,
  },
  nameField: {
    flex: 1,
  },
  nameInputContainer: {
    marginVertical: verticalScale(6),
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: verticalScale(24),
    gap: scale(12),
  },
  checkbox: {
    width: scale(20),
    height: verticalScale(20),
    borderRadius: scale(4),
    borderWidth: 2,
    borderColor: palette.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(2),
  },
  checkboxChecked: {
    backgroundColor: palette.darkBlue,
    borderColor: palette.darkBlue,
  },
  checkboxText: {
    flex: 1,
    color: palette.textDark,
  },
  linkText: {
    color: palette.orange,
  },
  signUpButton: {
    marginBottom: verticalScale(16),
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  signInText: {
    color: palette.textGray,
  },
  signInLink: {
    color: palette.orange,
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
});
