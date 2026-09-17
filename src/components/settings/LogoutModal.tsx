import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import AppText from "../common/AppText";
import { palette } from "../../theme";

type LogoutModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Defaults match the standard log-out copy. */
  title?: string;
  message?: string;
  /** Use destructive styling for the confirm action (e.g. delete account). */
  tone?: "default" | "danger";
};

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = "Log Out",
  message = "Are you sure you want to log out from the app?",
  tone = "default",
}) => {
  const isDanger = tone === "danger";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            isDanger ? styles.modalContainerDanger : null,
          ]}
        >
          {/* Title */}
          <View style={styles.contentContainer}>
            <AppText weight="SemiBold" size="lg" style={styles.title}>
              {title}
            </AppText>
            <AppText weight="Regular" size="sm" style={styles.message}>
              {message}
            </AppText>
          </View>

          {/* Horizontal Separator */}
          <View style={styles.horizontalSeparator} />

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <AppText weight="Medium" size="sm" style={styles.noButtonText}>
                {isDanger ? "Cancel" : "No"}
              </AppText>
            </TouchableOpacity>

            {/* Vertical Separator */}
            <View style={styles.verticalSeparator} />

            <TouchableOpacity
              style={styles.button}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <AppText
                weight={isDanger ? "SemiBold" : "Regular"}
                size="sm"
                style={[
                  styles.yesButtonText,
                  isDanger ? styles.yesButtonTextDanger : undefined,
                ]}
              >
                {isDanger ? "Delete" : "Yes"}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(16),
  },
  modalContainer: {
    backgroundColor: palette.white,
    borderRadius: scale(14),
    width: scale(270),
    overflow: "hidden",
  },
  modalContainerDanger: {
    width: scale(300),
    borderRadius: scale(16),
  },
  contentContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(12),
    alignItems: "center",
    gap: verticalScale(8),
  },
  title: {
    color: palette.contentTitle,
    fontSize: moderateScale(18),
    textAlign: "center",
  },
  message: {
    color: palette.contentBody,
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  horizontalSeparator: {
    height: 0.5,
    backgroundColor: "#E9EAEB",
    width: "100%",
  },
  buttonsContainer: {
    flexDirection: "row",
    height: verticalScale(44),
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  verticalSeparator: {
    width: 0.5,
    height: "100%",
    backgroundColor: "#E9EAEB",
  },
  noButtonText: {
    color: palette.contentBody,
    fontSize: moderateScale(14),
  },
  yesButtonText: {
    color: "#25975f", // Brand primary color from Figma
    fontSize: moderateScale(14),
  },
  yesButtonTextDanger: {
    color: palette.statusRed,
  },
});
