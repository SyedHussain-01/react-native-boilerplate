import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppText from "../common/AppText";

type SubscriptionPlanCardProps = {
  title: string;
  price: string;
  subtitle?: string;
  priceSubtitle?: string;
  isSelected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  title,
  price,
  subtitle,
  priceSubtitle,
  isSelected = false,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected ? styles.selectedContainer : styles.unselectedContainer,
        disabled ? styles.disabledContainer : null,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <AppText
          weight="SemiBold"
          size="md"
          style={StyleSheet.flatten([
            styles.title,
            isSelected ? styles.selectedText : styles.unselectedText,
          ])}
        >
          {title}
        </AppText>
        {subtitle && (
          <AppText
            weight="Regular"
            size="sm"
            style={StyleSheet.flatten([
              styles.subtitle,
              isSelected ? styles.selectedText : styles.unselectedSubtitle,
            ])}
          >
            {subtitle}
          </AppText>
        )}
      </View>
      <View style={styles.rightSection}>
        <AppText
          weight="SemiBold"
          size="md"
          style={StyleSheet.flatten([
            styles.price,
            isSelected ? styles.selectedText : styles.unselectedText,
          ])}
        >
          {price}
        </AppText>
        {priceSubtitle && (
          <AppText
            weight="Regular"
            size="sm"
            style={StyleSheet.flatten([
              styles.priceSubtitle,
              isSelected ? styles.selectedText : styles.unselectedSubtitle,
            ])}
          >
            {priceSubtitle}
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SubscriptionPlanCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(16),
    borderRadius: scale(12),
    height: verticalScale(78),
    borderWidth: 1,
  },
  selectedContainer: {
    backgroundColor: palette.orangeLight,
    borderColor: "#E9EAEB",
  },
  unselectedContainer: {
    backgroundColor: palette.white,
    borderColor: "#E9EAEB",
  },
  disabledContainer: {
    opacity: 0.55,
  },
  leftSection: {
    flexDirection: "column",
    gap: verticalScale(12),
  },
  rightSection: {
    flexDirection: "column",
    gap: verticalScale(12),
    alignItems: "flex-end",
  },
  title: {
    fontSize: moderateScale(16),
  },
  subtitle: {
    fontSize: moderateScale(12),
  },
  price: {
    fontSize: moderateScale(16),
  },
  priceSubtitle: {
    fontSize: moderateScale(12),
  },
  selectedText: {
    color: "#080A0D",
  },
  unselectedText: {
    color: "#080A0D",
  },
  unselectedSubtitle: {
    color: "#717680",
  },
});

