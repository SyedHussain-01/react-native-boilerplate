import React from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { verticalScale } from "react-native-size-matters";
import AppImage from "../common/AppImage";
import AppText from "../common/AppText";
import Button from "../common/Button";
import { palette } from "../../theme";

type GetStartedContentProps = {
  image: ImageSourcePropType | { uri: string };
  logoImage?: ImageSourcePropType | { uri: string };
  heading: string;
  description: string;
  onPressNext?: () => void;
  onPressSkip?: () => void;
  buttonComponent?: React.ReactNode;
};

const GetStartedContent: React.FC<GetStartedContentProps> = ({
  image,
  logoImage,
  heading,
  description,
  onPressNext,
  onPressSkip,
  buttonComponent,
}) => {
  return (
    <View style={styles.container}>
      {logoImage ? (
        <AppImage source={logoImage} style={styles.logo} resizeMode="contain" />
      ) : null}
      <AppImage source={image} style={styles.hero} resizeMode="cover" />
      <AppText weight="SemiBold" size="lg" style={styles.heading}>
        {heading}
      </AppText>
      <AppText weight="Regular" size="sm" style={styles.description}>
        {description}
      </AppText>
      {buttonComponent ? (
        buttonComponent
      ) : (
        <View style={styles.actions}>
          {onPressNext ? (
            <Button title="Next" onPress={onPressNext} />
          ) : null}
          {onPressSkip ? (
            <Button title="Skip" variant="text" onPress={onPressSkip} />
          ) : null}
        </View>
      )}
    </View>
  );
};

export default GetStartedContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: verticalScale(16),
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 40,
    alignSelf: "center",
  },
  hero: {
    width: "100%",
    height: verticalScale(220),
    borderRadius: 16,
  },
  heading: {
    color: palette.contentTitle,
    textAlign: "center",
  },
  description: {
    color: palette.contentBody,
    textAlign: "center",
  },
  actions: {
    gap: verticalScale(8),
  },
});
