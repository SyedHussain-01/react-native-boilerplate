import { AntDesign, Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import { palette } from "../../theme";
import AppText from "./AppText";

type ToastProps = {
  text1?: string;
  type?: "success" | "error";
};

export const SuccessToast: React.FC<ToastProps> = ({ text1 }) => {
  const handleClose = () => {
    Toast.hide();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, styles.successIconCircle]}>
          <AntDesign name="check" size={moderateScale(16)} color={palette.white} />
        </View>
      </View>
      <AppText weight="Medium" size="sm" style={styles.message} numberOfLines={2}>
        {text1 || "Success!"}
      </AppText>
      <View style={styles.closeContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Feather name="x" size={moderateScale(16)} color={palette.textDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ErrorToast: React.FC<ToastProps> = ({ text1 }) => {
  const handleClose = () => {
    Toast.hide();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, styles.errorIconCircle]}>
          <Feather name="x" size={moderateScale(16)} color={palette.white} />
        </View>
      </View>
      <AppText weight="Medium" size="sm" style={styles.message} numberOfLines={2}>
        {text1 || "Error occurred!"}
      </AppText>
      <View style={styles.closeContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Feather name="x" size={moderateScale(16)} color={palette.textDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: scale(6),
    padding: scale(10),
    gap: scale(16),
    minHeight: verticalScale(52),
    marginHorizontal: scale(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: moderateScale(32),
    height: moderateScale(32),
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
  },
  successIconCircle: {
    backgroundColor: "#F79233",
  },
  errorIconCircle: {
    backgroundColor: "#D7143A",
  },
  message: {
    flex: 1,
    color: palette.contentTitle,
    fontSize: moderateScale(14),
  },
  closeContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    width: moderateScale(24),
    height: moderateScale(24),
    justifyContent: "center",
    alignItems: "center",
  },
});

