import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import MainWrapper from "../../components/common/MainWrapper";
import {
  dummyNotificationSections,
  type DummyNotificationItem,
  type DummyNotificationKind,
  type DummyNotificationSection,
} from "../../constants/dummyUiData";
import { palette } from "../../theme";
import { MainStackParamList } from "../../types/navigation";

const kindIcon = (kind: DummyNotificationKind): keyof typeof Feather.glyphMap => {
  switch (kind) {
    case "meal":
      return "coffee";
    case "streak":
      return "trending-up";
    case "challenge":
      return "award";
    default:
      return "bell";
  }
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d?.toLocaleTimeString?.(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const Notifications = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [sections, setSections] = useState(dummyNotificationSections);

  const unreadCount = useMemo(
    () => sections.reduce((total, section) => total + section.data.filter((item) => !item.read).length, 0),
    [sections],
  );

  const handleBack = useCallback(() => {
    navigation?.goBack?.();
  }, [navigation]);

  const markRead = useCallback((id?: string) => {
    if (!id) {
      return;
    }
    setSections((current) =>
      current.map((section) => ({
        ...section,
        data: section.data.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      })),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setSections((current) =>
      current.map((section) => ({
        ...section,
        data: section.data.map((item) => ({ ...item, read: true })),
      })),
    );
  }, []);

  const handleRefresh = useCallback(() => {
    setSections(dummyNotificationSections);
  }, []);

  const handleLoadMore = useCallback(() => {
    // Dummy screen: no pagination.
  }, []);

  const headerRight = useMemo(
    () => (
      <TouchableOpacity
        onPress={markAllRead}
        activeOpacity={0.7}
        disabled={unreadCount === 0}
        style={styles.markAllWrap}
        hitSlop={{
          top: verticalScale(6),
          bottom: verticalScale(6),
          left: scale(4),
          right: scale(4),
        }}
      >
        <AppText
          weight="Medium"
          size="sm"
          style={StyleSheet.flatten([
            styles.markAllText,
            unreadCount === 0 ? styles.markAllTextDisabled : undefined,
          ])}
        >
          Mark all read
        </AppText>
      </TouchableOpacity>
    ),
    [markAllRead, unreadCount],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: DummyNotificationSection }) => (
      <View style={styles.sectionHeaderWrap}>
        <AppText weight="SemiBold" size="sm" style={styles.sectionHeaderText}>
          {section?.title}
        </AppText>
      </View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: DummyNotificationItem }) => (
      <TouchableOpacity
        style={[styles.card, !item?.read && styles.cardUnread]}
        activeOpacity={0.85}
        onPress={() => markRead?.(item?.id)}
      >
        <View
          style={[styles.iconBubble, !item?.read && styles.iconBubbleUnread]}
        >
          <Feather
            name={kindIcon(item?.kind)}
            size={moderateScale(18)}
            color={item?.read ? palette.textGray : palette.primary}
          />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <AppText
              weight={item?.read ? "Medium" : "SemiBold"}
              size="md"
              style={styles.cardTitle}
              numberOfLines={2}
            >
              {item?.title}
            </AppText>
            {!item?.read ? <View style={styles.unreadDot} /> : null}
          </View>
          <AppText
            weight="Regular"
            size="sm"
            style={styles.cardBodyText}
            numberOfLines={3}
          >
            {item?.body}
          </AppText>
          <AppText weight="Regular" size="xs" style={styles.timeText}>
            {formatTime(item?.createdAt)}
          </AppText>
        </View>
      </TouchableOpacity>
    ),
    [markRead],
  );

  const renderListEmpty = useCallback(() => {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyIconWrap}>
          <Feather
            name="inbox"
            size={moderateScale(40)}
            color={palette.contentCaption}
          />
        </View>
        <AppText weight="SemiBold" size="lg" style={styles.emptyTitle}>
          No notifications yet
        </AppText>
        <AppText weight="Regular" size="sm" style={styles.emptySubtitle}>
          When there is activity on your plan, reminders, and wins, they will
          show up here.
        </AppText>
      </View>
    );
  }, []);

  const keyExtractor = useCallback(
    (item: DummyNotificationItem) => item?.id ?? "",
    [],
  );

  return (
    <MainWrapper edges={[]} style={styles.wrapper}>
      <AppHeader
        title="Notifications"
        showBack
        onPressBack={handleBack}
        showIcons={false}
        customIcons={headerRight}
      />
      <SectionList<DummyNotificationItem, DummyNotificationSection>
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[
          styles.listContent,
          sections?.length === 0 ? styles.listContentFlex : undefined,
        ]}
        ListEmptyComponent={renderListEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={palette.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </MainWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background,
  },
  markAllWrap: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  markAllText: {
    color: palette.orange,
    fontSize: moderateScale(12),
  },
  markAllTextDisabled: {
    color: palette.contentCaption,
  },
  listContent: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(28),
    paddingTop: verticalScale(4),
  },
  listContentFlex: {
    flexGrow: 1,
  },
  sectionHeaderWrap: {
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(8),
  },
  sectionHeaderText: {
    color: palette.contentTitle,
    textTransform: "capitalize",
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(12),
    backgroundColor: palette.white,
    borderRadius: scale(14),
    padding: scale(14),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: "rgba(19, 39, 111, 0.06)",
    shadowColor: "#13276F",
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardUnread: {
    borderColor: "rgba(255, 107, 53, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
  },
  iconBubble: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    backgroundColor: palette.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBubbleUnread: {
    backgroundColor: "rgba(19, 39, 111, 0.08)",
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(8),
    marginBottom: verticalScale(4),
  },
  cardTitle: {
    flex: 1,
    color: palette.contentTitle,
  },
  unreadDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: palette.orange,
    marginTop: verticalScale(6),
  },
  cardBodyText: {
    color: palette.contentBody,
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(8),
  },
  timeText: {
    color: palette.contentCaption,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(28),
    paddingVertical: verticalScale(48),
  },
  emptyIconWrap: {
    width: moderateScale(88),
    height: moderateScale(88),
    borderRadius: moderateScale(44),
    backgroundColor: palette.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(20),
  },
  emptyTitle: {
    color: palette.contentTitle,
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  emptySubtitle: {
    color: palette.textGray,
    textAlign: "center",
    lineHeight: moderateScale(20),
  },
});
