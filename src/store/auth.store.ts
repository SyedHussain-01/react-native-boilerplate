import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  GetMeResponse,
  LoginResponse,
  MeLinkedProvider,
  MeSubscription,
  VerifyOtpResponse,
} from "../api/auth/type";
import type { LinkProviderResponse } from "../api/main/type";
import type { HealthProfileResponse } from "../api/onboarding/type";
import { queryClient } from "../providers/QueryProvider";
import { profileCompleteFromUser } from "../utils/onboardingRouting";
import { storage } from "./mmkv_config";

export type AuthUserRecord = Record<string, unknown> | null;

/** Normalized linked provider from `user.linkedProvider` (GET /auth/me, login, etc.). */
export type AuthLinkedProviderRecord = MeLinkedProvider;

export function linkedProviderFromUser(
  user: AuthUserRecord,
): AuthLinkedProviderRecord | null {
  if (!user) {
    return null;
  }
  const raw = user["linkedProvider"];
  if (raw == null || raw === false) {
    return null;
  }
  if (typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const id = typeof o["_id"] === "string" ? o["_id"]?.trim?.() ?? "" : "";
  if (!id?.length) {
    return null;
  }
  return raw as AuthLinkedProviderRecord;
}

/** Mirrors `user.referralCode` from API for quick access / persistence */
function referralCodeFromUser(user: AuthUserRecord): string | null {
  if (!user) {
    return null;
  }
  const v = user["referralCode"];
  if (typeof v === "string" && v.trim().length > 0) {
    return v.trim();
  }
  return null;
}

/** Resolves `has_logged_weight_this_week` from auth payload (top-level or nested on `user`). */
function parseHasLoggedWeightThisWeek(
  data: unknown,
  user?: AuthUserRecord,
): boolean | undefined {
  const d = data as Record<string, unknown> | null | undefined;
  const top = d?.["has_logged_weight_this_week"];
  if (typeof top === "boolean") {
    return top;
  }
  const u =
    (user ?? d?.["user"]) as Record<string, unknown> | null | undefined;
  const nested = u?.["has_logged_weight_this_week"];
  if (typeof nested === "boolean") {
    return nested;
  }
  return undefined;
}

function parseMeSubscription(raw: unknown): MeSubscription | null {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const id = typeof o["_id"] === "string" ? o["_id"]?.trim?.() ?? "" : "";
  if (!id?.length) {
    return null;
  }
  return {
    _id: id,
    autoRenewStatus:
      typeof o["autoRenewStatus"] === "boolean"
        ? o["autoRenewStatus"]
        : undefined,
    cancelledAt:
      o["cancelledAt"] === null || typeof o["cancelledAt"] === "string"
        ? (o["cancelledAt"] as string | null)
        : undefined,
    currentPeriodEnd:
      typeof o["currentPeriodEnd"] === "string"
        ? o["currentPeriodEnd"]
        : undefined,
    currentPeriodStart:
      typeof o["currentPeriodStart"] === "string"
        ? o["currentPeriodStart"]
        : undefined,
    isTrialAvailed:
      typeof o["isTrialAvailed"] === "boolean"
        ? o["isTrialAvailed"]
        : undefined,
    planId: typeof o["planId"] === "string" ? o["planId"] : undefined,
    planName: typeof o["planName"] === "string" ? o["planName"] : undefined,
    productId: typeof o["productId"] === "string" ? o["productId"] : undefined,
    store: typeof o["store"] === "string" ? o["store"] : undefined,
    subscriptionStatus:
      typeof o["subscriptionStatus"] === "string"
        ? o["subscriptionStatus"]
        : undefined,
    subscriptionTier:
      typeof o["subscriptionTier"] === "string"
        ? o["subscriptionTier"]
        : undefined,
    trialEnd:
      o["trialEnd"] === null || typeof o["trialEnd"] === "string"
        ? (o["trialEnd"] as string | null)
        : undefined,
    trialStart:
      o["trialStart"] === null || typeof o["trialStart"] === "string"
        ? (o["trialStart"] as string | null)
        : undefined,
  };
}

/** Resolves subscription + `isSubscribed` from auth payload (top-level or nested on `user`). */
function parseSubscriptionFromPayload(
  data: unknown,
  user?: AuthUserRecord,
): { isSubscribed?: boolean; subscription: MeSubscription | null } {
  const d = data as Record<string, unknown> | null | undefined;
  const u =
    (user ?? (d?.["user"] as AuthUserRecord | undefined)) ?? null;

  let isSubscribed: boolean | undefined;
  const topFlag = d?.["isSubscribed"];
  if (typeof topFlag === "boolean") {
    isSubscribed = topFlag;
  }
  const userFlag = u?.["isSubscribed"];
  if (typeof userFlag === "boolean") {
    isSubscribed = userFlag;
  }

  const subRaw = d?.["subscription"] ?? u?.["subscription"];
  const subscription = parseMeSubscription(subRaw);

  return { isSubscribed, subscription };
}

// Define auth store's state type
interface AuthState {
  token: string | null;
  tokenType: string | null;
  refreshToken: string | null;
  user: AuthUserRecord;
  /** `data.verified` from verify-OTP when present */
  verified: boolean;
  /** Top-level API fields from last verify-OTP success */
  lastAuthMessage: string | null;
  lastAuthStatus: boolean | null;
  lastAuthStatusCode: number | null;
  isProfileComplete: boolean;
  isSubscribed: boolean;
  subscription: MeSubscription | null;
  /** Last PATCH /user/health-profile response meta */
  healthProfileLastMessage: string | null;
  healthProfileLastStatus: boolean | null;
  healthProfileLastStatusCode: number | null;
  healthProfileLastSyncedAt: string | null;
  /** Full `data` object from health-profile API (user + any future keys) */
  healthProfileLastData: Record<string, unknown> | null;
  /** Copy of `user.referralCode` when user is synced */
  referralCode: string | null;
  /** From GET /auth/me, login, verify-OTP, or set after POST /weight-history */
  hasLoggedWeightThisWeek: boolean;
  /** From `user.linkedProvider` after GET /auth/me (and other flows that refresh `user`). */
  linkedProvider: AuthLinkedProviderRecord | null;
  setToken: (token: string | null) => void;
  setIsProfileComplete: (isProfileComplete: boolean) => void;
  setIsSubscribed: (isSubscribed: boolean) => void;
  setSubscription: (subscription: MeSubscription | null) => void;
  setHasLoggedWeightThisWeek: (value: boolean) => void;
  /** Persists token, user, tokenType, verified, and meta from verify-OTP response */
  applyVerifyOtpResponse: (response: VerifyOtpResponse) => void;
  /** Persists session + user from POST /auth/login */
  applyLoginResponse: (response: LoginResponse) => void;
  /** Updates `user`, `isProfileComplete`, and `verified` from GET /auth/me when data changes */
  syncFromGetMeResponse: (response: GetMeResponse) => void;
  /** Updates user + profile flags and health-profile metadata from PATCH /user/health-profile */
  syncFromHealthProfileResponse: (response: HealthProfileResponse) => void;
  /** Merges PATCH /user/link-provider `data` (current user + `linkedProvider`) into auth state */
  syncFromLinkProviderResponse: (response: LinkProviderResponse) => void;
  clearAuth: () => void;
}

const initialPersistedSlice = {
  token: null as string | null,
  tokenType: null as string | null,
  refreshToken: null as string | null,
  user: null as AuthUserRecord,
  verified: false,
  lastAuthMessage: null as string | null,
  lastAuthStatus: null as boolean | null,
  lastAuthStatusCode: null as number | null,
  isProfileComplete: false,
  isSubscribed: false,
  subscription: null as MeSubscription | null,
  healthProfileLastMessage: null as string | null,
  healthProfileLastStatus: null as boolean | null,
  healthProfileLastStatusCode: null as number | null,
  healthProfileLastSyncedAt: null as string | null,
  healthProfileLastData: null as Record<string, unknown> | null,
  referralCode: null as string | null,
  hasLoggedWeightThisWeek: false,
  linkedProvider: null as AuthLinkedProviderRecord | null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialPersistedSlice,
      setToken: (token) => set({ token }),
      setIsProfileComplete: (isProfileComplete) => set({ isProfileComplete }),
      setIsSubscribed: (isSubscribed) => set({ isSubscribed }),
      setSubscription: (subscription) => set({ subscription }),
      setHasLoggedWeightThisWeek: (value) =>
        set({ hasLoggedWeightThisWeek: !!value }),
      applyVerifyOtpResponse: (response: VerifyOtpResponse) => {
        const data = response?.data;
        if (!data) {
          return;
        }
        set((state) => {
          const nextUser =
            data?.user !== undefined && data?.user !== null
              ? (data.user as Record<string, unknown>)
              : state.user;
          const nextToken =
            data?.token != null && String(data.token)?.length > 0
              ? data.token
              : state.token;
          const nextTokenType =
            data?.tokenType != null && String(data?.tokenType)?.length > 0
              ? data.tokenType
              : state.tokenType;
          const nextRefresh =
            data?.refreshToken != null &&
            String(data?.refreshToken)?.length > 0
              ? data.refreshToken
              : state.refreshToken;
          const nextVerified =
            data?.verified != null ? !!data?.verified : state?.verified;
          const nextHasLogged = parseHasLoggedWeightThisWeek(data, nextUser);
          const { isSubscribed: nextSubscribed, subscription: nextSubscription } =
            parseSubscriptionFromPayload(data, nextUser);

          return {
            token: nextToken ?? null,
            tokenType: nextTokenType ?? null,
            refreshToken: nextRefresh ?? null,
            user: nextUser,
            verified: nextVerified,
            isProfileComplete: profileCompleteFromUser(nextUser),
            referralCode: referralCodeFromUser(nextUser),
            linkedProvider: linkedProviderFromUser(nextUser),
            ...(typeof nextHasLogged === "boolean"
              ? { hasLoggedWeightThisWeek: nextHasLogged }
              : {}),
            ...(typeof nextSubscribed === "boolean"
              ? { isSubscribed: nextSubscribed }
              : {}),
            subscription: nextSubscription,
            lastAuthMessage: response?.message ?? state.lastAuthMessage,
            lastAuthStatus:
              response?.status != null ? !!response?.status : state.lastAuthStatus,
            lastAuthStatusCode:
              response?.status_code ?? state.lastAuthStatusCode,
          };
        });
      },
      applyLoginResponse: (response: LoginResponse) => {
        const data = response?.data;
        if (!data) {
          return;
        }
        set((state) => {
          const nextUser =
            data?.user != null
              ? ({
                  ...(data.user as unknown as Record<string, unknown>),
                } as AuthUserRecord)
              : state.user;
          const nextToken =
            data?.token != null && String(data?.token)?.length > 0
              ? data.token
              : state.token;
          const nextRefresh =
            data?.refreshToken != null &&
            String(data?.refreshToken)?.length > 0
              ? data.refreshToken
              : state.refreshToken;
          const nextVerified =
            typeof nextUser?.["isVerified"] === "boolean"
              ? !!(nextUser["isVerified"] as boolean)
              : state?.verified;
          const nextHasLogged =
            parseHasLoggedWeightThisWeek(data, nextUser) ?? false;
          const { isSubscribed: nextSubscribed, subscription: nextSubscription } =
            parseSubscriptionFromPayload(data, nextUser);

          return {
            token: nextToken ?? null,
            refreshToken: nextRefresh ?? null,
            user: nextUser,
            verified: nextVerified,
            isProfileComplete: profileCompleteFromUser(nextUser),
            referralCode: referralCodeFromUser(nextUser),
            linkedProvider: linkedProviderFromUser(nextUser),
            hasLoggedWeightThisWeek: nextHasLogged,
            ...(typeof nextSubscribed === "boolean"
              ? { isSubscribed: nextSubscribed }
              : {}),
            subscription: nextSubscription,
            lastAuthMessage: response?.message ?? state.lastAuthMessage,
            lastAuthStatus:
              response?.status != null ? !!response?.status : state.lastAuthStatus,
            lastAuthStatusCode:
              response?.status_code ?? state.lastAuthStatusCode,
          };
        });
      },
      syncFromGetMeResponse: (response: GetMeResponse) => {
        const nextUserRaw = response?.data?.user;
        if (!nextUserRaw) {
          return;
        }
        const nextUser = {
          ...(nextUserRaw as unknown as Record<string, unknown>),
        };
        const nextVerified =
          typeof nextUser?.["isVerified"] === "boolean"
            ? !!(nextUser["isVerified"] as boolean)
            : get()?.verified;
        const nextHasLogged = parseHasLoggedWeightThisWeek(
          response?.data,
          nextUser,
        );
        const { isSubscribed: nextSubscribed, subscription: nextSubscription } =
          parseSubscriptionFromPayload(response?.data, nextUser);
        const nextProfileComplete = profileCompleteFromUser(nextUser);
        const nextReferral = referralCodeFromUser(nextUser);
        const nextLinked = linkedProviderFromUser(nextUser);

        const prev = get()?.user;
        const prevJson = prev ? JSON.stringify(prev) : "";
        const nextJson = JSON.stringify(nextUser);
        const prevLinked = get()?.linkedProvider;
        const prevLinkedJson = prevLinked
          ? JSON.stringify(prevLinked)
          : "";
        const nextLinkedJson = nextLinked ? JSON.stringify(nextLinked) : "";
        const prevHasLogged = get()?.hasLoggedWeightThisWeek;
        const prevSubscribed = get()?.isSubscribed;
        const prevSubscriptionJson = get()?.subscription
          ? JSON.stringify(get()?.subscription)
          : "";
        const nextSubscriptionJson = nextSubscription
          ? JSON.stringify(nextSubscription)
          : "";

        if (
          prevJson === nextJson &&
          nextVerified === get()?.verified &&
          nextProfileComplete === get()?.isProfileComplete &&
          nextReferral === get()?.referralCode &&
          prevLinkedJson === nextLinkedJson &&
          (typeof nextHasLogged !== "boolean" ||
            nextHasLogged === prevHasLogged) &&
          (typeof nextSubscribed !== "boolean" ||
            nextSubscribed === prevSubscribed) &&
          prevSubscriptionJson === nextSubscriptionJson
        ) {
          return;
        }

        set({
          user: nextUser,
          verified: nextVerified,
          isProfileComplete: nextProfileComplete,
          referralCode: nextReferral,
          linkedProvider: nextLinked,
          ...(typeof nextHasLogged === "boolean"
            ? { hasLoggedWeightThisWeek: nextHasLogged }
            : {}),
          ...(typeof nextSubscribed === "boolean"
            ? { isSubscribed: nextSubscribed }
            : {}),
          subscription: nextSubscription,
        });
      },
      syncFromHealthProfileResponse: (response: HealthProfileResponse) => {
        const data = response?.data;
        const nextUserRaw = data?.user;
        if (!data || !nextUserRaw) {
          return;
        }
        const nextUser = {
          ...(nextUserRaw as Record<string, unknown>),
        };
        const dataSnapshot: Record<string, unknown> = {
          ...(data as unknown as Record<string, unknown>),
        };
        const nextVerified =
          typeof nextUser?.["isVerified"] === "boolean"
            ? !!(nextUser["isVerified"] as boolean)
            : get()?.verified;
        const nextReferral = referralCodeFromUser(nextUser);
        const nextLinked = linkedProviderFromUser(nextUser);
        const nextHasLogged = parseHasLoggedWeightThisWeek(data, nextUser);
        const { isSubscribed: nextSubscribed, subscription: nextSubscription } =
          parseSubscriptionFromPayload(data, nextUser);

        const prev = get()?.user;
        const prevJson = prev ? JSON.stringify(prev) : "";
        const nextJson = JSON.stringify(nextUser);
        const prevDataJson = JSON.stringify(get()?.healthProfileLastData ?? null);
        const nextDataJson = JSON.stringify(dataSnapshot);
        const prevHasLogged = get()?.hasLoggedWeightThisWeek;
        const prevSubscribed = get()?.isSubscribed;
        const prevSubscriptionJson = get()?.subscription
          ? JSON.stringify(get()?.subscription)
          : "";
        const nextSubscriptionJson = nextSubscription
          ? JSON.stringify(nextSubscription)
          : "";
        const prevLinked = get()?.linkedProvider;
        const prevLinkedJson = prevLinked
          ? JSON.stringify(prevLinked)
          : "";
        const nextLinkedJson = nextLinked ? JSON.stringify(nextLinked) : "";
        if (
          prevJson === nextJson &&
          nextVerified === get()?.verified &&
          nextReferral === get()?.referralCode &&
          prevLinkedJson === nextLinkedJson &&
          (typeof nextHasLogged !== "boolean" ||
            nextHasLogged === prevHasLogged) &&
          (typeof nextSubscribed !== "boolean" ||
            nextSubscribed === prevSubscribed) &&
          prevSubscriptionJson === nextSubscriptionJson &&
          prevDataJson === nextDataJson &&
          (response?.message ?? null) === get()?.healthProfileLastMessage
        ) {
          return;
        }

        set({
          user: nextUser,
          verified: nextVerified,
          isProfileComplete: profileCompleteFromUser(nextUser),
          referralCode: nextReferral,
          linkedProvider: nextLinked,
          ...(typeof nextHasLogged === "boolean"
            ? { hasLoggedWeightThisWeek: nextHasLogged }
            : {}),
          ...(typeof nextSubscribed === "boolean"
            ? { isSubscribed: nextSubscribed }
            : {}),
          subscription: nextSubscription,
          healthProfileLastMessage: response?.message ?? null,
          healthProfileLastStatus:
            response?.status != null ? !!response?.status : null,
          healthProfileLastStatusCode: response?.status_code ?? null,
          healthProfileLastSyncedAt: new Date().toISOString(),
          healthProfileLastData: dataSnapshot,
        });
      },
      syncFromLinkProviderResponse: (response: LinkProviderResponse) => {
        const raw = response?.data;
        if (!raw || typeof raw !== "object") {
          return;
        }
        const nextUser = {
          ...(raw as Record<string, unknown>),
        };
        const nextVerified =
          typeof nextUser?.["isVerified"] === "boolean"
            ? !!(nextUser["isVerified"] as boolean)
            : get()?.verified;
        const nextReferral = referralCodeFromUser(nextUser);
        const nextLinked = linkedProviderFromUser(nextUser);
        const nextHasLogged = parseHasLoggedWeightThisWeek(raw, nextUser);
        const { isSubscribed: nextSubscribed, subscription: nextSubscription } =
          parseSubscriptionFromPayload(raw, nextUser);

        set({
          user: nextUser,
          verified: nextVerified,
          referralCode: nextReferral,
          linkedProvider: nextLinked,
          ...(typeof nextHasLogged === "boolean"
            ? { hasLoggedWeightThisWeek: nextHasLogged }
            : {}),
          ...(typeof nextSubscribed === "boolean"
            ? { isSubscribed: nextSubscribed }
            : {}),
          subscription: nextSubscription,
        });
      },
      clearAuth: () => {
        set({
          ...initialPersistedSlice,
        });
        queryClient.clear();
      },
    }),
    {
      name: "auth-storage",
      merge: (persistedState, currentState) => {
        const merged = {
          ...currentState,
          ...(typeof persistedState === "object" && persistedState
            ? persistedState
            : {}),
        };
        return {
          ...merged,
          linkedProvider: linkedProviderFromUser(merged?.user ?? null),
          isProfileComplete: profileCompleteFromUser(merged?.user ?? null),
        };
      },
      partialize: (state) => ({
        token: state.token,
        tokenType: state.tokenType,
        refreshToken: state.refreshToken,
        user: state.user,
        verified: state.verified,
        lastAuthMessage: state.lastAuthMessage,
        lastAuthStatus: state.lastAuthStatus,
        lastAuthStatusCode: state.lastAuthStatusCode,
        isProfileComplete: state.isProfileComplete,
        isSubscribed: state.isSubscribed,
        subscription: state.subscription,
        healthProfileLastMessage: state.healthProfileLastMessage,
        healthProfileLastStatus: state.healthProfileLastStatus,
        healthProfileLastStatusCode: state.healthProfileLastStatusCode,
        healthProfileLastSyncedAt: state.healthProfileLastSyncedAt,
        healthProfileLastData: state.healthProfileLastData,
        referralCode: state.referralCode,
        hasLoggedWeightThisWeek: state.hasLoggedWeightThisWeek,
        linkedProvider: state.linkedProvider,
      }),
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name);
          return value
            ? Promise.resolve(JSON.parse(value))
            : Promise.resolve(null);
        },
        setItem: (name, value) => {
          storage.set(name, JSON.stringify(value));
          return Promise.resolve();
        },
        removeItem: (name) => {
          storage.remove(name);
          return Promise.resolve();
        },
      })),
    },
  ),
);
