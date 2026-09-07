import { fetchFromAPI } from "../api/api";
import { AUTH } from "../api/endpoints";
import type { GetMeResponse } from "../api/auth/type";
import { queryClient } from "../providers/QueryProvider";
import { useAuthStore } from "./auth.store";

/** Refreshes onboarding/subscription state from GET /auth/me after login or OTP. */
export async function syncMeAfterAuth(): Promise<void> {
  try {
    const meResponse = await fetchFromAPI<GetMeResponse>(AUTH.ME);
    useAuthStore.getState().syncFromGetMeResponse?.(meResponse);
    void queryClient.invalidateQueries({ queryKey: ["me"] });
  } catch (error) {
    console.warn("[Auth] GET /auth/me after auth failed", error);
  }
}
