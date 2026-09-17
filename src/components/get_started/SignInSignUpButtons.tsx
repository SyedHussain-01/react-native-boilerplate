import React from "react";
import { StyleSheet, View } from "react-native";
import { verticalScale } from "react-native-size-matters";
import AppText from "../common/AppText";
import Button from "../common/Button";
import { palette } from "../../theme";

type SignInSignUpButtonsProps = {
  onPressSignIn: () => void;
  onPressSignUp: () => void;
  onPressTerms?: () => void;
  onPressPrivacy?: () => void;
};

const SignInSignUpButtons: React.FC<SignInSignUpButtonsProps> = ({
  onPressSignIn,
  onPressSignUp,
  onPressTerms,
  onPressPrivacy,
}) => {
  return (
    <View style={styles.container}>
      <Button title="Sign In" onPress={onPressSignIn} />
      <Button title="Sign Up" onPress={onPressSignUp} />
      <View style={styles.legalRow}>
        <AppText
          weight="Regular"
          size="xs"
          style={styles.legal}
          onPress={onPressTerms}
        >
          Terms of Use
        </AppText>
        <AppText weight="Regular" size="xs" style={styles.legal}>
          {" · "}
        </AppText>
        <AppText
          weight="Regular"
          size="xs"
          style={styles.legal}
          onPress={onPressPrivacy}
        >
          Privacy Policy
        </AppText>
      </View>
    </View>
  );
};

export default SignInSignUpButtons;

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(10),
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  legal: {
    color: palette.contentBody,
  },
});
