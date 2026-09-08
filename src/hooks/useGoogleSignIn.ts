import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useCallback } from "react";

GoogleSignin.configure({
  webClientId: "",
  iosClientId: "",
});

export function useGoogleSignIn() {
  const signInWithGoogle = useCallback(async () => {
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
