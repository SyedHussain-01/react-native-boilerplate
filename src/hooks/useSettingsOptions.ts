import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { MainStackParamList } from "../types/navigation";
import { remotePlaceholders } from "../constants/remotePlaceholders";

export type SettingsOption = {
  id: string;
  icon: any;
  title: string;
  showToggle?: boolean;
  showArrow?: boolean;
  onPress?: () => void;
};

export const useSettingsOptions = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);

  const settingsOptions: SettingsOption[] = useMemo(
    () => [
      {
        id: "push-notification",
        icon: remotePlaceholders.settingsNotifications,
        title: "Push Notification",
        showToggle: true,
        showArrow: false,
        onPress: undefined,
      },
      {
        id: "change-password",
        icon: remotePlaceholders.settingsChangePassword,
        title: "Change Password",
        showToggle: false,
        showArrow: true,
        onPress: () => {
          navigation.navigate("ChangePassword");
        },
      },
      {
        id: "contact-us",
        icon: remotePlaceholders.settingsContactUs,
        title: "Contact Us",
        showToggle: false,
        showArrow: true,
        onPress: () => {
          navigation.navigate("ContactUs");
        },
      },
      {
        id: "privacy-policy",
        icon: remotePlaceholders.settingsPrivacy,
        title: "Privacy Policy",
        showToggle: false,
        showArrow: true,
        onPress: () => {
          navigation.navigate("PrivacyPolicy");
        },
      },
      {
        id: "terms-conditions",
        icon: remotePlaceholders.settingsTerms,
        title: "Terms and Conditions",
        showToggle: false,
        showArrow: true,
        onPress: () => {
          navigation.navigate("TermsAndConditions");
        },
      },
      {
        id: "manage-subscription",
        icon: remotePlaceholders.settingsManageSubscription,
        title: "Manage Subscription",
        showToggle: false,
        showArrow: true,
        onPress: () => {
          navigation.navigate("ManageSubscription", { from: "settings" });
        },
      },
      {
        id: "faqs",
        icon: remotePlaceholders.settingsFaq,
        title: "FAQs",
        showToggle: false,
        showArrow: true,
        onPress: () => {
          navigation.navigate("FAQS");
        },
      },
      {
        id: "logout",
        icon: remotePlaceholders.settingsLogout,
        title: "Logout",
        showToggle: false,
        showArrow: false,
        onPress: () => {
          // Logout will be handled by showing the modal
        },
      },
    ],
    [navigation]
  );

  return {
    settingsOptions,
    pushNotificationEnabled,
    setPushNotificationEnabled,
  };
};

