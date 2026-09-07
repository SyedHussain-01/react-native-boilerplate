import React from "react";
import { ImageBackground, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

type Props = {
  children: React.ReactNode;
  edges?: import("react-native-safe-area-context").Edge[];
  style?: object;
  type?: "one" | "two";
  greeting?: boolean;
  screenName?: string;
};

const MainWrapper: React.FC<Props> = ({
  children,
  edges = [],
  style,
  type = "one",
}) => {
  const backgroundImage =
    type === "two"
      ? remotePlaceholders.backgroundTwo
      : remotePlaceholders.backgroundOne;

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default MainWrapper;
