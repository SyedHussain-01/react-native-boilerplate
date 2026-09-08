import React from "react";
import {
  ActivityIndicator,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle
} from "react-native";
import { moderateScale, scale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppText from "./AppText";

type ButtonVariant = "primary" | "outlined" | "text";

type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  flex?: number;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  isLoading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  fullWidth = false,
  flex,
  style,
  textStyle,
  disabled,
  leftIcon,
  isLoading = false,
  ...rest
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: moderateScale(14),
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
    };

    if (leftIcon) {
      baseStyle.flexDirection = "row";
      baseStyle.gap = scale(8);
    }

    if (flex !== undefined) {
      baseStyle.flex = flex;
    } else if (fullWidth) {
      baseStyle.width = "100%";
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: disabled ? palette.lightGray : palette.darkBlue,
        };
      case "outlined":
        return {
          ...baseStyle,
          backgroundColor: palette.white,
          borderWidth: 1,
          borderColor: disabled ? palette.lightGray : palette.darkBlue,
        };
      case "text":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          paddingVertical: moderateScale(8),
        };
      default:
        return baseStyle;
    }
  };

  const getTextWeight = (): "Regular" | "SemiBold" => {
    return variant === "text" ? "Regular" : "SemiBold";
  };

  const getTextColor = (): string => {
    switch (variant) {
      case "primary":
        return disabled ? palette.textGray : palette.white;
      case "outlined":
        return disabled ? palette.textGray : palette.darkBlue;
      case "text":
        return disabled ? palette.textGray : palette.darkBlue;
      default:
        return palette.white;
    }
  };

  const getMergedTextStyle = (): TextStyle => {
    return {
      color: getTextColor(),
      ...textStyle,
    };
  };

  const getActivityIndicatorColor = (): string => {
    return getTextColor();
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={getActivityIndicatorColor()}
        />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <AppText
            weight={getTextWeight()}
            size="md"
            style={getMergedTextStyle()}
          >
            {title}
          </AppText>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;

