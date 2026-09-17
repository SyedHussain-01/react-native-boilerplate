import React from "react";
import { StyleSheet, Text, TextProps, TextStyle, StyleProp } from "react-native";
import { moderateScale } from "react-native-size-matters";

type FontWeight =
  | "ExtraLight"
  | "Light"
  | "Regular"
  | "Medium"
  | "SemiBold"
  | "Bold"
  | "ExtraBold";

type FontSize =
  | "xs"      // 12px
  | "sm"      // 13px
  | "md"      // 14px
  | "base"    // 16px (default - most used)
  | "lg"      // 18px
  | "xl"      // 20px
  | "2xl"     // 24px
  | "3xl"     // 30px
  | "4xl"     // 32px
  | "5xl";    // 36px

type AppTextProps = TextProps & {
  weight?: FontWeight;
  italic?: boolean;
  size?: FontSize;
  style?: StyleProp<TextStyle>;
};

const getFontSize = (size: FontSize): number => {
  const sizeMap: Record<FontSize, number> = {
    xs: 10,
    sm: 12,
    base: 12,
    md: 14,
    lg: 16,
    xl: 18,
    "2xl": 24,
    "3xl": 30,
    "4xl": 32,
    "5xl": 36,
  };
  return moderateScale(sizeMap[size]);
};

const AppText: React.FC<AppTextProps> = ({
  weight = "Regular",
  italic = false,
  size = "base",
  style,
  children,
  ...rest
}) => {
  const getFontFamily = (): string => {
    const fontName = `PlusJakartaSans-${weight}${italic ? "Italic" : ""}`;
    return fontName;
  };

  // Extract fontSize from style if provided (allows override)
  const customFontSize = style && 'fontSize' in style ? style.fontSize : undefined;
  const fontSize = customFontSize !== undefined ? customFontSize : getFontSize(size);

  // Remove fontSize from style if it exists, since we're setting it explicitly
  const restStyle = style
    ? Object.fromEntries(
        Object.entries(style).filter(([key]) => key !== 'fontSize')
      ) as TextStyle
    : undefined;

  // Suppress highlighting on iOS when text is pressable
  const suppressHighlighting = rest.onPress !== undefined;

  return (
    <Text
      style={[
        styles.base,
        { fontFamily: getFontFamily(), fontSize },
        restStyle,
      ]}
      suppressHighlighting={suppressHighlighting}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: "PlusJakartaSans-Regular",
  },
});

export default AppText;

