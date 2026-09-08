import { CommonActions } from "@react-navigation/native";
import { useEffect } from "react";
import { navigationRef } from "../navigation/navigationRef";
import type { MainStackParamList } from "../types/navigation";

const PAYWALL_ALLOWED_ROUTES = new Set<keyof MainStackParamList>([
  "ManageSubscription",
  "TermsAndConditions",
  "PrivacyPolicy",
]);

const getMainStackRouteName = (): keyof MainStackParamList | undefined => {
  if (!navigationRef?.isReady?.()) {
    return undefined;
  }

  const rootState = navigationRef?.getRootState?.();
  const mainAppRoute = rootState?.routes?.find?.(
    (route) => route?.name === "MainApp",
  );
  const mainState = mainAppRoute?.state;
  const current = mainState?.routes?.[mainState?.index ?? 0];
  return current?.name as keyof MainStackParamList | undefined;
};

/** Keeps unsubscribed users on the subscription paywall inside MainApp. */
export const useSubscriptionPaywall = (
  isSubscribed: boolean,
  isPurchasesUserSynced: boolean,
) => {
  useEffect(() => {
    if (isSubscribed || !isPurchasesUserSynced) {
      return;
    }

    const enforcePaywall = () => {
      if (!navigationRef?.isReady?.()) {
        return;
      }

      const routeName = getMainStackRouteName();
      if (!routeName || PAYWALL_ALLOWED_ROUTES.has(routeName)) {
        return;
      }

      navigationRef?.dispatch?.(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "MainApp",
              state: {
                routes: [
                  {
                    name: "ManageSubscription",
                    params: { from: "paywall" },
                  },
                ],
                index: 0,
              },
            },
          ],
        }),
      );
    };

    enforcePaywall();
    const unsubscribe = navigationRef?.addListener?.("state", enforcePaywall);
    return () => {
      unsubscribe?.();
    };
  }, [isSubscribed, isPurchasesUserSynced]);
};
