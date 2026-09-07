import { useForm } from "react-hook-form";
import { Platform } from "react-native";
import { useSignupMutation } from "../../api/auth";
import type { SignupRequest } from "../../api/auth/type";
import { useUploadFileMutation } from "../../api/upload";
import { ImagePickerAsset } from "../../hooks/useImagePicker";
import { resolveDeviceToken } from "../../store/deviceTokenStorage";
import { SignupFormData, signupRules } from "../../utils/rules";
import { getDeviceTimezoneIana } from "../../utils/timezone";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

interface APIError {
  message: string;
  status: number;
}

type UseSignupReturn = {
  control: ReturnType<typeof useForm<SignupFormData>>["control"];
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: ReturnType<typeof useForm<SignupFormData>>["formState"]["errors"];
  isLoading: boolean;
  error: APIError | null;
};

export const useSignup = (
  onSubmitCallback: (data: SignupFormData & { userId?: string }) => void,
  profileImage?: ImagePickerAsset,
): UseSignupReturn => {
  const {
    control,
    handleSubmit: formHandleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignupFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      referralCode: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur", // Validate on blur
  });

  const uploadFileMutation = useUploadFileMutation({
    onError: (error) => {
      console.error("File upload error:", error);
      showErrorToast(error.message || "Failed to upload profile picture", {
        duration: 3000,
        position: "top",
      });
    },
  });

  const {
    mutate: signup,
    isPending: isSignupLoading,
    error: mutationError,
  } = useSignupMutation({
    onSuccess: (response, variables) => {
      console.log("[Auth] Signup response:", JSON.stringify(response, null, 2));
      // Show success toast
      showSuccessToast(response?.message || "User registered successfully", {
        duration: 3000,
        position: "top",
      });
      // Call the original callback with form data for navigation
      // Include userId from response for OTP verification
      onSubmitCallback({
        firstName: variables?.firstName || "",
        lastName: variables?.lastName || "",
        email: variables?.email ?? "",
        referralCode: variables?.usedReferralCode ?? "",
        password: "",
        confirmPassword: "",
        userId: response?.data?.user?._id,
      });
    },
    onError: (error) => {
      console.error("Signup error:", error);
      // Show error toast
      showErrorToast(error.message || "Signup failed", {
        duration: 3000,
        position: "top",
      });
      // Handle API errors - set form errors if needed
      if (error.status === 400 && error.message) {
        // Try to set error on email field if it's a validation error
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

  const isLoading = isSignupLoading || uploadFileMutation.isPending;

  const onSubmit = async (data: SignupFormData) => {
    // Validate password matching entirely in onSubmit with manual error
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return; // Prevent submission if passwords don't match
    }

    let avatarUrl: string | undefined;

    if (profileImage) {
      const uri = profileImage.compressedUri ?? profileImage.uri;
      const fileName =
        profileImage.fileName?.replace(/^.*[/\\]/, "") ||
        `avatar_${Date.now()}.jpg`;
      const mimeType =
        profileImage.mimeType ||
        (profileImage.type?.includes("/") ? profileImage.type : "image/jpeg");

      try {
        const uploadResponse = await uploadFileMutation.mutateAsync({
          uri,
          fileName,
          mimeType,
        });
        avatarUrl = uploadResponse?.data?.url;
      } catch {
        return;
      }
    }

    const referralTrimmed = data?.referralCode?.trim?.() ?? "";
    const timezone = getDeviceTimezoneIana();
    const deviceToken = await resolveDeviceToken();
    console.log("[Auth] Signup sending timezone:", timezone);

    // Map form data to API request format
    const signupRequest: SignupRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: avatarUrl,
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
      platform:
        Platform.OS === "ios"
          ? "mobile"
          : Platform.OS === "android"
            ? "mobile"
            : "web",
      authType: "email",
      deviceToken,
      deviceType:
        Platform.OS === "ios"
          ? "ios"
          : Platform.OS === "android"
            ? "android"
            : "web",
      timezone,
      ...(referralTrimmed?.length > 0
        ? { usedReferralCode: referralTrimmed }
        : {}),
    };

    console.log(
      "[Auth] Signup request body:",
      JSON.stringify(
        {
          ...signupRequest,
          password: "[redacted]",
          confirm_password: "[redacted]",
        },
        null,
        2,
      ),
    );

    // Call the mutation
    signup(signupRequest);
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
export { signupRules };
