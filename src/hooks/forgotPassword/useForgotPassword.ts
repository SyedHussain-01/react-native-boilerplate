import { useForm } from "react-hook-form";
import { useForgotPasswordMutation } from "../../api/auth";
import type { ForgotPasswordRequest } from "../../api/auth/type";
import { ForgotPasswordFormData, forgotPasswordRules } from "../../utils/rules";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

interface APIError {
  message: string;
  status: number;
}

type UseForgotPasswordReturn = {
  control: ReturnType<typeof useForm<ForgotPasswordFormData>>["control"];
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: ReturnType<typeof useForm<ForgotPasswordFormData>>["formState"]["errors"];
  isLoading: boolean;
  error: APIError | null;
};

export const useForgotPassword = (
  onSubmitCallback: (data: ForgotPasswordFormData) => void
): UseForgotPasswordReturn => {
  const {
    control,
    handleSubmit: formHandleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: "",
    },
    mode: "onBlur", // Validate on blur
  });

  const { mutate: forgotPassword, isPending: isLoading, error: mutationError } = useForgotPasswordMutation({
    onSuccess: (response, variables) => {
      console.log("Forgot password request successful:", response);
      // Show success toast
      showSuccessToast(
        response.message || "Password reset OTP sent successfully",
        "Please check your email for the verification code"
      );
      // Call the original callback with email for navigation
      onSubmitCallback({
        email: variables.email,
      });
    },
    onError: (error) => {
      console.error("Forgot password error:", error);
      // Show error toast
      showErrorToast(
        error.message || "Failed to send reset code",
        "Please check your email and try again"
      );
      // Handle API errors - set form errors if needed
      if (error.status === 404 || error.status === 400) {
        if (error.message.toLowerCase().includes("email")) {
          setError("email", {
            type: "manual",
            message: error.message,
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

  const onSubmit = (data: ForgotPasswordFormData) => {
    console.log("onSubmit data", data);
    
    // Map form data to API request format
    const forgotPasswordRequest: ForgotPasswordRequest = {
      email: data.email,
      // phone is optional, not collected in form
    };
    
    // Call the mutation
    forgotPassword(forgotPasswordRequest);
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
export { forgotPasswordRules };

