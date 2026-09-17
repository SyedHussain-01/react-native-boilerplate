import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import type { APIError } from "../api";
import { fetchFromAPI, useApiMutation, useApiQuery } from "../api";
import { MAIN } from "../endpoints";
import type {
  ContactRequest,
  ContactResponse,
  LogoutResponse,
  MarkNotificationReadResponse,
  MyNotificationsResponse,
  NotificationUnreadCountResponse,
} from "./type";

export function useLogoutMutation(
  config?: Parameters<typeof useApiMutation<LogoutResponse, void>>[2],
) {
  return useApiMutation<LogoutResponse, void>(MAIN.LOGOUT, "POST", config);
}

export function useContactMutation(
  config?: Parameters<
    typeof useApiMutation<ContactResponse, ContactRequest>
  >[2],
) {
  return useApiMutation<ContactResponse, ContactRequest>(
    MAIN.CONTACT,
    "POST",
    config,
  );
}

export function useNotificationUnreadCountQuery(
  config?: Parameters<
    typeof useApiQuery<NotificationUnreadCountResponse>
  >[2],
) {
  return useApiQuery<NotificationUnreadCountResponse>(
    MAIN.NOTIFICATIONS_UNREAD_COUNT,
    ["notifications", "unread-count"],
    config ?? {},
  );
}

export function useMarkNotificationReadMutation() {
  return useMutation<MarkNotificationReadResponse, APIError, string>({
    mutationFn: (id) =>
      fetchFromAPI<MarkNotificationReadResponse>(
        MAIN.markNotificationRead(id),
        { method: "POST" },
      ),
  });
}

export function useMarkAllNotificationsReadMutation(
  config?: Parameters<
    typeof useApiMutation<MarkNotificationReadResponse, void>
  >[2],
) {
  return useApiMutation<MarkNotificationReadResponse, void>(
    MAIN.NOTIFICATIONS_MARK_ALL_READ,
    "POST",
    config,
  );
}

export function useMyNotificationsInfiniteQuery(
  perPageOrOptions?: number | { enabled?: boolean; perPage?: number },
  maybeOptions?: { enabled?: boolean },
) {
  const perPage =
    typeof perPageOrOptions === "number"
      ? perPageOrOptions
      : (perPageOrOptions?.perPage ?? 10);
  const enabled =
    typeof perPageOrOptions === "number"
      ? (maybeOptions?.enabled ?? true)
      : (perPageOrOptions?.enabled ?? maybeOptions?.enabled ?? true);

  return useInfiniteQuery({
    queryKey: ["notifications", "list", perPage],
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      fetchFromAPI<MyNotificationsResponse>(
        `${MAIN.NOTIFICATIONS}?page=${pageParam}&per_page=${perPage}`,
      ),
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      if (!Array.isArray(lastPage?.data) || lastPage.data.length < perPage) {
        return undefined;
      }
      return (lastPageParam as number) + 1;
    },
  });
}
