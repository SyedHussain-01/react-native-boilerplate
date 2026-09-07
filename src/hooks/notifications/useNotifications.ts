import type { InfiniteData } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useMyNotificationsInfiniteQuery,
  useNotificationUnreadCountQuery,
} from "../../api/main";
import type {
  ApiNotification,
  MyNotificationsResponse,
} from "../../api/main/type";
import { queryClient } from "../../providers/QueryProvider";
import { useAuthStore } from "../../store/auth.store";

const DEFAULT_PER_PAGE = 10;

export type NotificationKind = "meal" | "streak" | "challenge" | "general";

export type NotificationItemData = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  kind: NotificationKind;
};

export type NotificationSection = {
  title: string;
  data: NotificationItemData[];
};

export type UseNotificationsOptions = {
  enabled?: boolean;
  perPage?: number;
};

export type UseNotificationUnreadCountOptions = {
  enabled?: boolean;
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x?.setHours?.(0, 0, 0, 0);
  return x?.getTime?.() ?? 0;
};

const sectionKeyForDate = (date: Date, now: Date): string => {
  const t0 = startOfDay(now);
  const t = startOfDay(date);
  const dayMs = 86400000;
  if (t === t0) return "Today";
  if (t === t0 - dayMs) return "Yesterday";
  return date?.toLocaleDateString?.(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year:
      date?.getFullYear?.() !== now?.getFullYear?.() ? "numeric" : undefined,
  });
};

const inferNotificationKind = (title?: string): NotificationKind => {
  const t = title?.toLowerCase?.() ?? "";
  if (
    t?.includes?.("meal") ||
    t?.includes?.("breakfast") ||
    t?.includes?.("recipe") ||
    t?.includes?.("food")
  ) {
    return "meal";
  }
  if (t?.includes?.("streak")) {
    return "streak";
  }
  if (t?.includes?.("challenge")) {
    return "challenge";
  }
  return "general";
};

const mapApiNotification = (
  item: ApiNotification,
): NotificationItemData | null => {
  const id = item?._id?.trim?.() ?? "";
  if (!id?.length) {
    return null;
  }

  const createdAt =
    item?.created_at?.trim?.() ||
    item?.createdAt?.trim?.() ||
    new Date()?.toISOString?.();

  return {
    id,
    title: item?.title?.trim?.() || "Notification",
    body: item?.body?.trim?.() || "",
    createdAt,
    read: item?.is_read === true,
    kind: inferNotificationKind(item?.title),
  };
};

const groupIntoSections = (
  items: NotificationItemData[],
  now: Date,
): NotificationSection[] => {
  const sorted = [...items]?.sort?.(
    (a, b) =>
      new Date(b?.createdAt)?.getTime?.() -
      new Date(a?.createdAt)?.getTime?.(),
  );

  const map = new Map<string, NotificationItemData[]>();
  for (const item of sorted ?? []) {
    const key = sectionKeyForDate(new Date(item?.createdAt), now);
    const list = map?.get?.(key) ?? [];
    list?.push?.(item);
    map?.set?.(key, list);
  }

  const order: string[] = [];
  for (const item of sorted ?? []) {
    const k = sectionKeyForDate(new Date(item?.createdAt), now);
    if (!order?.includes?.(k)) {
      order?.push?.(k);
    }
  }

  return order?.map?.((title) => ({
    title,
    data: map?.get?.(title) ?? [],
  }));
};

const notificationsQueryKey = (perPage: number) =>
  ["notifications", "my", "infinite", String(perPage)] as const;

const normalizeUnreadCount = (value?: number | null): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.floor(value);
};

/** Lightweight unread badge count for headers and tabs. */
export const useNotificationUnreadCount = (
  options?: UseNotificationUnreadCountOptions,
) => {
  const token = useAuthStore((s) => s?.token);
  const enabled =
    options?.enabled ?? Boolean(token?.trim?.()?.length);

  const query = useNotificationUnreadCountQuery({ enabled });

  const unreadCount = useMemo(
    () => normalizeUnreadCount(query?.data?.data?.unread_count),
    [query?.data?.data?.unread_count],
  );

  return {
    unreadCount,
    isPending: query?.isPending ?? false,
    isRefetching: query?.isRefetching ?? false,
    refetch: query?.refetch,
  };
};

export const useNotifications = (options?: UseNotificationsOptions) => {
  const token = useAuthStore((s) => s?.token);
  const perPage = options?.perPage ?? DEFAULT_PER_PAGE;
  const enabled =
    options?.enabled ?? Boolean(token?.trim?.()?.length);

  const query = useMyNotificationsInfiniteQuery(perPage, { enabled });
  const unreadCountQuery = useNotificationUnreadCountQuery({ enabled });
  const { mutateAsync: markNotificationRead } = useMarkNotificationReadMutation();
  const { mutateAsync: markAllNotificationsRead, isPending: isMarkingAllRead } =
    useMarkAllNotificationsReadMutation();

  const notifications = useMemo(
    () =>
      query?.data?.pages
        ?.flatMap((page) => page?.data ?? [])
        ?.map((item) => mapApiNotification(item))
        ?.filter((item): item is NotificationItemData => item != null) ?? [],
    [query?.data?.pages],
  );

  const sections = useMemo(
    () => groupIntoSections(notifications, new Date()),
    [notifications],
  );

  const unreadCount = useMemo(
    () => normalizeUnreadCount(unreadCountQuery?.data?.data?.unread_count),
    [unreadCountQuery?.data?.data?.unread_count],
  );

  const handleRefresh = useCallback(() => {
    void query?.refetch?.();
    void unreadCountQuery?.refetch?.();
  }, [query?.refetch, unreadCountQuery?.refetch]);

  const handleLoadMore = useCallback(() => {
    if (query?.hasNextPage && !query?.isFetchingNextPage) {
      void query?.fetchNextPage?.();
    }
  }, [query?.fetchNextPage, query?.hasNextPage, query?.isFetchingNextPage]);

  const updateReadStateInCache = useCallback(
    (predicate: (item: ApiNotification) => boolean) => {
      queryClient?.setQueryData?.<InfiniteData<MyNotificationsResponse>>(
        notificationsQueryKey(perPage),
        (old) => {
          if (!old?.pages?.length) {
            return old;
          }

          return {
            ...old,
            pages: old?.pages?.map?.((page) => ({
              ...page,
              data: page?.data?.map?.((item) =>
                predicate(item) ? { ...item, is_read: true } : item,
              ),
            })),
          };
        },
      );
    },
    [perPage],
  );

  const markRead = useCallback(
    (id: string) => {
      const trimmed = id?.trim?.() ?? "";
      if (!trimmed?.length) {
        return;
      }

      const target = notifications?.find?.((item) => item?.id === trimmed);
      if (!target || target?.read) {
        return;
      }

      updateReadStateInCache((item) => item?._id === trimmed);

      void markNotificationRead(trimmed)?.catch?.(() => {
        void query?.refetch?.();
        void unreadCountQuery?.refetch?.();
      });
    },
    [
      markNotificationRead,
      notifications,
      query?.refetch,
      unreadCountQuery?.refetch,
      updateReadStateInCache,
    ],
  );

  const markAllRead = useCallback(() => {
    if (unreadCount <= 0) {
      return;
    }

    updateReadStateInCache(() => true);

    void markAllNotificationsRead()?.catch?.(() => {
      void query?.refetch?.();
      void unreadCountQuery?.refetch?.();
    });
  }, [
    markAllNotificationsRead,
    query?.refetch,
    unreadCount,
    unreadCountQuery?.refetch,
    updateReadStateInCache,
  ]);

  return {
    sections,
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    isMarkingAllRead: isMarkingAllRead ?? false,
    handleRefresh,
    handleLoadMore,
    isPending: query?.isPending ?? false,
    isRefetching: query?.isRefetching ?? false,
    isFetchingNextPage: query?.isFetchingNextPage ?? false,
    hasNextPage: query?.hasNextPage ?? false,
    isError: query?.isError ?? false,
    refetch: query?.refetch,
  };
};
