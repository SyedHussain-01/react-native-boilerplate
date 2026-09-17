import { useForm } from "react-hook-form";
import { useResetPasswordMutation } from "../../api/auth";
import type { ResetPasswordRequest } from "../../api/auth/type";
import { useAuthStore } from "../../store/auth.store";
import { ResetPasswordFormData, resetPasswordRules } from "../../utils/rules";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

interface APIError {
  message: string;
  status: number;
}

type UseResetPasswordReturn = {
  control: ReturnType<typeof useForm<ResetPasswordFormData>>["control"];
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: ReturnType<typeof useForm<ResetPasswordFormData>>["formState"]["errors"];
  isLoading: boolean;
  error: APIError | null;
};

export const useResetPassword = (
  userId: string,
  email: string,
  otp: string,
  onSubmitCallback: (data: ResetPasswordFormData) => void
): UseResetPasswordReturn => {
  const {
    control,
    handleSubmit: formHandleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur", // Validate on blur
  });

  const { setToken } = useAuthStore();

  const { mutate: resetPassword, isPending: isLoading, error: mutationError } = useResetPasswordMutation({
    onSuccess: (response) => {
      console.log("Password reset successful:", response);
      // Show success toast
      showSuccessToast(
        response.message ||
          "Password reset successfully. You can now sign in with your new password",
      );
      
      // Store token in auth store
      if (response.data.token) {
        setToken(response.data.token);
      }

      // Call the original callback for navigation
      onSubmitCallback({
        password: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      console.error("Password reset error:", error);
      // Show error toast
      showErrorToast(
        error.message ||
          "Password reset failed. Please check your information and try again",
      );
      // Handle API errors - set form errors if needed
      if (error.status === 400 || error.status === 404) {
        if (error.message.toLowerCase().includes("password")) {
          setError("password", {
            type: "manual",
            message: error.message,
          });
        } else if (error.message.toLowerCase().includes("otp")) {
          setError("root", {
            type: "manual",
            message: "Invalid or expired OTP. Please request a new one.",
          });
        } else {
          // Set a general error
          setError("root", {
            type: "manual",
            message: error.message,
          });
        }
      }
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    console.log("onSubmit data", data);
    
    // Validate password matching entirely in onSubmit with manual error
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return; // Prevent submission if passwords don't match
    }
    
    // Map form data to API request format
    const resetPasswordRequest: ResetPasswordRequest = {
      // userId: userId,
      email: email,
      otp: otp,
      newPassword: data.password,
    };

    console.log("resetPasswordRequest", resetPasswordRequest);
    
    // Call the mutation
    resetPassword(resetPasswordRequest);
  };

  // Wrap handleSubmit to work with React Native's onPress
  const handleSubmit = formHandleSubmit(onSubmit);

  return {
    control,
    handleSubmit,
    errors,
    isLoading,
    error: mutationError ? { message: mutationError.message, status: mutationError.status } : null,
  };
};

// Export rules for direct use in components if needed
export { resetPasswordRules };

