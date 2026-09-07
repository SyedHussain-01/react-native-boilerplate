import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppImage from "../common/AppImage";
import AppText from "../common/AppText";
import Toggle from "../common/Toggle";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

type SettingsOptionItemProps = {
  icon: any;
  title: string;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  showArrow?: boolean;
  onPress?: () => void;
};

const SettingsOptionItem: React.FC<SettingsOptionItemProps> = ({
  icon,
  title,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
  showArrow = true,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={showToggle}
    >
      <View style={styles.iconContainer}>
        <AppImage source={icon} style={styles.icon} resizeMode="contain" />
      </View>
      <AppText weight="Regular" size="md" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.rightContainer}>
        {showToggle ? (
          <Toggle value={toggleValue} onValueChange={onToggleChange || (() => {})} />
        ) : showArrow ? (
          <AppImage
            source={remotePlaceholders.chevronRight}
            style={styles.arrow}
            resizeMode="contain"
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default SettingsOptionItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#E9EAEB",
    borderRadius: scale(16),
    padding: scale(16),
    gap: scale(8),
  },
  iconContainer: {
    width: moderateScale(16.667),
    height: moderateScale(16.667),
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  title: {
    flex: 1,
    color: palette.contentTitle,
  },
  rightContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    width: moderateScale(16.667),
    height: moderateScale(16.667),
  },
});

