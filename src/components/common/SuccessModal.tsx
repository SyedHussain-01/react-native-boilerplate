import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppText from "./AppText";
import Button from "./Button";

type SuccessModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonPress?: () => void;
};

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title = "Success!",
  message = "Your account has been created successfully!",
  buttonText = "Continue",
  onButtonPress,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible && animationRef.current) {
      animationRef.current.play();
    }
  }, [visible]);

  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Lottie Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              ref={animationRef}
              source={require("../../assets/lottie/success.json")}
              style={styles.animation}
              autoPlay
              loop={false}
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <AppText weight="Bold" size="5xl" style={styles.title}>
              {title}
            </AppText>
            <AppText weight="Regular" size="base" style={styles.message}>
              {message}
            </AppText>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={buttonText}
              variant="primary"
              fullWidth
              onPress={handleButtonPress}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    paddingHorizontal: scale(16),
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(30),
  },
  animationContainer: {
    width: moderateScale(150),
    height: moderateScale(150),
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    gap: verticalScale(15),
  },
  title: {
    color: palette.contentTitle,
    textAlign: "center",
    letterSpacing: -2,
  },
  message: {
    color: palette.contentBody,
    textAlign: "center",
    paddingHorizontal: scale(16),
  },
  buttonContainer: {
    width: "100%",
    marginTop: verticalScale(27),
  },
});

