import type { RemoteMessage } from "@react-native-firebase/messaging";
import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../navigation/navigationRef";

const NAV_READY_POLL_MS = 100;
const NAV_READY_MAX_ATTEMPTS = 50;

type NotificationPayload = Record<string, string | object | undefined>;

const asString = (value: string | object | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeNotifeeData = (
  data: Record<string, string | number | object | undefined>,
): NotificationPayload => {
  const normalized: NotificationPayload = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" || typeof value === "object") {
      normalized[key] = value;
    } else if (typeof value === "number") {
      normalized[key] = String(value);
    }
  }
  return normalized;
};

const navigateMainScreen = (screen: string, params?: object) => {
  navigationRef.dispatch(
    CommonActions.navigate({
      name: "MainApp",
      params: {
        screen,
        params,
      },
    }),
  );
};

export const runWhenNavigationReady = (callback: () => void): void => {
  let attempts = 0;

  const tryRun = () => {
    if (navigationRef.isReady()) {
      callback();
      return;
    }

    attempts += 1;
    if (attempts >= NAV_READY_MAX_ATTEMPTS) {
      if (__DEV__) {
        console.warn("[PushNav] navigation not ready after max attempts");
      }
      return;
    }

    setTimeout(tryRun, NAV_READY_POLL_MS);
  };

  tryRun();
};

export const navigateFromPayload = (data: NotificationPayload): void => {
  if (!navigationRef.isReady()) {
    return;
  }

  const screen =
    asString(data.screen) ??
    asString(data.route) ??
    asString(data.redirectTo) ??
    asString(data.redirect_to);

  const type = asString(data.type) ?? asString(data.kind);

  const challengeId =
    asString(data.challengeId) ?? asString(data.challenge_id);
  const color = asString(data.color) ?? "#13276F";
  const recipeId = asString(data.recipeId) ?? asString(data.recipe_id);
  const systemId = asString(data.systemId) ?? asString(data.system_id);
  const lessonId = asString(data.lessonId) ?? asString(data.lesson_id);
  const foodId = asString(data.foodId) ?? asString(data.food_id);

  if (screen === "ChallengeDetails" && challengeId) {
    navigateMainScreen("ChallengeDetails", { challengeId, color });
    return;
  }

  if (screen === "RecipeDetails" && recipeId) {
    navigateMainScreen("RecipeDetails", { recipeId });
    return;
  }

  if (screen === "SystemDetails" && systemId) {
    navigateMainScreen("SystemDetails", { systemId });
    return;
  }

  if (screen === "LessonDetails" && lessonId) {
    navigateMainScreen("LessonDetails", { lessonId });
    return;
  }

  if (screen === "MealDetails" && foodId) {
    navigateMainScreen("MealDetails", { foodId });
    return;
  }

  if (screen) {
    navigateMainScreen(screen);
    return;
  }

  switch (type) {
    case "challenge":
      if (challengeId) {
        navigateMainScreen("ChallengeDetails", { challengeId, color });
        return;
      }
      break;
    case "meal":
      navigateMainScreen("LogMeal");
      return;
    case "streak":
      navigateMainScreen("StreakDays");
      return;
    case "recipe":
      if (recipeId) {
        navigateMainScreen("RecipeDetails", { recipeId });
        return;
      }
      break;
    case "system":
      if (systemId) {
        navigateMainScreen("SystemDetails", { systemId });
        return;
      }
      break;
    case "lesson":
      if (lessonId) {
        navigateMainScreen("LessonDetails", { lessonId });
        return;
      }
      break;
    default:
      break;
  }

  navigateMainScreen("Notifications");
};

export const navigateFromRemoteMessage = (remoteMessage: RemoteMessage): void => {
  navigateFromPayload(remoteMessage.data ?? {});
};

export const navigateFromNotifeeData = (
  data: Record<string, string | number | object | undefined>,
): void => {
  navigateFromPayload(normalizeNotifeeData(data));
};

export const handleNotificationOpen = (
  remoteMessage?: RemoteMessage,
): void => {
  if (!remoteMessage) {
    return;
  }

  runWhenNavigationReady(() => {
    navigateFromRemoteMessage(remoteMessage);
  });
};
