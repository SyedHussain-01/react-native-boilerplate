import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "./../../theme/index";
import AppText from "./AppText";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

type Props = {
  title?: string;
  onPressSettings?: () => void;
  onPressNotification?: () => void;
  showBack?: boolean;
  onPressBack?: () => void;
  showIcons?: boolean;
  titleSize?: "small" | "large";
  customIcons?: React.ReactNode;
};

const AppHeader: React.FC<Props> = ({
  title = "Home",
  onPressSettings,
  onPressNotification,
  showBack = false,
  onPressBack,
  showIcons = true,
  titleSize = "small",
  customIcons,
}) => {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onPressBack) {
      onPressBack();
      return;
    }
    navigation.goBack();
  };

  const renderIcons = () => {
    if (customIcons) {
      return customIcons;
    }

    if (!showIcons) {
      return null;
    }

    return (
      <>
        <TouchableOpacity
          onPress={onPressSettings ?? (() => navigation.navigate("Settings"))}
          hitSlop={{
            top: verticalScale(8),
            bottom: verticalScale(8),
            left: scale(8),
            right: scale(8),
          }}
          activeOpacity={0.7}
        >
          <Feather name="settings" size={24} color={palette.primary} />
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navigation}>
          {showBack && (
            <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
              <Image
                source={remotePlaceholders.arrowLeft}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <AppText
              weight={"Medium"}
              style={StyleSheet.flatten([
                styles.title,
                titleSize === "large" ? styles.titleLarge : styles.titleSmall,
              ])}
            >
              {title}
            </AppText>
          </View>
          {showIcons || customIcons ? (
            <View style={styles.iconsContainer}>{renderIcons()}</View>
          ) : (
            <View style={styles.iconsContainer} />
          )}
        </View>
      </View>
      <View style={styles.shadow} />
    </SafeAreaView>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.white,
  },
  container: {
    backgroundColor: palette.white,
  },
  shadow: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(12),
    gap: scale(8),
  },
  titleContainer: {
    flex: 1,
    flexDirection: "column",
    gap: verticalScale(4),
    alignItems: "flex-start",
    justifyContent: "center",
  },
  title: {
    color: palette.textDark,
  },
  titleSmall: {
    fontSize: moderateScale(18),
  },
  titleLarge: {
    fontSize: moderateScale(32),
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    minHeight: verticalScale(24),
    maxWidth: "42%",
  },
  backIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    marginTop: scale(2),
  },
});
