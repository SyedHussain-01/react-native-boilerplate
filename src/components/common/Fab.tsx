import { MainStackParamList } from "@/src/types/navigation";
import { Feather } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useReducer } from "react";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  AnimatedStyle,
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming
} from "react-native-reanimated";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppImage from "./AppImage";
import AppText from "./AppText";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const { width } = Dimensions.get("window");

const FAB_SIZE = 62;
const BUTTON_SIZE = 62; // Size of action buttons
const circleScale = parseFloat((width / FAB_SIZE).toFixed(1));
const circleSize = circleScale * FAB_SIZE;
const dist = (circleSize / 2 - FAB_SIZE) * 0.4; // 40% distance to keep buttons more inside the circle
const viewMealLogDist = dist * 1.05; // 5% more distance for View Meal Log to move it upwards
const slightLeftOffset = 10; // Slight left offset
const slightUpOffset = 20; // Slight up offset
const logMealLeftOffset = 60; // Additional left offset for Log Meal button
const leftOffset = moderateScale(20); // Additional left offset to move buttons more to the left

type ActionButtonProps = {
  icon: "view_meal" | "log_meal";
  style: AnimatedStyle<ViewStyle>;
  onPress?: () => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  icon = "view_meal",
  style,
  onPress,
}) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const handlePress = () => {
    console.log("handlePress", icon);
    // Call the onPress callback first (which closes the menu)
    if (onPress) {
      onPress();
    }
    // Then navigate after a small delay to ensure menu closes first
    setTimeout(() => {
      if (icon === "view_meal") {
        navigation.navigate({ name: "ViewLogMeal", params: {} });
      } else {
        navigation.navigate({ name: "LogMeal", params: {} });
      }
    }, 100);
  };
  // Apply animated style directly to TouchableOpacity for proper hit testing
  return (
    <AnimatedTouchableOpacity
      style={[styles.actionBtn, style]}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
    >
      <View style={styles.actionButton}>
        <AppImage
          source={
            icon === "view_meal"
              ? remotePlaceholders.fabViewMeal
              : remotePlaceholders.fabLogMeal
          }
          style={styles.actionIcon}
          resizeMode="contain"
        />
      </View>
      <AppText weight="Regular" size="xs" style={styles.actionLabel}>
        {icon === "view_meal" ? "View Meal Log" : "Log Meal"}
      </AppText>
    </AnimatedTouchableOpacity>
  );
};

const Fab: React.FC = () => {
  const [open, toggle] = useReducer((s: boolean) => !s, false);

  const handleViewMealLog = () => {
    toggle(); // Then close the menu
  };

  const handleLogMeal = () => {
    toggle(); // Then close the menu
  };

  const rotation = useDerivedValue(() => {
    return withTiming(open ? "0deg" : "135deg");
  }, [open]);

  const progress = useDerivedValue(() => {
    return open ? withTiming(1) : withTiming(0);
  });

  const translation = useDerivedValue(() => {
    return open
      ? withTiming(1, { duration: 300 })
      : withTiming(0, { duration: 300 });
  });

  const fabStyles = useAnimatedStyle(() => {
    const rotate = rotation.value;
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [palette.glass, palette.orangeLight]
    );
    return {
      transform: [{ rotate }],
      backgroundColor,
    };
  });

  const iconRotation = useAnimatedStyle(() => {
    const rotate = rotation.value;
    // Counter-rotate the icon so it appears straight
    return {
      transform: [{ rotate: `-${rotate}` }],
    };
  });

  const scalingStyles = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0, circleScale]);
    return {
      transform: [{ scale }],
    };
  });

  // Style for View Meal Log button - positioned above FAB, moved down a bit and slightly to the left
  // Using absolute positioning instead of transform for proper hit testing
  const viewMealLogStyle = useAnimatedStyle(() => {
    const bottom = interpolate(translation.value, [0, 1], [0, viewMealLogDist - slightUpOffset], {
      extrapolateLeft: Extrapolate.CLAMP,
    });
    const scale = interpolate(progress.value, [0, 1], [0, 1], {
      extrapolateLeft: Extrapolate.CLAMP,
    });
    // Use threshold to prevent vanishing on iOS
    const opacity = progress.value > 0.05 ? 1 : 0;
    return {
      bottom: FAB_SIZE + bottom,
      left: (FAB_SIZE - BUTTON_SIZE) / 2 - slightLeftOffset, // Slightly to the left
      transform: [{ scale }],
      opacity,
    };
  }, [open]);

  // Style for Log Meal button - positioned to the left of FAB, moved left and slightly upwards
  // Using absolute positioning instead of transform for proper hit testing
  const logMealStyle = useAnimatedStyle(() => {
    const left = interpolate(translation.value, [0, 1], [0, -dist], {
      extrapolateLeft: Extrapolate.CLAMP,
    });
    const scale = interpolate(progress.value, [0, 1], [0, 1], {
      extrapolateLeft: Extrapolate.CLAMP,
    });
    // Use threshold to prevent vanishing on iOS
    const opacity = progress.value > 0.05 ? 1 : 0;
    return {
      left: left - logMealLeftOffset, // Move further to the left
      top: (FAB_SIZE - BUTTON_SIZE) / 2 - slightUpOffset, // Slightly upwards
      transform: [{ scale }],
      opacity,
    };
  }, [open]);
  return (
    <View style={styles.container}>
      <View style={styles.fabContainer}>
        <Animated.View style={[styles.expandingCircle, scalingStyles]} />
        <TouchableWithoutFeedback onPress={toggle}>
          <Animated.View style={[styles.fab, fabStyles]}>
            <Animated.View style={iconRotation}>
              <Feather
                name={open ? "x" : "plus"}
                color={open ? palette.white : palette.orangeLight}
                size={moderateScale(32)}
              />
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
        <ActionButton
          style={viewMealLogStyle}
          icon="view_meal"
          onPress={handleViewMealLog}
        />
        <ActionButton
          style={logMealStyle}
          icon="log_meal"
          onPress={handleLogMeal}
        />
      </View>
    </View>
  );
};

export default Fab;

const CircleStyle: ViewStyle = {
  width: FAB_SIZE,
  height: FAB_SIZE,
  borderRadius: FAB_SIZE / 2,
  justifyContent: "center",
  alignItems: "center",
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10000,
  },
  fabContainer: {
    position: "absolute",
    bottom: moderateScale(135),
    right: moderateScale(40),
  },
  fab: {
    ...CircleStyle,
    // backgroundColor: palette.glass,
    transform: [{ rotate: "135deg" }],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
  },
  expandingCircle: {
    ...CircleStyle,
    backgroundColor: palette.glass,
    position: "absolute",
    zIndex: -1,
  },
  actionBtn: {
    position: "absolute",
    zIndex: 10000,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  actionButtonTouchable: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  actionButton: {
    width: moderateScale(62),
    height: moderateScale(62),
    borderRadius: moderateScale(31),
    backgroundColor: palette.glass,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
  },
  actionIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
  },
  actionLabel: {
    color: palette.textDark,
    textAlign: "center",
    marginTop: verticalScale(4),
  },
});
