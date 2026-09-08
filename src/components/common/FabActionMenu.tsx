import { BlurView } from "expo-blur";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppImage from "./AppImage";
import AppText from "./AppText";
import FloatingActionButton from "./FloatingActionButton";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

type FabActionMenuProps = {
  visible: boolean;
  onClose: () => void;
  onViewMealLog?: () => void;
  onLogMeal?: () => void;
  onAdd?: () => void;
  fabBottomPosition?: number;
  fabRightPosition?: number;
};

const FabActionMenu: React.FC<FabActionMenuProps> = ({
  visible,
  onClose,
  onViewMealLog,
  onLogMeal,
  onAdd,
  fabBottomPosition = 0,
  fabRightPosition = 0,
}) => {
  const handleViewMealLog = () => {
    onViewMealLog?.();
    onClose();
  };

  const handleLogMeal = () => {
    onLogMeal?.();
    onClose();
  };

  const handleAdd = () => {
    onAdd?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.blurContainer}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <BlurView intensity={80} experimentalBlurMethod="dimezisBlurView" style={styles.contentContainer}>
              {/* View Meal Log Button - Top Right */}
              <View style={styles.viewMealLogContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleViewMealLog}
                  activeOpacity={0.7}
                >
                  <AppImage
                    source={remotePlaceholders.fabViewMeal}
                    style={styles.actionIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <AppText weight="Regular" size="xs" style={styles.actionLabel}>
                  View Meal Log
                </AppText>
              </View>

              {/* Log Meal Button - Middle Left */}
              <View style={styles.logMealContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleLogMeal}
                  activeOpacity={0.7}
                >
                  <AppImage
                    source={remotePlaceholders.fabLogMeal}
                    style={styles.actionIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <AppText weight="Regular" size="xs" style={styles.actionLabel}>
                  Log Meal
                </AppText>
              </View>

              {/* Add Button - Bottom Right (Main FAB) - Positioned to align with main FAB */}
              <View
                style={[
                  styles.fabContainer,
                  {
                    bottom: fabBottomPosition,
                    right: fabRightPosition,
                  },
                ]}
              >
                <FloatingActionButton
                  onPress={handleAdd}
                  backgroundColor="#F79233"
                  iconColor={palette.white}
                />
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default FabActionMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 1000,
    elevation: 1000,
  },
  blurContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 1001,
    elevation: 1001,
  },
  contentContainer: {
    width: moderateScale(235),
    height: moderateScale(330),
    position: "relative",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    borderTopLeftRadius: moderateScale(100),
    borderBottomLeftRadius: moderateScale(30),
    overflow: "hidden",
    zIndex: 1002,
    elevation: 1002,
  },
  viewMealLogContainer: {
    alignItems: "center",
    gap: verticalScale(8),
    position: "absolute",
    top: verticalScale(20),
    right: scale(20),
  },
  actionButton: {
    width: moderateScale(62),
    height: moderateScale(62),
    borderRadius: moderateScale(31),
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
  },
  actionIcon: {
    width: moderateScale(26),
    height: moderateScale(26),
  },
  actionLabel: {
    color: palette.textDark,
    fontSize: moderateScale(12),
    textAlign: "center",
  },
  logMealContainer: {
    alignItems: "center",
    gap: verticalScale(8),
    position: "absolute",
    left: scale(27),
    top: verticalScale(105),
  },
  fabContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    // The FAB is positioned at bottom: 0, right: 0, so its center is at (buttonSize/2, buttonSize/2)
    // from the bottom-right corner. We need to account for this in positioning.
  },
});

