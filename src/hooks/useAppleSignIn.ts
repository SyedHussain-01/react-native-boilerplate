import * as AppleAuthentication from "expo-apple-authentication";
import { useCallback } from "react";
import { Platform } from "react-native";
import { getEmailFromAppleIdentityToken } from "../utils/appleIdentityToken";

export function useAppleSignIn() {
  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== "ios") {
      console.log("[apple-sign-in] only available on iOS");
      return;
    }

    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      console.log("[apple-sign-in] not available on this device");
      return;
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = credential.identityToken;
      if (!identityToken) {
        console.log("[apple-sign-in] missing identityToken");
        return;
      }

      const email =
        credential.email?.trim() ||
        getEmailFromAppleIdentityToken(identityToken);
      if (!email) {
        console.log("[apple-sign-in] missing email");
        return;
      }

      const firstName = credential.fullName?.givenName?.trim() || "";
      const lastName = credential.fullName?.familyName?.trim() || "";

      console.log("[apple-sign-in] fetched info", {
        email,
        firstName,
        lastName,
        imageUrl: "",
        identityToken,
        appleUserId: credential.user,
      });

      console.log("[apple-sign-in] social-login payload", {
        clientId: "[redacted]",
        authType: "email",
        email,
        firstName,
        lastName,
        imageUrl: "",
        platform: "apple",
      });
    } catch (error: unknown) {
      const code =
        error &&
        typeof error === "object" &&
        "code" in error &&
        String((error as { code: unknown }).code);
      if (code === "ERR_REQUEST_CANCELED") {
        console.log("[apple-sign-in] cancelled by user");
      } else {
        console.log("[apple-sign-in] error", error);
      }
    }
  }, []);

  return { signInWithApple };
}
