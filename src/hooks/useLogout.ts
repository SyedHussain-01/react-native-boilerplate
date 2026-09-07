import { useCallback } from "react";
import { useLogoutMutation } from "../api/main";
import { resetRootToAuthSignIn } from "../navigation/navigationRef";
import { useAuthStore } from "../store/auth.store";

type UseLogoutReturn = {
  logout: (onComplete?: () => void) => Promise<void>;
  isLoggingOut: boolean;
};

export const useLogout = (): UseLogoutReturn => {
  const clearAuth = useAuthStore((s) => s?.clearAuth);
  const { mutateAsync, isPending } = useLogoutMutation();

  const logout = useCallback(
    async (onComplete?: () => void) => {
      try {
        await mutateAsync?.();
      } catch {
        // Local logout proceeds regardless of API outcome
      } finally {
        clearAuth?.();
        resetRootToAuthSignIn?.();
        onComplete?.();
      }
    },
    [clearAuth, mutateAsync],
  );

  return {
    logout,
    isLoggingOut: isPending ?? false,
  };
};
