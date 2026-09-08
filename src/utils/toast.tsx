import Toast from "react-native-toast-message";
import { ErrorToast, SuccessToast } from "../components/common/Toast";

export const showSuccessToast = (
  message: string,
  options?: {
    duration?: number;
    position?: "top" | "bottom";
  }
) => {
  Toast.show({
    type: "success",
    text1: message,
    visibilityTime: options?.duration || 3000,
    position: options?.position || "top",
  });
};

export const showErrorToast = (
  message: string,
  options?: {
    duration?: number;
    position?: "top" | "bottom";
  }
) => {
  Toast.show({
    type: "error",
    text1: message,
    visibilityTime: options?.duration || 3000,
    position: options?.position || "top",
  });
};

export const showInfoToast = (
  message: string,
  options?: {
    duration?: number;
    position?: "top" | "bottom";
  }
) => {
  Toast.show({
    type: "info",
    text1: message,
    visibilityTime: options?.duration || 3000,
    position: options?.position || "top",
  });
};

// Export toast config for App.tsx
export const toastConfig = {
  success: (props: any) => <SuccessToast {...props} />,
  error: (props: any) => <ErrorToast {...props} />,
};

