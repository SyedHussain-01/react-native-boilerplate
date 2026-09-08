import { useForm } from "react-hook-form";
import { useLoginMutation } from "../../api/auth";
import type { LoginRequest, UserWithHealthProfile } from "../../api/auth/type";
import { useAuthStore } from "../../store/auth.store";
import { syncMeAfterAuth } from "../../store/syncMeAfterAuth";
import { resolveDeviceToken } from "../../store/deviceTokenStorage";
import { SigninFormData, signinRules } from "../../utils/rules";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

interface APIError {
  message: string;
  status: number;
}

type UseSigninReturn = {
  control: ReturnType<typeof useForm<SigninFormData>>["control"];
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: ReturnType<typeof useForm<SigninFormData>>["formState"]["errors"];
  isLoading: boolean;
  error: APIError | null;
};

export const useSignin = (
  onSubmitCallback: (
    data: SigninFormData & {
      userId?: string;
      needsOtp?: boolean;
      user?: UserWithHealthProfile;
    },
  ) => void,
): UseSigninReturn => {
  const {
    control,
    handleSubmit: formHandleSubmit,
    formState: { errors },
    setError,
  } = useForm<SigninFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // Validate on blur
  });

  const { applyLoginResponse } = useAuthStore();

  const {
    mutate: login,
    isPending: isLoading,
    error: mutationError,
  } = useLoginMutation({
    onSuccess: async (response) => {
      console.log("[Auth] Login response:", JSON.stringify(response, null, 2));
      // Show success toast
      showSuccessToast(response?.message || "Login successful");

      applyLoginResponse?.(response);
      await syncMeAfterAuth();

      const user = response?.data?.user as UserWithHealthProfile;
      const isProfileComplete = !!(
        user?.dateOfBirth &&
        user?.height &&
        user?.currentWeight &&
        user?.targetGoal
      );

      // OTP screen only when email/account is not verified yet (not onboarding step)
      const needsOtp = response?.data?.user?.isVerified !== true;

      // Call the original callback with form data and user info
      onSubmitCallback({
        email: response?.data?.user?.email ?? "",
        password: "",
        userId: response?.data?.user?._id,
        needsOtp: needsOtp,
        user: response?.data?.user,
      });
    },
    onError: (error) => {
      console.error("Login error:", error);
      // Show error toast
      showErrorToast(error.message || "Login failed");
      // Handle API errors - set form errors if needed
      if (error.status === 400 || error.status === 404) {
        if (error.message.toLowerCase().includes("email")) {
          setError("email", {
            type: "manual",
            message: error.message,
          });
        } else if (error.message.toLowerCase().includes("password")) {
          setError("password", {
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

  const onSubmit = async (data: SigninFormData) => {
    console.log("onSubmit data", data);

    const deviceToken = await resolveDeviceToken();

    // Map form data to API request format
    const loginRequest: LoginRequest = {
      email: data.email,
      password: data.password,
      deviceToken,
    };

    // Call the mutation
    login(loginRequest);
  };

  // Wrap handleSubmit to work with React Native's onPress
  const handleSubmit = formHandleSubmit(onSubmit);

  return {
    control,
    handleSubmit,
    errors,
    isLoading,
    error: mutationError
      ? { message: mutationError.message, status: mutationError.status }
      : null,
  };
};

// Export rules for direct use in components if needed
export { signinRules };
