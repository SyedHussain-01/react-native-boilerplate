import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  Auth: undefined;
  MainApp: undefined;
  Onboarding: {
    screen?:
      | "MarketingOne"
      | "MarketingTwo"
      | "MarketingThree"
      | "MarketingFour"
      | "MarketingFive"
      | "MarketingSix"
      | "StartAssessment"
      | "Questionairre"
      | "ProfileSetup"
      | "Feedback"
      | "BodyNeeds";
  };
};

export type AuthStackParamList = {
  GetStarted: undefined;
  GetStartedTwo: undefined;
  GetStartedThree: undefined;
  Signin: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  OtpVerification: {
    email: string;
    userId?: string;
    from: "forgot-password" | "signup" | "signin";
  };
  ResetPassword: {
    userId: string;
    email: string;
    otp: string;
  };
  Onboarding: undefined;
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
};

export type OnboardingStackParamList = {
  OnboardingPlaceholder: undefined;
  ProfileSetup: undefined;
  MainApp: undefined;
};

export type MainTabParamList = {
  Placeholder1: undefined;
  Placeholder2: undefined;
  Placeholder3: undefined;
  Placeholder4: undefined;
};

/** Serializable recipe rows passed into Log Meal from Recipe Details */
export type LogMealPresetIngredient = {
  id: string;
  name: string;
  calories: string;
  imageUri?: string;
};

export type MainStackParamList = {
  BottomBar: NavigatorScreenParams<MainTabParamList> | undefined;
  GreenDaysLogged: undefined;
  DailyStats: undefined;
  DailyChecklist: undefined;
  StreakDays: undefined;
  LogMeal: { presetIngredients?: LogMealPresetIngredient[] };
  StoreProviders: undefined;
  StoreProducts: {
    userId: string;
    userName: string;
    avatarUrl?: string | null;
  };
  ViewLogMeal: { variant?: "mealPlan" };
  MealDetails: { foodId: string };
  SystemDetails: { systemId: string };
  SuggestedItems: { foodGroupId: string; period: "daily" | "weekly" };
  LessonDetails: { lessonId: string };
  ReferralProgram: undefined;
  RecipeLibrary: { type: "library" | "saved" };
  RecipeDetails: { recipeId: string };
  BadgesChallenges: { initialTab?: "badges" | "challenges" } | undefined;
  ChallengeDetails: { challengeId: string; color: string };
  /** Legacy full-layout backup of challenge detail (participants + timer). */
  ChallengeDetailsBackup: { challengeId: string; color: string };
  ShoppingListGenerator: undefined;
  MealPlanDetail: { categoryId: string };
  MilestoneSharing: undefined;
  PointsHistory: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  ContactUs: undefined;
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
  ManageSubscription: {
    from: "settings" | "questionairre" | "marketing-two" | "paywall";
  };
  FAQS: undefined;
  Notifications: undefined;
  ProfileSetup: { from: "settings" | "onboarding" };
  MainApp: undefined;
};
