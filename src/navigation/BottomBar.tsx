import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import React, { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { dummyUserProfile } from "../constants/dummyUiData";
import { remotePlaceholders } from "../constants/remotePlaceholders";
import AppImage from "../components/common/AppImage";
import AppText from "../components/common/AppText";
import MainHeader from "../components/common/MainHeader";
import Placeholder1 from "../screens/main/Placeholder1";
import Placeholder2 from "../screens/main/Placeholder2";
import Placeholder3 from "../screens/main/Placeholder3";
import Placeholder4 from "../screens/main/Placeholder4";
import { palette } from "../theme";
import { MainStackParamList, MainTabParamList } from "../types/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabItem = {
  routeName: keyof MainTabParamList;
  label: string;
  icon: any;
};

const tabItems: TabItem[] = [
  {
    routeName: "Placeholder1",
    label: "Placeholder1",
    icon: remotePlaceholders.tabHome,
  },
  {
    routeName: "Placeholder2",
    label: "Placeholder2",
    icon: remotePlaceholders.tabProgress,
  },
  {
    routeName: "Placeholder3",
    label: "Placeholder3",
    icon: remotePlaceholders.tabMeals,
  },
  {
    routeName: "Placeholder4",
    label: "Placeholder4",
    icon: remotePlaceholders.tabResources,
  },
];

const BottomBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const [activeTabName, setActiveTabName] =
    useState<keyof MainTabParamList>("Placeholder1");
  const [tabNavigation, setTabNavigation] = useState<any>(null);

  const bottomBarBottom = Math.max(insets.bottom, verticalScale(20));

  const handleNotificationPress = useCallback(() => {
    navigation.navigate("Notifications");
  }, [navigation]);

  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const renderSettings = () => {
    return (
      <TouchableOpacity
        onPress={handleSettings}
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
    );
  };

  return (
    <SafeAreaView edges={[]} style={{ flex: 1 }}>
      <MainHeader
        userName={dummyUserProfile.fullName}
        avatarUrl={dummyUserProfile.avatar}
        greeting={false}
        screenName={activeTabName}
        profile={false}
        onNotificationPress={handleNotificationPress}
        customIcons={renderSettings()}
      />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
        tabBar={(props) => {
          if (!tabNavigation) {
            setTabNavigation(props.navigation);
          }
          const currentRoute = props.state.routes[props.state.index];
          if (currentRoute.name !== activeTabName) {
            setActiveTabName(currentRoute.name as keyof MainTabParamList);
          }
          return null;
        }}
      >
        <Tab.Screen name="Placeholder1" component={Placeholder1} />
        <Tab.Screen name="Placeholder2" component={Placeholder2} />
        <Tab.Screen name="Placeholder3" component={Placeholder3} />
        <Tab.Screen name="Placeholder4" component={Placeholder4} />
      </Tab.Navigator>

      <BlurView
        intensity={10}
        experimentalBlurMethod="dimezisBlurView"
        style={[
          styles.blurViewContainer,
          {
            bottom: 0,
            top: undefined,
            maxHeight: bottomBarBottom,
            height: bottomBarBottom,
          },
        ]}
        pointerEvents="none"
      />

      <View
        style={[
          styles.floatingTabBarContainer,
          {
            bottom: bottomBarBottom,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.shadowContainer}>
          <View
            style={[
              styles.tabBar,
              {
                paddingVertical: verticalScale(12),
                paddingHorizontal: scale(6),
              },
            ]}
          >
            <View style={styles.menuContainer}>
              {tabItems.map((tabItem) => {
                const isFocused = activeTabName === tabItem.routeName;

                const onPress = () => {
                  if (tabNavigation) {
                    tabNavigation.navigate(tabItem.routeName);
                  }
                };

                const activeColor = "#F79233";
                const inactiveColor = "#A4A7AE";

                return (
                  <TouchableOpacity
                    key={tabItem.routeName}
                    style={styles.tabItem}
                    onPress={onPress}
                    activeOpacity={0.7}
                  >
                    <AppImage
                      source={tabItem.icon}
                      style={[
                        styles.tabIcon,
                        {
                          tintColor: isFocused ? activeColor : inactiveColor,
                        },
                      ]}
                      resizeMode="contain"
                    />
                    <AppText
                      weight={isFocused ? "Medium" : "Regular"}
                      size="xs"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={StyleSheet.flatten([
                        styles.tabLabel,
                        {
                          color: isFocused ? activeColor : inactiveColor,
                        },
                      ])}
                    >
                      {tabItem.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BottomBar;

const styles = StyleSheet.create({
  blurViewContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 997,
    elevation: 997,
  },
  floatingTabBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
    pointerEvents: "box-none",
  },
  shadowContainer: {
    marginHorizontal: scale(20),
    backgroundColor: "transparent",
  },
  tabBar: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#EAEBEB",
    borderRadius: scale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 15,
    overflow: "visible",
    zIndex: 999,
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabItem: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(6),
  },
  tabIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  tabLabel: {
    fontSize: moderateScale(11),
    textAlign: "center",
    width: "100%",
  },
});
