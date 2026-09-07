export type DummyNotificationKind = "meal" | "streak" | "challenge" | "general";

export type DummyNotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  kind: DummyNotificationKind;
};

export type DummyNotificationSection = {
  title: string;
  data: DummyNotificationItem[];
};

export const dummyUserProfile = {
  id: "demo-user-001",
  firstName: "Demo",
  lastName: "User",
  fullName: "Demo User",
  email: "demo.user@example.com",
  avatar: "https://placehold.co/160x160/E2E8F0/475569.png?text=DU",
} as const;

export const dummyProviderProfile = {
  userId: "demo-provider-001",
  userName: "Demo Provider",
  avatarUrl: "https://placehold.co/160x160/DBEAFE/1D4ED8.png?text=DP",
} as const;

export const dummyPointsBalance = "120";

export const dummyNotificationSections: DummyNotificationSection[] = [
  {
    title: "Today",
    data: [
      {
        id: "notif-1",
        title: "Meal Logged",
        body: "Your breakfast entry was saved successfully.",
        createdAt: "2026-06-22T09:15:00.000Z",
        read: false,
        kind: "meal",
      },
      {
        id: "notif-2",
        title: "3 Day Streak",
        body: "You have stayed consistent for three days in a row.",
        createdAt: "2026-06-22T07:45:00.000Z",
        read: false,
        kind: "streak",
      },
    ],
  },
  {
    title: "Earlier",
    data: [
      {
        id: "notif-3",
        title: "Challenge Updated",
        body: "Your weekly challenge progress has been refreshed.",
        createdAt: "2026-06-21T16:20:00.000Z",
        read: true,
        kind: "challenge",
      },
      {
        id: "notif-4",
        title: "Friendly Reminder",
        body: "Remember to log your next meal and check your progress.",
        createdAt: "2026-06-20T11:05:00.000Z",
        read: true,
        kind: "general",
      },
    ],
  },
];

export const dummySubscriptionDebug = {
  authAppUserId: "demo-user-001",
  revenueCatAppUserId: "rc-demo-user-001",
  subscriptionSource: "dummy-local-state",
  isSubscribed: true,
  isPurchasesUserSynced: true,
  customerInfoResolved: true,
  activeEntitlements: ["premium_monthly (demo_plan, exp: never)"],
  allEntitlements: ["premium_monthly [active] (demo_plan)"],
} as const;
