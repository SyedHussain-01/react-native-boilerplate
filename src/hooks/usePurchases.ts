import { type AuthUserRecord, useAuthStore } from "@/src/store/auth.store";
import type { GetMeResponse, MeSubscription } from "@/src/api/auth/type";
import { queryClient } from "@/src/providers/QueryProvider";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/src/utils/toast";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { InteractionManager, Linking, Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PACKAGE_TYPE,
  PERIOD_UNIT,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
  SubscriptionOption,
} from "react-native-purchases";

export type SubscriptionPlanId = "yearly" | "monthly";

export type SubscriptionSource = "revenuecat" | "api" | null;

export type ResolvedSubscriptionStatus = {
  isSubscribed: boolean;
  currentPlanId: SubscriptionPlanId | null;
  productIdentifier: string | null;
  expiry: string | null;
  source: SubscriptionSource;
};

/** Maps RevenueCat / store product id to yearly vs monthly. */
export function inferPlanIdFromProductIdentifier(
  productIdentifier?: string | null,
): SubscriptionPlanId | null {
  const value = productIdentifier?.trim?.()?.toLowerCase?.() ?? "";
  if (!value?.length) {
    return null;
  }
  if (
    value?.includes?.("year") ||
    value?.includes?.("annual") ||
    value?.includes?.("yearly")
  ) {
    return "yearly";
  }
  if (
    value?.includes?.("month") ||
    value?.includes?.("monthly")
  ) {
    return "monthly";
  }
  return null;
}

export function inferPlanIdFromApiSubscription(
  subscription?: MeSubscription | null,
): SubscriptionPlanId | null {
  const fromProduct = inferPlanIdFromProductIdentifier(subscription?.productId);
  if (fromProduct) {
    return fromProduct;
  }
  const planName = subscription?.planName?.toLowerCase?.() ?? "";
  if (planName?.includes?.("year") || planName?.includes?.("annual")) {
    return "yearly";
  }
  if (planName?.includes?.("month")) {
    return "monthly";
  }
  return subscription ? "monthly" : null;
}

/** Subscription state parsed from RevenueCat `CustomerInfo`. */
export function parseCustomerInfoSubscription(
  info: CustomerInfo | null,
): ResolvedSubscriptionStatus {
  if (!info) {
    return {
      isSubscribed: false,
      currentPlanId: null,
      productIdentifier: null,
      expiry: null,
      source: null,
    };
  }

  const activeSubs = info?.activeSubscriptions ?? [];
  const activeEntitlements = Object.values(info?.entitlements?.active ?? {});

  const isSubscribed =
    (activeSubs?.length ?? 0) > 0 || (activeEntitlements?.length ?? 0) > 0;

  let productIdentifier: string | null = null;

  if ((activeSubs?.length ?? 0) > 0) {
    productIdentifier = activeSubs[0] ?? null;
  } else if ((activeEntitlements?.length ?? 0) > 0) {
    const entitlement = activeEntitlements[0];
    productIdentifier =
      entitlement?.productPlanIdentifier ??
      entitlement?.productIdentifier ??
      null;
  }

  const currentPlanId = inferPlanIdFromProductIdentifier(productIdentifier);

  return {
    isSubscribed,
    currentPlanId,
    productIdentifier,
    expiry: info?.latestExpirationDate ?? null,
    source: "revenuecat",
  };
}

/** RevenueCat `customerInfo` is the only source of truth for subscription access. */
export function resolveSubscriptionStatus(
  customerInfo: CustomerInfo | null,
  customerInfoResolved: boolean,
): ResolvedSubscriptionStatus {
  if (customerInfoResolved && customerInfo != null) {
    return parseCustomerInfoSubscription(customerInfo);
  }

  return {
    isSubscribed: false,
    currentPlanId: null,
    productIdentifier: null,
    expiry: null,
    source: null,
  };
}

export type SubscriptionPurchaseTarget = {
  package: PurchasesPackage;
  /** Android Google Play base plan — purchase explicitly when product has multiple options. */
  subscriptionOption?: SubscriptionOption;
};

export type SubscriptionPlanView = {
  id: SubscriptionPlanId;
  title: string;
  price: string;
  subtitle?: string;
  priceSubtitle?: string;
  purchase: SubscriptionPurchaseTarget;
};

function getPurchaseApiKey(): string {
  return (
    Platform.select({
      ios: process.env.EXPO_PUBLIC_PURCHASE_IOS_KEY,
      android: process.env.EXPO_PUBLIC_PURCHASE_ANDROID_KEY,
      default: "",
    }) ?? ""
  );
}

/** Align RevenueCat app user id with backend user `_id`. */
export function getRevenueCatAppUserId(user: AuthUserRecord): string | null {
  if (!user || typeof user !== "object") {
    return null;
  }
  const raw = user._id ?? user.id ?? user.user_id;
  if (raw === undefined || raw === null) {
    return null;
  }
  const s = String(raw).trim();
  return s.length > 0 ? s : null;
}

function isAnonymousRevenueCatUserId(userId: string | null | undefined): boolean {
  if (!userId?.length) {
    return true;
  }
  return userId.startsWith("$RCAnonymous");
}

async function linkRevenueCatToUser(appUserId: string): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.logIn(appUserId);
  const currentId = await Purchases.getAppUserID();
  if (
    isAnonymousRevenueCatUserId(currentId) ||
    currentId.trim() !== appUserId.trim()
  ) {
    throw new Error(
      `[Purchases] RevenueCat link failed: expected ${appUserId}, got ${currentId}`,
    );
  }
  return customerInfo;
}

/** True if any offering (current or in `all`) has packages. */
function offeringsHavePackages(o: PurchasesOfferings | null): boolean {
  if (!o) {
    return false;
  }
  if ((o.current?.availablePackages?.length ?? 0) > 0) {
    return true;
  }
  return Object.values(o.all ?? {}).some(
    (off) => (off.availablePackages?.length ?? 0) > 0,
  );
}

/**
 * Prefer `current`; if null/empty, use first offering in `all` that has packages.
 */
export function getPrimaryOffering(
  offerings: PurchasesOfferings | null | undefined,
): PurchasesOffering | null {
  if (!offerings) {
    return null;
  }
  const cur = offerings.current;
  if (cur && (cur.availablePackages?.length ?? 0) > 0) {
    return cur;
  }
  const fromAll = Object.values(offerings.all ?? {}).find(
    (off) => (off.availablePackages?.length ?? 0) > 0,
  );
  if (fromAll) {
    return fromAll;
  }
  return cur ?? null;
}

export function findPackageForPlan(
  offerings: PurchasesOfferings | null | undefined,
  plan: SubscriptionPlanId,
): PurchasesPackage | null {
  const offering = getPrimaryOffering(offerings);
  if (!offering) {
    return null;
  }

  const preset = plan === "yearly" ? offering.annual : offering.monthly;
  if (preset) {
    return preset;
  }

  const packages = offering.availablePackages ?? [];
  const targetType =
    plan === "yearly" ? PACKAGE_TYPE.ANNUAL : PACKAGE_TYPE.MONTHLY;
  const byType = packages.find((p) => p.packageType === targetType);
  if (byType) {
    return byType;
  }

  const keyword = plan === "yearly" ? /annual|year|yearly/i : /month|monthly/i;
  return (
    packages.find((p) => {
      const haystack = [
        p.identifier,
        p.product.identifier,
        p.product.defaultOption?.id ?? "",
        p.product.subscriptionPeriod ?? "",
      ].join(" ");
      return keyword.test(haystack);
    }) ?? null
  );
}

function matchPlanToSubscriptionOption(
  option: SubscriptionOption,
  plan: SubscriptionPlanId,
): boolean {
  const unit = option.billingPeriod?.unit;
  const id = option.id.toLowerCase();
  if (plan === "yearly") {
    return unit === PERIOD_UNIT.YEAR || /year|annual|yearly/.test(id);
  }
  return unit === PERIOD_UNIT.MONTH || /month|monthly/.test(id);
}

function findSubscriptionOptionForPlan(
  pkg: PurchasesPackage,
  plan: SubscriptionPlanId,
): SubscriptionOption | null {
  const basePlans =
    pkg.product.subscriptionOptions?.filter((option) => option.isBasePlan) ??
    [];
  return (
    basePlans.find((option) => matchPlanToSubscriptionOption(option, plan)) ??
    null
  );
}

function formatMonthlyEquivalent(
  option: SubscriptionOption,
): string | undefined {
  const phase = option.fullPricePhase;
  if (!phase?.price) {
    return undefined;
  }
  const monthlyMicros = Math.round(phase.price.amountMicros / 12);
  const amount = monthlyMicros / 1_000_000;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: phase.price.currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return phase.price.formatted;
  }
}

function buildSubscriptionPlanView(
  plan: SubscriptionPlanId,
  pkg: PurchasesPackage,
  subscriptionOption?: SubscriptionOption | null,
): SubscriptionPlanView {
  const product = pkg.product;
  const optionPrice =
    subscriptionOption?.fullPricePhase?.price.formatted ??
    subscriptionOption?.pricingPhases?.at(-1)?.price.formatted;
  const price = optionPrice || product.priceString;

  const view: SubscriptionPlanView = {
    id: plan,
    title: plan === "yearly" ? "Yearly" : "Monthly",
    price,
    purchase: {
      package: pkg,
      ...(subscriptionOption ? { subscriptionOption } : {}),
    },
  };

  if (plan === "yearly") {
    view.subtitle = "Equivalent to";
    const monthlyEquivalent =
      (subscriptionOption
        ? formatMonthlyEquivalent(subscriptionOption)
        : undefined) ?? product.pricePerMonthString;
    if (monthlyEquivalent) {
      view.priceSubtitle = `${monthlyEquivalent}/month`;
    }
  }

  return view;
}

/** Resolves yearly + monthly plans from RevenueCat offerings (incl. Android base plans). */
export function getSubscriptionPlans(
  offerings: PurchasesOfferings | null | undefined,
): SubscriptionPlanView[] {
  const offering = getPrimaryOffering(offerings);
  if (!offering) {
    return [];
  }

  const plans = new Map<SubscriptionPlanId, SubscriptionPlanView>();

  const registerPlan = (
    plan: SubscriptionPlanId,
    pkg: PurchasesPackage,
    subscriptionOption?: SubscriptionOption | null,
  ) => {
    if (plans.has(plan)) {
      return;
    }
    plans.set(plan, buildSubscriptionPlanView(plan, pkg, subscriptionOption));
  };

  if (offering.annual) {
    registerPlan("yearly", offering.annual);
  }
  if (offering.monthly) {
    registerPlan("monthly", offering.monthly);
  }

  for (const pkg of offering.availablePackages ?? []) {
    for (const plan of ["yearly", "monthly"] as const) {
      if (plans.has(plan)) {
        continue;
      }
      const preset =
        plan === "yearly"
          ? pkg.packageType === PACKAGE_TYPE.ANNUAL
          : pkg.packageType === PACKAGE_TYPE.MONTHLY;
      if (preset) {
        registerPlan(plan, pkg);
        continue;
      }
      const option = findSubscriptionOptionForPlan(pkg, plan);
      if (option) {
        registerPlan(plan, pkg, option);
      }
    }
  }

  for (const plan of ["yearly", "monthly"] as const) {
    if (plans.has(plan)) {
      continue;
    }
    const pkg = findPackageForPlan(offerings, plan);
    if (pkg) {
      registerPlan(plan, pkg);
    }
  }

  return (["yearly", "monthly"] as const)
    .map((id) => plans.get(id))
    .filter((plan): plan is SubscriptionPlanView => !!plan);
}

export function formatPackagePrice(pkg: PurchasesPackage | null): string {
  return pkg?.product?.priceString ?? "";
}

/** Play Billing / StoreKit sometimes need a moment after logIn before packages appear. */
async function fetchOfferingsWithRetry(
  isCancelled: () => boolean,
): Promise<PurchasesOfferings> {
  if (!isCancelled()) {
    await new Promise<void>((resolve) => {
      InteractionManager.runAfterInteractions(() => resolve());
    });
  }
  const gapsMs = [0, 900, 1800];
  let last = await Purchases.getOfferings();
  for (let i = 1; i < gapsMs.length; i++) {
    if (isCancelled()) {
      return last;
    }
    if (offeringsHavePackages(last)) {
      return last;
    }
    await new Promise((r) => setTimeout(r, gapsMs[i] - gapsMs[i - 1]));
    if (isCancelled()) {
      return last;
    }
    last = await Purchases.getOfferings();
  }
  if (!isCancelled() && !offeringsHavePackages(last)) {
    try {
      const synced = await Purchases.syncAttributesAndOfferingsIfNeeded();
      if (offeringsHavePackages(synced)) {
        last = synced;
      }
    } catch {
      /* optional; ignore if not applicable */
    }
  }
  return last;
}

interface PurchaseContextType {
  isLoading: boolean;
  offerings: PurchasesOfferings | null;
  customerInfo: CustomerInfo | null;
  customerInfoResolved: boolean;
  /** Backend user id RevenueCat should be linked to. */
  authAppUserId: string | null;
  /** Current RevenueCat app user id after successful link. */
  revenueCatAppUserId: string | null;
  /** False while linking an authenticated user to RevenueCat. */
  isPurchasesUserSynced: boolean;
  error: Error | null;
  handlePurchase?: (target: SubscriptionPurchaseTarget) => Promise<boolean>;
  restorePurchases?: () => Promise<void>;
  subscriptionPlan: string | null;
  expiry: string | null;
  isSubscribed: boolean;
  currentPlanId: SubscriptionPlanId | null;
  subscriptionSource: SubscriptionSource;
  refresh?: () => Promise<void>;
  syncSubscriptionFromBackend?: () => Promise<void>;
  openSubscriptionManagement?: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(
  undefined,
);

export const usePurchases = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error("usePurchases must be used within a PurchaseProvider");
  }
  return context;
};

function subscriptionFromCustomerInfo(info: CustomerInfo | null): {
  plan: string | null;
  expiry: string | null;
} {
  const parsed = parseCustomerInfoSubscription(info);
  return {
    plan: parsed.productIdentifier,
    expiry: parsed.expiry,
  };
}

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [customerInfoResolved, setCustomerInfoResolved] = useState(false);
  const [revenueCatAppUserId, setRevenueCatAppUserId] = useState<string | null>(
    null,
  );
  const [isPurchasesUserSynced, setIsPurchasesUserSynced] = useState(
    () => !getRevenueCatAppUserId(useAuthStore.getState().user),
  );
  const [error, setError] = useState<Error | null>(null);

  const user = useAuthStore((s) => s.user);
  const setIsSubscribed = useAuthStore((s) => s.setIsSubscribed);

  const sdkConfiguredRef = useRef(false);
  const [sdkReady, setSdkReady] = useState(false);
  const purchaseSyncGenerationRef = useRef(0);

  const resolvedSubscription = resolveSubscriptionStatus(
    customerInfo,
    customerInfoResolved,
  );

  const isSubscribed = resolvedSubscription.isSubscribed;
  const currentPlanId = resolvedSubscription.currentPlanId;
  const subscriptionSource = resolvedSubscription.source;

  const subscriptionPlan = subscriptionFromCustomerInfo(customerInfo).plan;
  const expiry = subscriptionFromCustomerInfo(customerInfo).expiry;

  const appUserId = getRevenueCatAppUserId(user);

  useEffect(() => {
    setIsSubscribed?.(isSubscribed);
  }, [isSubscribed, setIsSubscribed]);

  const syncSubscriptionFromBackend = useCallback(async () => {
    await queryClient?.refetchQueries?.({ queryKey: ["me"] });

    const meData = queryClient?.getQueryData?.<GetMeResponse>(["me"]);
    if (meData) {
      useAuthStore.getState().syncFromGetMeResponse(meData);
    }

    try {
      const configured = await Purchases.isConfigured();
      if (configured) {
        await Purchases.invalidateCustomerInfoCache();
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
        setCustomerInfoResolved(true);
      }
    } catch (err) {
      console.warn("[Purchases] syncSubscriptionFromBackend:", err);
    }
  }, []);

  useEffect(() => {
    if (!sdkReady || !sdkConfiguredRef.current) {
      return;
    }

    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info);
      setCustomerInfoResolved(true);
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [sdkReady]);

  useEffect(() => {
    const apiKey = getPurchaseApiKey();
    if (!apiKey) {
      setError(new Error("Purchase API key not configured for this platform"));
      setSdkReady(true);
      return;
    }
    if (sdkConfiguredRef.current) {
      return;
    }

    (async () => {
      try {
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        const configuredAppUserId = getRevenueCatAppUserId(
          useAuthStore.getState().user,
        );
        Purchases.configure({
          apiKey,
          useAmazon: false,
          ...(configuredAppUserId ? { appUserID: configuredAppUserId } : {}),
        });
        sdkConfiguredRef.current = true;
      } catch (err) {
        console.error("Error configuring Purchases:", err);
        setError(err as Error);
      } finally {
        setSdkReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!sdkReady) {
      return;
    }

    const apiKey = getPurchaseApiKey();
    if (!apiKey || !sdkConfiguredRef.current) {
      setIsLoading(false);
      setIsPurchasesUserSynced(true);
      setCustomerInfoResolved(true);
      return;
    }

    let cancelled = false;

    const syncPurchasesForCurrentUser = async () => {
      const gen = ++purchaseSyncGenerationRef.current;
      try {
        setIsLoading(true);
        setError(null);
        setCustomerInfoResolved(false);

        if (!appUserId) {
          setIsPurchasesUserSynced(true);
          setRevenueCatAppUserId(null);
          if (!cancelled) {
            setCustomerInfo(null);
            setCustomerInfoResolved(true);
            setOfferings(null);
          }
          return;
        }

        setIsPurchasesUserSynced(false);

        const info = await linkRevenueCatToUser(appUserId);
        if (cancelled) {
          return;
        }

        const linkedId = await Purchases.getAppUserID();
        setRevenueCatAppUserId(linkedId);
        setCustomerInfo(info);
        setCustomerInfoResolved(true);
        setIsPurchasesUserSynced(true);

        await new Promise<void>((resolve) => {
          InteractionManager.runAfterInteractions(() => resolve());
        });
        if (cancelled) {
          return;
        }

        await Purchases.invalidateCustomerInfoCache();

        const offeringsResult = await fetchOfferingsWithRetry(() => cancelled);
        if (!cancelled) {
          setOfferings(offeringsResult);
        }
      } catch (err) {
        console.error("Error syncing purchases for user:", err);
        if (!cancelled) {
          setError(err as Error);
          setIsPurchasesUserSynced(true);
        }
      } finally {
        if (gen === purchaseSyncGenerationRef.current) {
          setIsLoading(false);
          if (!cancelled && appUserId) {
            setCustomerInfoResolved(true);
          }
        }
      }
    };

    syncPurchasesForCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [appUserId, sdkReady]);

  const handlePurchase = async (
    target: SubscriptionPurchaseTarget,
  ): Promise<boolean> => {
    try {
      const { customerInfo: newInfo } = target.subscriptionOption
        ? await Purchases.purchaseSubscriptionOption(target.subscriptionOption)
        : await Purchases.purchasePackage(target.package);
      setCustomerInfo(newInfo);
      setCustomerInfoResolved(true);
      await syncSubscriptionFromBackend();
      showSuccessToast("Subscription activated successfully", {
        position: "top",
      });
      return true;
    } catch (err: unknown) {
      const purchaseError = err as {
        userCancelled?: boolean;
        message?: string;
      };
      if (!purchaseError.userCancelled) {
        console.error("Purchase error:", err);
        showErrorToast("Something went wrong during purchase.", {
          position: "top",
        });
      }
      return false;
    }
  };

  const restorePurchases = async () => {
    try {
      setIsLoading(true);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      setCustomerInfoResolved(true);
      await syncSubscriptionFromBackend();
      if ((info?.activeSubscriptions?.length ?? 0) > 0) {
        showSuccessToast("Your purchases have been restored.", {
          position: "top",
        });
      } else {
        showInfoToast("No previous purchases found to restore.", {
          position: "top",
        });
      }
    } catch (err) {
      console.error("Restore error:", err);
      showErrorToast("Failed to restore purchases.", { position: "top" });
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = useCallback(async () => {
    const apiKey = getPurchaseApiKey();
    if (!apiKey) {
      showErrorToast(
        "Purchase API key is missing. Check EXPO_PUBLIC_PURCHASE_* in your env.",
        { position: "top" },
      );
      return;
    }

    const uid = getRevenueCatAppUserId(user);
    if (!uid) {
      showErrorToast(
        "We could not determine your account. Sign in again, then refresh.",
        { position: "top" },
      );
      return;
    }

    let configured = sdkConfiguredRef.current;
    try {
      configured = await Purchases.isConfigured();
    } catch {
      /* fall back to ref */
    }
    if (!configured) {
      showErrorToast(
        "Subscriptions are still initializing. Wait a few seconds and try again.",
        { position: "top" },
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsPurchasesUserSynced(false);
      const info = await linkRevenueCatToUser(uid);
      const linkedId = await Purchases.getAppUserID();
      setRevenueCatAppUserId(linkedId);
      setCustomerInfo(info);
      setCustomerInfoResolved(true);
      setIsPurchasesUserSynced(true);
      await new Promise<void>((resolve) => {
        InteractionManager.runAfterInteractions(() => resolve());
      });
      await Purchases.invalidateCustomerInfoCache();
      const offeringsResult = await fetchOfferingsWithRetry(() => false);
      setOfferings(offeringsResult);
    } catch (e) {
      console.error("Error refreshing purchases:", e);
      setError(e as Error);
      showErrorToast(
        e instanceof Error
          ? e.message
          : "Could not load plans. Please try again.",
        { position: "top" },
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const openSubscriptionManagement = useCallback(async () => {
    try {
      const configured = await Purchases.isConfigured();
      if (!configured) {
        showErrorToast(
          "Subscriptions are still initializing. Wait a few seconds and try again.",
          { position: "top" },
        );
        return;
      }

      await Purchases.showManageSubscriptions();
    } catch (err) {
      const managementURL = customerInfo?.managementURL;
      if (managementURL) {
        try {
          await Linking.openURL(managementURL);
          return;
        } catch (linkErr) {
          console.warn("[Purchases] open managementURL:", linkErr);
        }
      }

      console.warn("[Purchases] showManageSubscriptions:", err);
      showErrorToast(
        Platform.OS === "android"
          ? "Could not open Google Play subscription settings."
          : "Could not open subscription settings.",
        { position: "top" },
      );
    }
  }, [customerInfo]);

  const value: PurchaseContextType = {
    isLoading,
    offerings,
    customerInfo,
    customerInfoResolved,
    authAppUserId: appUserId,
    revenueCatAppUserId,
    isPurchasesUserSynced,
    error,
    handlePurchase,
    restorePurchases,
    subscriptionPlan,
    expiry,
    isSubscribed,
    currentPlanId,
    subscriptionSource,
    refresh,
    syncSubscriptionFromBackend,
    openSubscriptionManagement,
  };

  return React.createElement(PurchaseContext.Provider, { value }, children);
};
