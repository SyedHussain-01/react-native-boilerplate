import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useCallback } from "react";

function getGoogleClientIds() {
  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || "";
  const iosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || "";
  return { webClientId, iosClientId };
}

function ensureGoogleSignInConfigured(): boolean {
  const { webClientId, iosClientId } = getGoogleClientIds();
  if (!webClientId && !iosClientId) {
    return false;
  }

  GoogleSignin.configure({
    webClientId: webClientId || undefined,
    iosClientId: iosClientId || undefined,
  });
  return true;
}

export function useGoogleSignIn() {
  const signInWithGoogle = useCallback(async () => {
    if (!ensureGoogleSignInConfigured()) {
      console.log(
        "[google-sign-in] missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID / EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
      );
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        console.log("[google-sign-in] cancelled by user", response);
        return;
      }

      const googlePayload = response.data;
      const googleUser = googlePayload.user;
      if (!googleUser?.email) {
        console.log("[google-sign-in] missing email on Google account");
        return;
      }

      let idToken = googlePayload.idToken;
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
      }
      if (!idToken) {
        console.log("[google-sign-in] missing idToken");
        return;
      }

      let firstName = googleUser.givenName?.trim() || "";
      let lastName = googleUser.familyName?.trim() || "";
      if (!firstName && !lastName && googleUser.name) {
        const parts = googleUser.name.trim().split(/\s+/);
        firstName = parts[0] ?? "";
        lastName = parts.slice(1).join(" ") || "";
      }

      console.log("[google-sign-in] fetched info", {
        email: googleUser.email,
        firstName,
        lastName,
        imageUrl: googleUser.photo ?? "",
        idToken,
      });
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log("[google-sign-in] operation already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log(
              "[google-sign-in] play services not available or outdated",
            );
            break;
          default:
            console.log("[google-sign-in] error", error.code, error);
        }
      } else {
        console.log("[google-sign-in] non-google error", error);
      }
    }
  }, []);

  return { signInWithGoogle };
}
