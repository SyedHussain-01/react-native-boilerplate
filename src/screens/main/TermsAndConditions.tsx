import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import AppHeader from "../../components/common/AppHeader";
import ContentCard from "../../components/privacy_policy/ContentCard";
import MainWrapper from "../../components/common/MainWrapper";
import { palette } from "../../theme";

const TermsAndConditions = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation?.goBack?.();
  };


  const content = "";
  const isLoading = false;
  const isError = false;

  return (
    <MainWrapper edges={[]} style={styles?.wrapper}>
      <AppHeader
        title="Terms and Condition"
        showBack
        onPressBack={handleBack}
        showIcons={false}
      />

      {isLoading ? (
        <View style={styles?.loadingContainer}>
          <ActivityIndicator size="large" color={palette?.primary} />
        </View>
      ) : isError ? (
        <ContentCard content="Unable to load terms and conditions. Please try again later." />
      ) : (
        <ContentCard content={content} />
      )}
    </MainWrapper>
  );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette?.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
