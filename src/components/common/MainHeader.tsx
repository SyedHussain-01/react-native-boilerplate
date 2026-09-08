import { MainStackParamList } from "@/src/types/navigation";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppState,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import {
  dummyNotificationSections,
  dummyPointsBalance,
  dummyProviderProfile,
  dummyUserProfile,
} from "../../constants/dummyUiData";
import { palette } from "../../theme";
import { remotePlaceholders } from "../../constants/remotePlaceholders";
import AppImage from "./AppImage";
import AppText from "./AppText";
import UserAvatar from "./UserAvatar";

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Welcome";
}

type MainHeaderProps = {
  userName?: string;
  avatarUrl?: string | null;
  onNotificationPress?: () => void;
  greeting?: boolean;
  screenName?: string;
  profile?: boolean;
  customIcons?: React.ReactNode;
};

const MainHeader: React.FC<MainHeaderProps> = ({
  userName = dummyUserProfile.fullName,
  avatarUrl = dummyUserProfile.avatar,
  onNotificationPress,
  greeting = true,
  screenName = "",
  profile = true,
  customIcons,
}) => {
  const avatarSize = moderateScale(40);
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [timeGreeting, setTimeGreeting] = useState(getTimeBasedGreeting);

  useEffect(() => {
    const syncGreeting = () => {
      setTimeGreeting(getTimeBasedGreeting());
    };
    syncGreeting();
    const intervalId = setInterval(syncGreeting, 60_000);
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        syncGreeting();
      }
    });
    return () => {
      clearInterval(intervalId);
      sub.remove();
    };
  }, []);

  const handlePointsPress = useCallback(() => {
    navigation?.navigate?.("PointsHistory");
  }, [navigation]);

  const handleStorefrontPress = useCallback(() => {
    navigation.navigate("StoreProducts", {
      userId: dummyProviderProfile.userId,
      userName: dummyProviderProfile.userName,
      avatarUrl: dummyProviderProfile.avatarUrl,
    });
  }, [navigation]);

  const notificationUnreadCount = useMemo(
    () =>
      dummyNotificationSections.reduce(
        (total, section) => total + section.data.filter((item) => !item.read).length,
        0,
      ),
    [],
  );

  const notificationBadgeLabel = useMemo(() => {
    if (notificationUnreadCount <= 0) {
      return null;
    }
    if (notificationUnreadCount > 99) {
      return "99+";
    }
    return String(notificationUnreadCount);
  }, [notificationUnreadCount]);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.container}>
        <View style={styles.navigation}>
          <View style={styles.profileSection}>
            {profile && <UserAvatar uri={avatarUrl} size={avatarSize} />}
            {greeting ? (
              <View style={styles.greetingSection}>
                <AppText
                  weight="Regular"
                  size="xs"
                  style={styles.greetingLabel}
                >
                  {timeGreeting}
                </AppText>
                <AppText weight="SemiBold" size="md" style={styles.userName}>
                  {userName}
                </AppText>
              </View>
            ) : (
              <View style={styles.greetingSection}>
                <AppText weight="SemiBold" size="md" style={styles.screenName}>
                  {screenName}
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.pointsChip}
              onPress={handlePointsPress}
              activeOpacity={0.72}
              accessibilityRole="button"
              accessibilityLabel="Points balance and history"
            >
              <View style={styles.pointsChipIconBubble} accessibilityElementsHidden>
                <Feather
                  name="award"
                  size={moderateScale(13)}
                  color={palette.orange}
                />
              </View>
              <View style={styles.pointsChipMain}>
                <AppText weight="SemiBold" size="xs" style={styles.pointsChipValue}>
                  {dummyPointsBalance}
                </AppText>
              </View>
            </TouchableOpacity>
            {screenName === "Explore" ? (
              customIcons
            ) : (
              <>
                <TouchableOpacity
                  style={styles.notificationButton}
                  onPress={handleStorefrontPress}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="storefront"
                    size={moderateScale(20)}
                    color={palette.orange}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.notificationButton}
                  onPress={() => onNotificationPress?.()}
                  activeOpacity={0.7}
                >
                  <AppImage
                    source={remotePlaceholders.notification}
                    style={styles.notificationIcon}
                    resizeMode="cover"
                  />
                  {notificationBadgeLabel ? (
                    <View style={styles.notificationBadge}>
                      <AppText
                        weight="SemiBold"
                        size="xs"
                        style={styles.notificationBadgeText}
                        numberOfLines={1}
                      >
                        {notificationBadgeLabel}
                      </AppText>
                    </View>
                  ) : null}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MainHeader;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: "#E9EAEB",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(12),
    gap: scale(12),
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    flex: 1,
  },
  greetingSection: {
    flex: 1,
  },
  greetingLabel: {
    color: palette.contentTitle,
    fontSize: moderateScale(11),
  },
  userName: {
    color: palette.contentTitle,
    fontSize: moderateScale(14),
  },
  screenName: {
    color: palette.contentTitle,
    fontSize: moderateScale(15),
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  pointsChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: verticalScale(6),
    paddingLeft: scale(4),
    paddingRight: scale(9),
    borderRadius: scale(20),
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(19, 39, 111, 0.1)",
    gap: scale(6),
    maxWidth: scale(140),
    ...Platform.select({
      ios: {
        shadowColor: "#13276F",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  pointsChipIconBubble: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    backgroundColor: "rgba(255, 107, 53, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 107, 53, 0.22)",
  },
  pointsChipMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pointsChipValue: {
    color: palette.darkBlue,
    minWidth: moderateScale(18),
    textAlign: "right",
  },
  notificationButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: scale(8),
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E9EAEB",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "visible",
  },
  notificationIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  notificationBadge: {
    position: "absolute",
    top: verticalScale(-4),
    right: scale(-4),
    minWidth: moderateScale(16),
    height: moderateScale(16),
    paddingHorizontal: scale(4),
    borderRadius: moderateScale(8),
    backgroundColor: palette.orange,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: palette.white,
  },
  notificationBadgeText: {
    color: palette.white,
    fontSize: moderateScale(9),
    lineHeight: moderateScale(11),
    textAlign: "center",
  },
});
