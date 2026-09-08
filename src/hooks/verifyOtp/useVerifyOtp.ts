import { useVerifyOtpMutation } from "../../api/auth";
import type { VerifyOtpRequest, VerifyOtpResponse } from "../../api/auth/type";
import { useAuthStore } from "../../store/auth.store";
import { syncMeAfterAuth } from "../../store/syncMeAfterAuth";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

interface APIError {
  message: string;
  status: number;
}

type UseVerifyOtpReturn = {
  verifyOtp: (otp: string) => void;
  isLoading: boolean;
  error: APIError | null;
};

export type VerifyOtpSuccessPayload = {
  token: string;
  refreshToken?: string;
  tokenType?: string;
  userId: string;
  user?: Record<string, unknown>;
  verified?: boolean;
};

type VerifyOtpCallback = (data: VerifyOtpSuccessPayload) => void;

function userIdFromVerifyResponse(
  response: VerifyOtpResponse,
  fallbackUserId: string,
): string {
  const u = response?.data?.user;
  const raw = u?.["_id"];
  if (typeof raw === "string" && raw?.length > 0) {
    return raw;
  }
  return fallbackUserId?.trim?.() ?? "";
}

export const useVerifyOtp = (
  email: string,
  userId: string,
  isForgotPassword: boolean,
  onSuccessCallback: VerifyOtpCallback,
): UseVerifyOtpReturn => {
  const { applyVerifyOtpResponse } = useAuthStore();

  const {
    mutate: verifyOtpMutation,
    isPending: isLoading,
    error: mutationError,
  } = useVerifyOtpMutation({
    onSuccess: async (response) => {
      console.log(
        "[Auth] Verify OTP response:",
        JSON.stringify(response, null, 2),
      );

      showSuccessToast(
        response?.message || "OTP verified successfully",
        { duration: 3000, position: "top" },
      );

      if (response?.data) {
        applyVerifyOtpResponse?.(response);
      }

      if (!isForgotPassword) {
        await syncMeAfterAuth();
      }

      const resolvedUserId = userIdFromVerifyResponse(response, userId);

      onSuccessCallback?.({
        token: response?.data?.token ?? "",
        refreshToken: response?.data?.refreshToken,
        tokenType: response?.data?.tokenType,
        userId: resolvedUserId,
        user: response?.data?.user,
        verified: response?.data?.verified,
      });
    },
    onError: (error) => {
      console.error("OTP verification error:", error);
      showErrorToast(error?.message || "OTP verification failed", {
        duration: 3000,
        position: "top",
      });
    },
  });

  const verifyOtp = (otp: string) => {
    if (otp?.length !== 4) {
      showErrorToast("Invalid OTP", { duration: 3000, position: "top" });
      return;
    }

    const verifyOtpRequest: VerifyOtpRequest = {
      email: email,
      otp: otp,
      isForgotPassword: isForgotPassword,
      ...(userId?.trim?.() ? { userId: userId?.trim?.() } : {}),
    };

    verifyOtpMutation(verifyOtpRequest);
  };

  return {
    verifyOtp,
    isLoading,
    error: mutationError
      ? { message: mutationError?.message, status: mutationError?.status }
      : null,
  };
};
