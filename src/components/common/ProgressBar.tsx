import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppText from "./AppText";

type ProgressBarProps = {
  label?: string;
  current: number;
  total: number;
  unit?: string;
  color?: string;
  gradientColors?: string[];
  backgroundColor?: string;
  height?: number;
  showValue?: boolean;
  showHeader?: boolean;
  labelWeight?: "Regular" | "Medium" | "SemiBold" | "Bold";
  valueWeight?: "Regular" | "Medium" | "SemiBold" | "Bold";
  labelSize?: "xs" | "sm" | "md" | "base";
  valueSize?: "xs" | "sm" | "md" | "base";
  labelColor?: string;
  valueColor?: string;
  containerStyle?: ViewStyle;
  padding?: number;
  gap?: number;
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  animated?: boolean;
  animationDuration?: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  total,
  unit = "",
  color = palette.darkBlue,
  gradientColors,
  backgroundColor = "#FAFAFA",
  height = 4,
  showValue = true,
  showHeader = true,
  labelWeight = "Medium",
  valueWeight = "Medium",
  labelSize = "xs",
  valueSize = "xs",
  labelColor = palette.textDark,
  valueColor = "#717680",
  containerStyle,
  padding = 8,
  gap = 6,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 0 },
  animated = true,
  animationDuration = 800,
}) => {
  const percentage = Math.min((current / total) * 100, 100);
  const valueText = unit ? `${current}/${total} ${unit}` : `${current}/${total}`;

  // Animated width value
  const progressWidth = useSharedValue(animated ? 0 : percentage);

  // Animate on mount and when percentage changes
  useEffect(() => {
    if (animated) {
      progressWidth.value = withTiming(percentage, {
        duration: animationDuration,
      });
    } else {
      progressWidth.value = percentage;
    }
  }, [percentage, animated, animationDuration]);

  // Animated style for the progress bar
  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const renderProgressBar = () => {
    const baseProgressBarStyle = [
      styles.progressBar,
      {
        height: verticalScale(height),
      },
      animatedProgressStyle,
    ];

    if (gradientColors && gradientColors.length > 0) {
      return (
        <Animated.View style={baseProgressBarStyle}>
          <LinearGradient
            colors={gradientColors as [string, string, ...string[]]}
            start={gradientStart}
            end={gradientEnd}
            style={styles.gradientFill}
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          baseProgressBarStyle,
          {
            backgroundColor: color,
          },
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { padding: scale(padding), gap: verticalScale(gap) }, containerStyle]}>
      {showHeader && label && (
        <View style={styles.header}>
          <AppText weight={labelWeight} size={labelSize} style={{ color: labelColor }}>
            {label}
          </AppText>
          {showValue && (
            <AppText weight={valueWeight} size={valueSize} style={{ color: valueColor }}>
              {valueText}
            </AppText>
          )}
        </View>
      )}
      <View style={[styles.progressBarContainer, { backgroundColor, height: verticalScale(height) }]}>
        {renderProgressBar()}
      </View>
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(6),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  progressBarContainer: {
    borderRadius: scale(8),
    overflow: "hidden",
  },
  progressBar: {
    borderRadius: scale(8),
  },
  gradientFill: {
    width: "100%",
    height: "100%",
    borderRadius: scale(8),
  },
});

