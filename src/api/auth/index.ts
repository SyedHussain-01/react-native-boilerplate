import { useEffect } from "react";
import { useApiMutation, useApiQuery } from '../api';
import { AUTH } from '../endpoints';
import { useAuthStore } from '../../store/auth.store';
import type {
    ChangePasswordRequest,
    ChangePasswordResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    GetMeResponse,
    LoginRequest,
    LoginResponse,
    ResendOtpRequest,
    ResendOtpResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    SignupRequest,
    SignupResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from './type';

/**
 * Hook for user signup
 * @example
 * const { mutate: signup, isLoading } = useSignupMutation({
 *   onSuccess: (data) => {
 *     console.log('User registered:', data);
 *   }
 * });
 */
export function useSignupMutation(config?: Parameters<typeof useApiMutation<SignupResponse, SignupRequest>>[2]) {
  return useApiMutation<SignupResponse, SignupRequest>(
    AUTH.SIGNUP,
    'POST',
    config
  );
}

/**
 * Hook for user login
 * @example
 * const { mutate: login, isLoading } = useLoginMutation({
 *   onSuccess: (data) => {
 *     console.log('User logged in:', data);
 *   }
 * });
 */
export function useLoginMutation(config?: Parameters<typeof useApiMutation<LoginResponse, LoginRequest>>[2]) {
  return useApiMutation<LoginResponse, LoginRequest>(
    AUTH.LOGIN,
    'POST',
    config
  );
}

/**
 * Hook for verifying OTP
 * @example
 * const { mutate: verifyOtp, isLoading } = useVerifyOtpMutation({
 *   onSuccess: (data) => {
 *     console.log('OTP verified:', data);
 *   }
 * });
 */
export function useVerifyOtpMutation(config?: Parameters<typeof useApiMutation<VerifyOtpResponse, VerifyOtpRequest>>[2]) {
  return useApiMutation<VerifyOtpResponse, VerifyOtpRequest>(
    AUTH.VERIFY_OTP,
    'POST',
    config
  );
}

/**
 * Hook for resending OTP
 * @example
 * const { mutate: resendOtp, isLoading } = useResendOtpMutation({
 *   onSuccess: (data) => {
 *     console.log('OTP resent:', data);
 *   }
 * });
 */
export function useResendOtpMutation(config?: Parameters<typeof useApiMutation<ResendOtpResponse, ResendOtpRequest>>[2]) {
  return useApiMutation<ResendOtpResponse, ResendOtpRequest>(
    AUTH.RESEND_OTP,
    'POST',
    config
  );
}

/**
 * Hook for forgot password
 * @example
 * const { mutate: forgotPassword, isLoading } = useForgotPasswordMutation({
 *   onSuccess: (data) => {
 *     console.log('Password reset OTP sent:', data);
 *   }
 * });
 */
export function useForgotPasswordMutation(config?: Parameters<typeof useApiMutation<ForgotPasswordResponse, ForgotPasswordRequest>>[2]) {
  return useApiMutation<ForgotPasswordResponse, ForgotPasswordRequest>(
    AUTH.FORGOT_PASSWORD,
    'POST',
    config
  );
}

/**
 * Hook for reset password
 * @example
 * const { mutate: resetPassword, isLoading } = useResetPasswordMutation({
 *   onSuccess: (data) => {
 *     console.log('Password reset:', data);
 *   }
 * });
 */
export function useResetPasswordMutation(config?: Parameters<typeof useApiMutation<ResetPasswordResponse, ResetPasswordRequest>>[2]) {
  return useApiMutation<ResetPasswordResponse, ResetPasswordRequest>(
    AUTH.RESET_PASSWORD,
    'POST',
    config
  );
}

/**
 * Hook for getting current user profile
 * @example
 * const { data, isLoading } = useGetMeQuery();
 */
export function useGetMeQuery(config?: Parameters<typeof useApiQuery<GetMeResponse>>[2]) {
  const query = useApiQuery<GetMeResponse>(
    AUTH.ME,
    ['me'],
    config ?? {},
  );
  const syncFromGetMeResponse = useAuthStore((s) => s.syncFromGetMeResponse);

  useEffect(() => {
    if (query?.data) {
      syncFromGetMeResponse?.(query.data);
    }
  }, [query?.data, syncFromGetMeResponse]);

  return query;
}

/**
 * Hook for changing password
 * @example
 * const { mutate: changePassword, isLoading } = useChangePasswordMutation({
 *   onSuccess: (data) => {
 *     console.log('Password changed:', data);
 *   }
 * });
 */
export function useChangePasswordMutation(config?: Parameters<typeof useApiMutation<ChangePasswordResponse, ChangePasswordRequest>>[2]) {
  return useApiMutation<ChangePasswordResponse, ChangePasswordRequest>(
    AUTH.CHANGE_PASSWORD,
    'POST',
    config
  );
}
