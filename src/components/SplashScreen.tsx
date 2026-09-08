import React, { useEffect } from "react";
import { StatusBar, StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scale, verticalScale } from "react-native-size-matters";
import { palette } from "../theme";
import { remotePlaceholders } from "../constants/remotePlaceholders";
import AppImage from "./common/AppImage";

const FADE_OUT_DURATION_MS = 350;

type SplashScreenProps = {
  exiting?: boolean;
  onExitComplete?: () => void;
};

const SplashScreen: React.FC<SplashScreenProps> = ({
  exiting = false,
  onExitComplete,
}) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!exiting) return;

    opacity.value = withTiming(0, { duration: FADE_OUT_DURATION_MS }, (finished) => {
      if (finished && onExitComplete) {
        runOnJS(onExitComplete)();
      }
    });
  }, [exiting, onExitComplete, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.primary} />
      <AppImage
        source={remotePlaceholders.appLogo}
        style={styles.logo}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: palette.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: scale(225),
    height: verticalScale(114),
    marginTop: verticalScale(2.5),
  },
});

export default SplashScreen;
