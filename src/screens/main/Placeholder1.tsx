import React from "react";
import { StyleSheet, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import AppText from "../../components/common/AppText";
import MainWrapper from "../../components/common/MainWrapper";
import { palette } from "../../theme";

const Placeholder1 = () => {
  return (
    <MainWrapper edges={[]} type="one" style={styles.wrapper}>
      <View style={styles.content}>
        <AppText weight="SemiBold" size="2xl" style={styles.title}>
          Placeholder1
        </AppText>
      </View>
    </MainWrapper>
  );
};

export default Placeholder1;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(24),
  },
  title: {
    color: palette.contentTitle,
    textAlign: "center",
    lineHeight: moderateScale(30),
  },
});
