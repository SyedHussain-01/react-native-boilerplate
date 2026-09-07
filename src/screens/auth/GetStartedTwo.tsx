import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale } from "react-native-size-matters";
import GetStartedContent from "../../components/get_started";
import { palette } from "../../theme";
import { AuthStackParamList } from "../../types/navigation";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

const GetStarted = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleNext = () => {
    // Navigate to next onboarding step
    navigation.navigate("GetStartedThree");
  };

  const handleSkip = () => {
    // Navigate to skip onboarding
    // You can customize this navigation as needed
    navigation.navigate("GetStartedThree");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        <View style={[styles.paginationDot, styles.paginationDotInactive]} />
        <View style={[styles.paginationDot, styles.paginationDotActive]} />
        <View style={[styles.paginationDot, styles.paginationDotInactive]} />
      </View>

      <GetStartedContent
        image={remotePlaceholders.getStartedAltHero}
        logoImage={remotePlaceholders.logoWhite}
        heading={`Overview of the ${'\n'}product`}
        description="Introduce your product here. Replace this placeholder copy with a short overview of what the app does and why it matters to the user."
        onPressNext={handleNext}
        onPressSkip={handleSkip}
      />
    </SafeAreaView>
  );
};

export default GetStarted;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: verticalScale(12),
    paddingRight: scale(24),
    paddingBottom: verticalScale(8),
    gap: scale(8),
  },
  paginationDot: {
    width: scale(8),
    height: verticalScale(8),
    borderRadius: scale(4),
  },
  paginationDotActive: {
    backgroundColor: palette.orange,
  },
  paginationDotInactive: {
    backgroundColor: palette.lightGray,
  },
});