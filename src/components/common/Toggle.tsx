import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";
import { palette } from "../../theme";

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const Toggle: React.FC<ToggleProps> = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        value && styles.containerActive,
      ]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.thumb,
          value && styles.thumbActive,
        ]}
      />
    </TouchableOpacity>
  );
};

export default Toggle;

const styles = StyleSheet.create({
  container: {
    width: moderateScale(32.727),
    height: moderateScale(20),
    borderRadius: moderateScale(16),
    backgroundColor: palette.background,
    justifyContent: "center",
    paddingHorizontal: moderateScale(2),
  },
  containerActive: {
    backgroundColor: palette.darkBlue,
  },
  thumb: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: palette.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    alignSelf: "flex-start",
  },
  thumbActive: {
    alignSelf: "flex-end",
  },
});

