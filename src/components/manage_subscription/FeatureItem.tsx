import React from "react";
import { StyleSheet, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import AppImage from "../common/AppImage";
import AppText from "../common/AppText";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

type FeatureItemProps = {
  text: string;
};

const FeatureItem: React.FC<FeatureItemProps> = ({ text }) => {
  return (
    <View style={styles.container}>
      <AppImage
        source={remotePlaceholders.check}
        style={styles.checkIcon}
        resizeMode="contain"
      />
      <AppText weight="Regular" size="sm" style={styles.text}>
        {text}
      </AppText>
    </View>
  );
};

export default FeatureItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  checkIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  text: {
    flex: 1,
    color: "#080A0D",
  },
});

