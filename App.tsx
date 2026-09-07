import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { Modal, Platform, StatusBar, StyleSheet, View } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import Toast from "react-native-toast-message";
import SplashScreen from "./src/components/SplashScreen";
import RootNavigator from "./src/navigation/RootNavigator";
import { navigationRef } from "./src/navigation/navigationRef";
import { QueryProvider } from "./src/providers/QueryProvider";
import { palette, theme } from "./src/theme";
import { toastConfig } from "./src/utils/toast";

enableScreens();

ExpoSplashScreen.preventAutoHideAsync();

const SPLASH_BG = palette.primary;
const SPLASH_DURATION_MS = 5000;
const SPLASH_FADE_OUT_MS = 350;
const SPLASH_PAINT_DELAY_MS = 100;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [exitSplash, setExitSplash] = useState(false);
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  const [fontsLoaded, fontError] = useFonts({});
  const fontsReady = fontsLoaded || !!fontError;

  const handleSplashExitComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      ExpoSplashScreen.hideAsync();
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDurationElapsed(true);
    }, SPLASH_DURATION_MS - SPLASH_FADE_OUT_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!minDurationElapsed || !fontsReady || exitSplash) return;

    const paintTimer = setTimeout(() => {
      setExitSplash(true);
    }, SPLASH_PAINT_DELAY_MS);

    return () => clearTimeout(paintTimer);
  }, [minDurationElapsed, fontsReady, exitSplash]);

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            <View style={styles.root}>
              {fontsReady ? (
                <NavigationContainer ref={navigationRef} theme={theme.navigation}>
                  <BottomSheetModalProvider>
                    <StatusBar
                      barStyle={showSplash ? "light-content" : "dark-content"}
                      backgroundColor="transparent"
                      translucent
                    />
                    <RootNavigator />
                  </BottomSheetModalProvider>
                </NavigationContainer>
              ) : null}
              {showSplash ? (
                <Modal
                  visible={showSplash}
                  animationType="none"
                  transparent
                  statusBarTranslucent
                  hardwareAccelerated
                  {...(Platform.OS === "ios"
                    ? { presentationStyle: "overFullScreen" as const }
                    : {})}
                >
                  <SplashScreen
                    exiting={exitSplash}
                    onExitComplete={handleSplashExitComplete}
                  />
                </Modal>
              ) : null}
            </View>
            <Toast config={toastConfig} />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SPLASH_BG,
  },
});
