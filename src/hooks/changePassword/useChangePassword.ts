import { useForm } from "react-hook-form";
import { ChangePasswordFormData, changePasswordRules } from "../../utils/rules";

type UseChangePasswordReturn = {
  control: ReturnType<typeof useForm<ChangePasswordFormData>>["control"];
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: ReturnType<typeof useForm<ChangePasswordFormData>>["formState"]["errors"];
};

export const useChangePassword = (
  onSubmitCallback: (data: ChangePasswordFormData) => void
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

  const onSubmit = (data: ChangePasswordFormData) => {
    console.log("onSubmit data", data);
    
    // Validate password matching entirely in onSubmit with manual error
    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return; // Prevent submission if passwords don't match
    }
    
    onSubmitCallback(data);
  };

  // Wrap handleSubmit to work with React Native's onPress
  const handleSubmit = formHandleSubmit(onSubmit);

  return {
    control,
    handleSubmit,
    errors,
  };
};

// Export rules for direct use in components if needed
export { changePasswordRules };

