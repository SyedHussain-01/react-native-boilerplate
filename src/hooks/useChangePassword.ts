import { useForm } from "react-hook-form";
import { useChangePasswordMutation } from "../api/auth";
import { ChangePasswordResponse } from "../api/auth/type";
import { ChangePasswordFormData } from "../utils/rules";
import { showSuccessToast } from "../utils/toast";

type UseChangePasswordReturn = {
  control: ReturnType<typeof useForm<ChangePasswordFormData>>["control"];
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: ReturnType<typeof useForm<ChangePasswordFormData>>["formState"]["errors"];
  isSubmitting: boolean;
};

export const useChangePassword = (
  onSubmitCallback?: (data: ChangePasswordFormData) => void
): UseChangePasswordReturn => {
  const {
    control,
    handleSubmit: formHandleSubmit,
    formState: { errors },
    setError,
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur", // Validate on blur
  });

  const changePasswordMutation = useChangePasswordMutation({
    onSuccess: (data: ChangePasswordResponse) => {
      showSuccessToast(data?.message || "Password changed successfully!", { position: "top" });
      if (onSubmitCallback) {
        onSubmitCallback({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    },
    onError: (error: unknown) => {
      const errorMessage = 
        (error as any)?.response?.data?.message || 
        (error as any)?.message || 
        "Failed to change password";
      
      // Set error on appropriate field if available
      if (errorMessage.toLowerCase().includes("old password") || errorMessage.toLowerCase().includes("current password")) {
        setError("currentPassword", {
          type: "manual",
          message: errorMessage,
        });
      } else if (errorMessage.toLowerCase().includes("new password")) {
        setError("newPassword", {
          type: "manual",
          message: errorMessage,
        });
      } else {
        setError("root", {
          type: "manual",
          message: errorMessage,
        });
      }
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    // Validate password matching
    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    // Map form data to API request format
    const requestData = {
      oldPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    };

    changePasswordMutation.mutate(requestData);
  };

  // Wrap handleSubmit to work with React Native's onPress
  const handleSubmit = formHandleSubmit(onSubmit);

  return {
    control,
    handleSubmit,
    errors,
    isSubmitting: changePasswordMutation.isPending,
  };
};
