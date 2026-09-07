import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { dummySubscriptionDebug } from "../constants/dummyUiData";
import { palette } from "../theme";
import AppText from "./common/AppText";

export function DebugSubscriptionOverlay() {
  const insets = useSafeAreaInsets();
  const [collapsed, setCollapsed] = useState(true);

  if (!__DEV__) {
    return null;
  }

  return (
    <View
      style={[styles.wrapper, { bottom: insets.bottom + verticalScale(72) }]}
      pointerEvents="box-none"
    >
      <View style={styles.panel} pointerEvents="auto">
        <TouchableOpacity
          style={styles.header}
          onPress={() => setCollapsed((prev) => !prev)}
          activeOpacity={0.8}
        >
          <AppText size="xs" weight="SemiBold" style={styles.headerText}>
            RC Debug {collapsed ? "▸" : "▾"}
          </AppText>
          <AppText size="xs" style={styles.resolvedBadge}>
            synced
          </AppText>
        </TouchableOpacity>

        {!collapsed ? (
          <ScrollView
            style={styles.body}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <AppText size="xs" style={styles.label}>
              Auth User ID
            </AppText>
            <AppText size="xs" weight="Medium" style={styles.value}>
              {dummySubscriptionDebug.authAppUserId}
            </AppText>

            <AppText
              size="xs"
              style={StyleSheet.flatten([styles.label, styles.sectionGap])}
            >
              RevenueCat App User ID
            </AppText>
            <AppText size="xs" weight="Medium" style={styles.value}>
              {dummySubscriptionDebug.revenueCatAppUserId}
            </AppText>

            <AppText
              size="xs"
              style={StyleSheet.flatten([styles.label, styles.sectionGap])}
            >
              Subscribed (dummy)
            </AppText>
            <AppText size="xs" weight="Medium" style={styles.value}>
              {dummySubscriptionDebug.isSubscribed ? "yes" : "no"}
              {` · ${dummySubscriptionDebug.subscriptionSource}`}
            </AppText>

            <AppText
              size="xs"
              style={StyleSheet.flatten([styles.label, styles.sectionGap])}
            >
              Active entitlements
            </AppText>
            {dummySubscriptionDebug.activeEntitlements.map((line) => (
              <AppText key={line} size="xs" style={styles.value}>
                • {line}
              </AppText>
            ))}

            <AppText
              size="xs"
              style={StyleSheet.flatten([styles.label, styles.sectionGap])}
            >
              All entitlements
            </AppText>
            {dummySubscriptionDebug.allEntitlements.map((line) => (
              <AppText key={line} size="xs" style={styles.value}>
                • {line}
              </AppText>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: scale(8),
    maxWidth: "88%",
    zIndex: 9999,
    elevation: 9999,
  },
  panel: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.35)",
    overflow: "hidden",
    maxHeight: verticalScale(220),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    backgroundColor: "rgba(30, 41, 59, 0.95)",
  },
  headerText: {
    color: palette.white,
  },
  resolvedBadge: {
    color: palette.primary,
  },
  body: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
  },
  label: {
    color: "rgba(148, 163, 184, 1)",
    marginBottom: verticalScale(2),
  },
  sectionGap: {
    marginTop: verticalScale(8),
  },
  value: {
    color: palette.white,
  },
});
