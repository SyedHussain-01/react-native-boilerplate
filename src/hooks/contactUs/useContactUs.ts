import { useForm } from "react-hook-form";
import { useContactMutation } from "../../api/main";
import type { ContactRequest } from "../../api/main/type";
import { ContactUsFormData, contactUsRules } from "../../utils/rules";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

interface APIError {
  message: string;
  status: number;
}

type UseContactUsReturn = {
  control: ReturnType<typeof useForm<ContactUsFormData>>["control"];
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: ReturnType<typeof useForm<ContactUsFormData>>["formState"]["errors"];
  isLoading: boolean;
  error: APIError | null;
};

export const useContactUs = (
  onSubmitCallback: (data: ContactUsFormData) => void
): UseContactUsReturn => {
  const {
    control,
    handleSubmit: formHandleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ContactUsFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      message: "",
    },
    mode: "onBlur", // Validate on blur
  });

  const {
    mutate: submitContact,
    isPending: isLoading,
    error: mutationError,
  } = useContactMutation({
    onSuccess: (response) => {
      console.log("Contact form submitted successfully:", response);
      // Show success toast
      showSuccessToast(response.message || "Your message has been sent successfully", {
        duration: 3000,
        position: "top",
      });
      // Reset form after successful submission
      reset();
      // Call the original callback
      onSubmitCallback({
        fullName: "",
        email: "",
        message: "",
      });
    },
    onError: (error) => {
      console.error("Contact form submission error:", error);
      // Show error toast
      showErrorToast(error.message || "Failed to send message", {
        duration: 3000,
        position: "top",
      });
      // Handle API errors - set form errors if needed
      if (error.status === 400 && error.message) {
        // Try to set error on specific fields if it's a validation error
        if (error.message.toLowerCase().includes("email")) {
          setError("email", {
            type: "manual",
            message: error.message,
          });
        } else if (error.message.toLowerCase().includes("name")) {
          setError("fullName", {
            type: "manual",
            message: error.message,
          });
        } else if (error.message.toLowerCase().includes("message")) {
          setError("message", {
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

  const onSubmit = (data: ContactUsFormData) => {
    console.log("Contact Us form data:", data);

    // Map form data to API request format
    const contactRequest: ContactRequest = {
      full_name: data.fullName,
      email: data.email,
      message: data.message,
    };

    // Call the mutation
    submitContact(contactRequest);
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
export { contactUsRules };

