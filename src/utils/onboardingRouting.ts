import type { AuthUserRecord } from "../store/auth.store";

function fieldFilled(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (typeof value === "number") {
    return !Number.isNaN(value);
  }
  return true;
}

/** Fallback when API does not send `isProfileCompleted`. */
export function profileCompleteFromUser(user: AuthUserRecord): boolean {
  if (!user || typeof user !== "object") {
    return false;
  }
  return (
    fieldFilled(user.dateOfBirth) &&
    fieldFilled(user.height) &&
    fieldFilled(user.currentWeight) &&
    fieldFilled(user.targetGoal)
  );
}

function readBooleanFlag(
  source: Record<string, unknown> | null | undefined,
  key: string,
): boolean | undefined {
  const value = source?.[key];
  return typeof value === "boolean" ? value : undefined;
}

/** Reads onboarding flags from API payload and/or nested `user`. */
export function parseOnboardingFlags(
  data: unknown,
  user: AuthUserRecord,
): { isProfileCompleted: boolean; isQuestionCompleted: boolean } {
  const payload = data as Record<string, unknown> | null | undefined;
  const userRecord = user as Record<string, unknown> | null | undefined;

  const profileFromApi =
    readBooleanFlag(payload, "isProfileCompleted") ??
    readBooleanFlag(userRecord, "isProfileCompleted");
  const questionFromApi =
    readBooleanFlag(payload, "isQuestionCompleted") ??
    readBooleanFlag(userRecord, "isQuestionCompleted");

  return {
    isProfileCompleted:
      profileFromApi ?? profileCompleteFromUser(user),
    isQuestionCompleted: questionFromApi ?? false,
  };
}

export function applyOnboardingFlagsToUser(
  user: AuthUserRecord,
  flags: { isProfileCompleted: boolean; isQuestionCompleted: boolean },
): AuthUserRecord {
  if (!user || typeof user !== "object") {
    return user;
  }
  return {
    ...user,
    isProfileCompleted: flags.isProfileCompleted,
    isQuestionCompleted: flags.isQuestionCompleted,
  };
}

export function isProfileCompletedFromUser(user: AuthUserRecord): boolean {
  if (!user || typeof user !== "object") {
    return false;
  }
  const flag = user.isProfileCompleted;
  return typeof flag === "boolean" ? flag : profileCompleteFromUser(user);
}

export function isQuestionCompletedFromUser(user: AuthUserRecord): boolean {
  if (!user || typeof user !== "object") {
    return false;
  }
  const flag = user.isQuestionCompleted;
  return typeof flag === "boolean" ? flag : false;
}

/** Profile + questionnaire done — user may enter the main app (subscription paywall applies separately). */
export function isFullyOnboarded(user: AuthUserRecord): boolean {
  return (
    isProfileCompletedFromUser(user) && isQuestionCompletedFromUser(user)
  );
}

export function shouldEnterMainApp(user: AuthUserRecord): boolean {
  return isFullyOnboarded(user);
}

export type OnboardingEntryScreen = "OnboardingPlaceholder" | "ProfileSetup" ;

/** First onboarding screen based on API completion flags. */
export function getOnboardingEntryScreen(
  user: AuthUserRecord,
): OnboardingEntryScreen {
  if (!isProfileCompletedFromUser(user)) {
    return "ProfileSetup";
  }
  return "OnboardingPlaceholder";
}

export type RootRouteAfterAuth = "MainApp" | "Onboarding";

export function getRootRouteAfterAuth(user: AuthUserRecord): RootRouteAfterAuth {
  if (shouldEnterMainApp(user)) {
    return "MainApp";
  }
  return "Onboarding";
}
