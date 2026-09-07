import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppImage from "./AppImage";

type FloatingActionButtonProps = {
  onPress?: () => void;
  icon?: any;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
};

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  size = 62,
  backgroundColor = palette.white,
  iconColor = "#F79233",
}) => {
  const buttonSize = moderateScale(size);
  const iconSize = moderateScale(22);

  return (
    <View style={styles.shadowWrapper}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.container,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor,
          },
        ]}
      >
      <View style={styles.iconContainer}>
        {icon ? (
          <AppImage
            source={icon}
            style={[
              styles.icon,
              {
                width: iconSize,
                height: iconSize,
                tintColor: iconColor,
              },
            ]}
            resizeMode="contain"
          />
        ) : (
          <View
            style={[
              styles.plusIcon,
              {
                width: iconSize,
                height: iconSize,
              },
            ]}
          >
            <View
              style={[
                styles.plusLine,
                {
                  width: moderateScale(2),
                  height: iconSize,
                  backgroundColor: iconColor,
                },
              ]}
            />
            <View
              style={[
                styles.plusLine,
                {
                  width: iconSize,
                  height: moderateScale(2),
                  backgroundColor: iconColor,
                  position: "absolute",
                },
              ]}
            />
          </View>
        )}
      </View>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingActionButton;

const styles = StyleSheet.create({
  shadowWrapper: {
    // Outer shadow layer for 3D effect
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 15,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    // Inner shadow and border for depth
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    // Additional shadow on the button itself
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: moderateScale(22),
    height: moderateScale(22),
  },
  plusIcon: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  plusLine: {
    position: "absolute",
  },
});

