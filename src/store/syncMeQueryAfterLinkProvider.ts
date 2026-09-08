import type { GetMeResponse } from "../api/auth/type";
import type { LinkProviderResponse } from "../api/main/type";
import { queryClient } from "../providers/QueryProvider";

/**
 * Writes PATCH /user/link-provider `data` into the `["me"]` query cache so
 * `useGetMeQuery` + `syncFromGetMeResponse` never briefly re-apply stale `/auth/me`.
 */
export function syncMeQueryCacheAfterLinkProvider(
  response: LinkProviderResponse,
): void {
  const raw = response?.data;
  if (!raw || typeof raw !== "object") {
    return;
  }
  const next: GetMeResponse = {
    status: !!response?.status,
    message: String(response?.message ?? ""),
    data: {
      user: raw as GetMeResponse["data"]["user"],
    },
    status_code: response?.status_code ?? 200,
  };
  void queryClient?.setQueryData?.(["me"], next);
}
