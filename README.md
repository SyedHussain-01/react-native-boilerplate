# Expo React Native Boilerplate

Production-oriented Expo starter for iOS and Android. It ships with native-stack navigation, auth and onboarding flows, TanStack Query, Zustand + MMKV, a shared UI kit, RevenueCat subscriptions, Google/Apple sign-in, and EAS build profiles.

This repository is the **template**. New apps are generated next to it with the project setup script.

---

## Create a new project

From the **boilerplate root** (this folder):

```bash
yarn create-project
```

Equivalent:

```bash
node scripts/create-project-from-boilerplate.js
```

The script creates the new app as a **sibling folder** of this boilerplate (same parent directory). For example:

```text
parent/
  react-native-boilerplate/     ← this template
  my-new-app/                   ← generated project
```

### Prerequisites

- **Node.js** 20+
- **Yarn** (the script runs `yarn install`)
- **Git** (optional; the script can initialize the first commit)
- **Android Studio** / Android SDK for Android builds
- **macOS + Xcode + CocoaPods** for iOS builds (`pod install` is skipped on Windows)

This boilerplate uses native modules (MMKV, Firebase Messaging, RevenueCat, Google Sign-In, Notifee). Generated apps are **development-client** projects, not Expo Go.

### Prompts

Answer `n` to **Resume setup on an existing project?** to start a new app. You will be asked for:

| Prompt                 | Notes                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| Folder name            | Letters, numbers, dots, underscores, hyphens only                   |
| App display name       | Shown under the icon                                                |
| Expo slug              | URL-safe (`my-app`)                                                 |
| URL scheme             | Deep linking (`myapp`)                                              |
| iOS bundle identifier  | e.g. `com.company.myapp`                                            |
| Android application ID | Defaults to the iOS bundle ID                                       |
| App version            | Default `1.0.0`                                                     |
| iOS build number       | Default `1`                                                         |
| Expo SDK version       | Number (e.g. `54`) or `latest`. Default in the script is `54`       |
| Expo owner             | Optional EAS account / org                                          |
| Initialize git         | Default yes; creates `Initial commit from react-native boilerplate` |

Confirm the summary, then the script runs end to end.

### Resume a failed or partial setup

If install, prebuild, or pods failed, run the same command again and answer **yes** to resume:

```bash
yarn create-project
```

The script lists sibling projects and continues from the first incomplete step. Progress is stored in `.boilerplate-setup-state.json` inside the target app (gitignored).

### What the script does

1. `npx create-expo-app` with `blank-typescript@sdk-<version>` (`--no-install`) — default SDK **54**; other majors allowed (confirm if not 54)
2. Copy `src/` and app icon assets
3. Copy root files: `App.tsx`, `index.ts`, `firebase.json`, `eas.json`, `.gitignore`
4. Copy `.agents/` and `.cursor/` (AI skills and MCP config)
5. Copy config files (`.env.example`, `tsconfig.json`, `babel.config.js`, ESLint, Prettier if present)
6. Write `app.json` with your name, slug, scheme, bundle IDs (clears the boilerplate EAS `projectId`)
7. Merge `package.json` **scripts** only (does **not** copy dependency version pins)
8. `yarn install` (template cores for the selected SDK)
9. `npx expo install <boilerplate package names>` so versions match the **selected** SDK
10. `npx expo install --fix` (hard-fail)
11. `npx expo-doctor` + `npx tsc --noEmit` (hard-fail)
12. `npx expo prebuild --no-install` → `android/` and `ios/`
13. Patch `ios/Podfile` for React Native Firebase (`$RNFirebaseDisableSPM` + modular headers)
14. `pod install` on macOS
15. Optional `git init` + first commit

### After the script finishes

```bash
cd ../your-project-folder
cp .env.example .env          # Windows: copy .env.example .env
```

Fill `.env` keys when you are ready (API, RevenueCat, Google client IDs). Push/Firebase native wiring is **deferred** until you add services files (see [Enable Firebase / push later](#enable-firebase--push-later)). Link EAS (`eas init` / projectId) manually when you start cloud builds.

Then:

```bash
yarn android                  # build & install the Android dev client
yarn ios                      # macOS only — build & install the iOS dev client
yarn start                    # Metro for the development client
```

On Windows, use Android or a cloud Mac builder for iOS.

---

## Stack

| Area                 | Choice                                                                               |
| -------------------- | ------------------------------------------------------------------------------------ |
| Runtime              | Expo SDK **54** in this template (`expo ~54`), React **19.1**, React Native **0.81** |
| Architecture         | New Architecture on (`newArchEnabled`), React Compiler on                            |
| Entry                | `index.ts` → `App.tsx` (not Expo Router)                                             |
| Navigation           | React Navigation 7 — `@react-navigation/native-stack` + bottom tabs                  |
| Data fetching        | TanStack Query + Axios (`src/api/api.ts`)                                            |
| Client state         | Zustand, persisted with MMKV                                                         |
| Forms                | React Hook Form (`src/utils/rules.ts`)                                               |
| UI                   | Shared kit in `src/components/common`, `react-native-size-matters`, `expo-image`     |
| Keyboard             | `react-native-keyboard-controller`                                                   |
| Gestures / animation | Gesture Handler, Reanimated 4, Lottie                                                |
| Auth extras          | Google Sign-In, Apple Authentication                                                 |
| Push                 | `@react-native-firebase/messaging`, Notifee                                          |
| Subscriptions        | RevenueCat (`react-native-purchases`)                                                |
| Builds               | `expo-dev-client`, EAS (`eas.json`)                                                  |

Path alias: `@/*` maps to the project root (`tsconfig.json`). Prefer `@/src/...` for app code.

---

## Running this boilerplate directly

You can also run **this** repo as an app (after filling `app.json` name / slug / identifiers):

```bash
yarn install
cp .env.example .env
npx expo prebuild
yarn android
# or yarn ios
yarn start
```

| Script                | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| `yarn create-project` | Scaffold or resume a sibling app from this template |
| `yarn start`          | `expo start --dev-client`                           |
| `yarn android`        | `expo run:android`                                  |
| `yarn ios`            | `expo run:ios`                                      |
| `yarn web`            | `expo start --web`                                  |
| `yarn prebuild`       | `expo prebuild`                                     |
| `yarn lint`           | `expo lint`                                         |

`scripts/reset-project.js` is leftover from `create-expo-app`. Do **not** use it on this boilerplate — it is meant for Expo Router blank apps, not this `src/` layout.

---

## Environment variables

Copy `.env.example` to `.env`. Expo inlines variables that start with `EXPO_PUBLIC_`.

| Variable                           | Used for                                              |
| ---------------------------------- | ----------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`         | REST origin. Client requests go to `{BASE}/api/v1`    |
| `EXPO_PUBLIC_UPLOAD_FILE_KEY`      | Bearer token for multipart uploads (`src/api/upload`) |
| `EXPO_PUBLIC_PURCHASE_IOS_KEY`     | RevenueCat iOS API key                                |
| `EXPO_PUBLIC_PURCHASE_ANDROID_KEY` | RevenueCat Android API key                            |

Restart Metro after changing `.env`. Never commit `.env`.

Add Google Sign-In client IDs via `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` in `.env` (see `src/hooks/useGoogleSignIn.ts`).

### Enable Firebase / push later

Scaffold does **not** register `@react-native-firebase/app` in `plugins`, so prebuild works without Firebase console files. JS packages stay installed; iOS Podfile patching still runs via `./plugins/withRnFirebaseIos.js`.

When you have real files from the Firebase console:

1. Place them at the project root (or another path you prefer):
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)
2. In `app.json`:
   - Set `expo.android.googleServicesFile` → `"./google-services.json"`
   - Set `expo.ios.googleServicesFile` → `"./GoogleService-Info.plist"`
   - Add `"@react-native-firebase/app"` to `expo.plugins` (keep `./plugins/withRnFirebaseIos.js`)
3. Regenerate native projects:

```bash
npx expo prebuild --clean
cd ios && pod install   # macOS
```

Until then, push token fetch may no-op; the app should still boot.

---

## Project structure

```text
.
├── App.tsx                 # Providers, splash, NavigationContainer
├── index.ts                # registerRootComponent
├── app.json                # Expo config, plugins, icons, scheme
├── eas.json                # development / preview / production
├── firebase.json           # FCM iOS foreground presentation
├── scripts/
│   └── create-project-from-boilerplate.js
└── src/
    ├── api/                # Axios client, endpoints, auth & upload hooks
    ├── assets/             # Icons referenced by app.json (copied by the script)
    ├── components/         # Shared UI, settings, subscription, splash
    ├── constants/          # Dummy UI data, remote placeholder images
    ├── hooks/              # Feature hooks (auth, purchases, image picker, …)
    ├── navigation/         # Root, Auth, Onboarding, Main, BottomBar
    ├── providers/          # QueryClientProvider
    ├── screens/
    │   ├── auth/
    │   ├── onboarding/
    │   └── main/
    ├── store/              # Zustand + MMKV
    ├── theme/              # palette + navigation theme
    ├── types/              # Navigation param lists
    └── utils/              # Validation, toasts, onboarding routing
```

---

## App shell (`App.tsx`)

Bootstrap order:

1. `SafeAreaProvider`
2. `QueryProvider` (TanStack Query)
3. `GestureHandlerRootView`
4. `KeyboardProvider`
5. `NavigationContainer` (`navigationRef`, `theme.navigation`)
6. `BottomSheetModalProvider`
7. `RootNavigator`
8. Custom splash `Modal` (minimum ~5s, then fade)
9. `Toast` (`react-native-toast-message`)

Fonts load via `expo-font` (`useFonts`). Embed production fonts with the `expo-font` config plugin in `app.json` (currently `"fonts": []`).

---

## Navigation

Native stack at the root. Typed in `src/types/navigation.ts`.

```text
RootNavigator
├── Auth          → AuthStack (unauthenticated)
├── Onboarding    → OnboardingStack (signed in, profile/questionnaire incomplete)
└── MainApp       → MainStack → BottomBar + settings screens
```

`RootNavigator` picks the tree from `useAuthStore` (`token` / `user`) and `getRootRouteAfterAuth` in `src/utils/onboardingRouting.ts`.

Helpers in `src/navigation/navigationRef.ts`:

- `resetRootToAuthSignIn()` — logout / JWT expired
- `resetRootToMainApp()`
- `resetRootToOnboardingProfileSetup()`
- `resetRootAfterAuth(user)`

### Auth stack

Signup (initial) → Signin → Forgot password → OTP → Reset password, plus Privacy Policy and Terms.

GetStarted / GetStartedTwo / GetStartedThree screens exist but are not registered on `AuthStack` yet.

Sign-in currently uses a **dummy** submit that calls `resetRootToMainApp()`. Wire `src/hooks/signin/useSignin.ts` (and signup / OTP hooks) when the API is ready.

### Onboarding stack

- **ProfileSetup** if the profile is incomplete
- **OnboardingPlaceholder** otherwise

Completion uses `isProfileCompleted` / `isQuestionCompleted` on the user (with a field-based fallback in `onboardingRouting.ts` that you should adapt to your product).

### Main stack

- **BottomBar** — four placeholder tabs (`Placeholder1`–`Placeholder4`) and a custom floating tab bar
- Settings, Change Password, Contact Us, Privacy, Terms, Notifications, ProfileSetup

`MainStackParamList` may include extra typed routes for screens you have not added yet. Treat unused entries as stubs and trim or replace them for your product.

RevenueCat paywall hooks in `MainStack` are commented out. Re-enable `usePurchases` + `useSubscriptionPaywall` when subscriptions go live.

---

## Auth and session

`src/store/auth.store.ts` is the source of truth: token, refresh token, user, profile flags, subscription snapshot, linked provider. State is persisted to MMKV (`auth-storage`).

| Method                         | When                                |
| ------------------------------ | ----------------------------------- |
| `applyLoginResponse`           | POST login                          |
| `applyVerifyOtpResponse`       | OTP success                         |
| `syncFromGetMeResponse`        | GET `/auth/me`                      |
| `syncFromLinkProviderResponse` | Link social provider                |
| `clearAuth`                    | Logout — also `queryClient.clear()` |

`src/store/syncMeAfterAuth.ts` refreshes `/auth/me` after login or OTP.

On **401** (`jwt expired` / `access denied`), `fetchFromAPI` clears auth and resets to Signin.

### Social login

- `useGoogleSignIn` — `@react-native-google-signin/google-signin` (fill client IDs)
- `useAppleSignIn` — `expo-apple-authentication` (iOS only)

---

## API layer

`src/api/api.ts`:

- Base URL: `EXPO_PUBLIC_API_BASE_URL` + `/api/v1`
- Attaches `Authorization: Bearer <token>`
- `useApiQuery` / `useApiMutation` wrap TanStack Query
- Errors surface via toast unless `suppressErrorToast` is set

Put path constants in `src/api/endpoints.ts`. Auth hooks expect an `AUTH` object with:

`SIGNUP`, `LOGIN`, `VERIFY_OTP`, `RESEND_OTP`, `FORGOT_PASSWORD`, `RESET_PASSWORD`, `ME`, `CHANGE_PASSWORD`

Upload: `UPLOAD.UPLOAD_IMAGE` → `/upload/file` (multipart, `EXPO_PUBLIC_UPLOAD_FILE_KEY`).

Feature hooks live next to screens, e.g. `src/hooks/signin/useSignin.ts`, `src/hooks/signup/useSignup.ts`.

Query defaults (`QueryProvider`): retry 2, stale 5 minutes, gc 24 hours, no refetch on window focus.

---

## State and storage

| Store        | File                              | Persistence                      |
| ------------ | --------------------------------- | -------------------------------- |
| Auth         | `src/store/auth.store.ts`         | MMKV `auth-storage`              |
| App          | `src/store/store.ts`              | MMKV `app-storage` (`isLoading`) |
| Device token | `src/store/deviceTokenStorage.ts` | Used on signup/login             |

MMKV instance: `src/store/mmkv_config.ts` (`id: "app-storage"`). Change `encryptionKey` per product before shipping.

Prefer Zustand **selectors** in lists so items do not re-render on unrelated store updates.

---

## UI and theme

Brand colors live in `src/theme/colors.ts` (`palette`). Import `palette` / `theme` from `src/theme`, then replace the palette for your product.

Shared components (`src/components/common`):

| Component                                                                         | Role                                                                  |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `AppText`                                                                         | Weight + size scale (`xs`–`5xl`); swap the font family for your brand |
| `AppImage`                                                                        | `expo-image`                                                          |
| `Button`                                                                          | `primary` / `outlined` / `text`                                       |
| `TextInput`                                                                       | Forms (React Hook Form `control`)                                     |
| `AppHeader` / `MainHeader`                                                        | Screen headers                                                        |
| `MainWrapper`                                                                     | Safe area + background image                                          |
| `BottomSheet`                                                                     | `@gorhom/bottom-sheet`                                                |
| `KeyboardAvoidingScrollView`                                                      | Keyboard-aware screens                                                |
| `SearchBar`, `Dropdown`, `UserAvatar`, `ProgressBar`, `Seekbar`, `FAQItem`, `Fab` | Common controls                                                       |

Scale spacing with `scale` / `verticalScale` / `moderateScale` from `react-native-size-matters`.

Placeholder images and tab icons: `src/constants/remotePlaceholders.ts`. Dummy profile: `src/constants/dummyUiData.ts`.

---

## Native features

### Subscriptions (RevenueCat)

`src/hooks/usePurchases.ts` configures Purchases from `EXPO_PUBLIC_PURCHASE_*` keys, maps yearly/monthly packages, and can merge store status with API `isSubscribed`. `PurchasesAuthSyncGate` and `useSubscriptionPaywall` are ready to gate MainApp.

Settings includes **Manage Subscription** (`ManageSubscription` in the param list). Add the screen and wire the hook when products exist in App Store Connect / Play Console / RevenueCat.

### Push notifications

Packages `@react-native-firebase/app` and `messaging` are dependencies, but the **`@react-native-firebase/app` config plugin is not registered** until you add services files (see [Enable Firebase / push later](#enable-firebase--push-later)). `firebase.json` still documents FCM iOS foreground options. `app.json` keeps push-related entitlements/permissions for when you enable native Firebase.

`NotificationListener` is a stub. `src/hooks/notifications/useNotifications.ts` expects a notifications API — implement that when the backend is ready.

### Share, images, haptics

- `react-native-share` (Facebook, Instagram, Twitter, TikTok, WhatsApp) via `src/hooks/useShare.ts`
- `expo-image-picker` + `ImagePickerBottomSheet` / `useImagePicker`
- `expo-haptics`, `expo-video`, `expo-blur`

---

## EAS and app config

`eas.json` profiles:

| Profile       | Use                               |
| ------------- | --------------------------------- |
| `development` | Dev client, internal distribution |
| `preview`     | Internal distribution             |
| `production`  | Store builds (`autoIncrement`)    |

After generating a project, run `eas init` (or `eas build:configure`) so `extra.eas.projectId` is set. The setup script **does not** copy the boilerplate `projectId`.

`app.json` plugins already include: `expo-dev-client`, splash screen, image picker, share, fonts, video, build-properties (Notifee Maven + static iOS frameworks), `./plugins/withRnFirebaseIos.js` (Podfile SPM/modular headers), Google Sign-In, Apple Authentication. **`@react-native-firebase/app` is omitted until you enable push** (see above).

Replace icons under `src/assets/icons/` (`app_icon.png`, `app_logo.png`, Android adaptive icons, `favicon.png`). Update splash colors in `app.json` to match your brand.

---

## Agent tooling

The create-project script copies:

- **`.agents/`** — Expo / React Native skills for Cursor and similar agents
- **`.cursor/mcp.json`** — Expo MCP and React Native MCP servers

Keep those folders in generated apps so AI-assisted work follows the same navigation, data-fetching, and performance rules.

---

## Conventions

- Use **native stack** (`createNativeStackNavigator`), not JS stack.
- Wrap strings in `<Text>` / `AppText`. Do not use `{value && <View />}` when `value` can be `0` or `""`.
- Use `Pressable` (or Gesture Handler `Pressable` in lists), not `TouchableOpacity`, for new controls.
- Animate `transform` and `opacity`, not layout properties.
- Virtualize long lists (`FlatList` / FlashList / LegendList). Keep list items light; pass primitives.
- Install native packages with `npx expo install <pkg>` so versions stay SDK-compatible.
- Put API paths in `endpoints.ts`. Put domain types next to the feature (`src/api/auth/type.ts`).

---

## First product steps

1. Generate the app with `yarn create-project`.
2. Fill `.env`, bundle IDs, and Google/Apple client IDs. Enable Firebase/push only when you have services files (see above).
3. Define `AUTH` (and other) routes in `src/api/endpoints.ts`.
4. Point Signin / Signup / OTP screens at the existing hooks instead of dummy navigation.
5. Replace `Placeholder1`–`Placeholder4` with real tabs; register extra `MainStack` screens as needed.
6. Embed fonts in the `expo-font` plugin and rebuild.
7. Turn on `useGetMeQuery` and the RevenueCat paywall when backend and store products are live.
8. `eas init`, then `eas build --profile development` for a shared dev client.
