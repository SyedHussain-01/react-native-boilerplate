import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import AppHeader from "../../components/common/AppHeader";
import MainWrapper from "../../components/common/MainWrapper";
import {
  SettingsOptionItem,
  SettingsProfileCard,
} from "../../components/settings";
import LogoutModal from "../../components/settings/LogoutModal";
import { dummyUserProfile } from "../../constants/dummyUiData";
import { useSettingsOptions } from "../../hooks//useSettingsOptions";
import { palette } from "../../theme";

const Settings = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {
    settingsOptions,
    pushNotificationEnabled,
    setPushNotificationEnabled,
  } = useSettingsOptions();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditProfile = () => {
    navigation.navigate("ProfileSetup", { from: "settings" });
  };

  const handleOptionPress = (option: (typeof settingsOptions)[0]) => {
    if (option.showToggle) {
      return;
    }
    if (option.id === "logout") {
      setShowLogoutModal(true);
    } else {
      option.onPress?.();
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
  };

  const handleToggleChange = (value: boolean) => {
    setPushNotificationEnabled(value);
  };

  return (
    <MainWrapper edges={[]} style={styles.wrapper}>
      <AppHeader
        title="Settings"
        showBack
        onPressBack={handleBack}
        showIcons={false}
      />

      <FlatList
        data={settingsOptions}
        renderItem={({ item }) => (
          <SettingsOptionItem
            icon={item.icon}
            title={item.title}
            showToggle={item.showToggle}
            toggleValue={
              item.id === "push-notification" ? pushNotificationEnabled : false
            }
            onToggleChange={
              item.id === "push-notification" ? handleToggleChange : undefined
            }
            showArrow={item.showArrow}
            onPress={() => handleOptionPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <SettingsProfileCard
              name={dummyUserProfile.fullName}
              email={dummyUserProfile.email}
              avatarUrl={dummyUserProfile.avatar}
              onEditPress={handleEditProfile}
            />
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </MainWrapper>
  );
};

export default Settings;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette.background,
  },
  headerContainer: {
    marginBottom: verticalScale(16),
  },
  separator: {
    height: verticalScale(6),
  },
  listContent: {
    padding: scale(16),
    paddingBottom: verticalScale(100),
  },
});
