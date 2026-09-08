import {
  CommonActions,
  createNavigationContainerRef,
} from "@react-navigation/native";
import type { AuthUserRecord } from "../store/auth.store";
import {
  getOnboardingEntryScreen,
  getRootRouteAfterAuth,
} from "../utils/onboardingRouting";
import type { RootStackParamList } from "../types/navigation";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Root → Auth stack with **Signin** active (logout, session expired). */
export function resetRootToAuthSignIn() {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: "Auth",
          state: {
            routes: [{ name: "Signin" }],
            index: 0,
          },
        },
      ],
    }),
  );
}

/** Root → Main app. */
export function resetRootToMainApp() {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: "MainApp" }],
    }),
  );
}

/** Root → ProfileSetup (first onboarding screen). */
export function resetRootToOnboardingProfileSetup() {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: "Onboarding",
          state: {
            routes: [
              {
                name: "ProfileSetup",
                params: { from: "onboarding" },
              },
            ],
            index: 0,
          },
        },
      ],
    }),
  );
}

/** Root → MarketingOne (first screen after ProfileSetup). */
export function resetRootToOnboardingMarketingOne() {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: "Onboarding",
          state: {
            routes: [{ name: "MarketingOne" }],
            index: 0,
          },
        },
      ],
    }),
  );
}

/** Route authenticated users to MainApp or the correct onboarding entry screen. */
export function resetRootAfterAuth(user: AuthUserRecord) {
  if (!navigationRef.isReady()) {
    return;
  }
  if (getRootRouteAfterAuth(user) === "MainApp") {
    resetRootToMainApp();
    return;
  }
  const entry = getOnboardingEntryScreen(user);
  if (entry === "OnboardingPlaceholder") {
    resetRootToOnboardingMarketingOne();
  } else {
    resetRootToOnboardingProfileSetup();
  }
}
