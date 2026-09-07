import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppImage from "../common/AppImage";
import AppText from "../common/AppText";
import UserAvatar from "../common/UserAvatar";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

type SettingsProfileCardProps = {
  name?: string;
  email?: string;
  /** Remote profile image URL from `/auth/me` `user.avatar`. */
  avatarUrl?: string | null;
  onEditPress?: () => void;
};

const SettingsProfileCard: React.FC<SettingsProfileCardProps> = ({
  name,
  email,
  avatarUrl,
  onEditPress,
}) => {
  // Provide fallback values only if no props are provided
  const displayName = name || "User";
  const displayEmail = email || "user@example.com";
  const avatarSize = moderateScale(70);

  return (
    <View style={styles.container}>
      <UserAvatar uri={avatarUrl} size={avatarSize} />
      <View style={styles.textContainer}>
        <AppText weight="SemiBold" size="lg" style={styles.name}>
          {displayName}
        </AppText>
        <AppText weight="Regular" size="sm" style={styles.email}>
          {displayEmail}
        </AppText>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={onEditPress}
        activeOpacity={0.7}
      >
        <AppImage
          source={remotePlaceholders.settingsEdit}
          style={styles.editIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default SettingsProfileCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(247, 146, 51, 0.05)",
    borderWidth: 1,
    borderColor: "#E9EAEB",
    borderRadius: scale(16),
    padding: scale(16),
    gap: scale(10),
    height: verticalScale(95),
  },
  textContainer: {
    flex: 1,
    gap: verticalScale(5),
  },
  name: {
    color: palette.contentTitle,
  },
  email: {
    color: palette.contentBody,
  },
  editButton: {
    width: moderateScale(24),
    height: moderateScale(24),
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
});
