import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { resetRootToAuthSignIn } from "../navigation/navigationRef";
import { useAuthStore } from "../store/auth.store";
import { showErrorToast } from "../utils/toast";

const API_BASE_URL =
  `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1` || "https://api.example.com";

export interface APIError {
  message: string;
  status: number;
}

type FetchFromAPIConfig = {
  suppressErrorToast?: boolean;
};

// API function with auth token using axios (exported for infinite / custom queries)
export async function fetchFromAPI<T>(
  endpoint: string,
  options?: RequestInit,
  fetchConfig?: FetchFromAPIConfig,
): Promise<T> {
  const token = useAuthStore.getState().token || null;

  const axiosConfig: AxiosRequestConfig = {
    url: `${API_BASE_URL}${endpoint}`,
    method: (options?.method as any) || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...((options?.headers as Record<string, string>) || {}),
    },
  };

  // Add body for POST, PUT, DELETE requests
  if (options?.body) {
    const bodyString =
      typeof options.body === "string" ? options.body : String(options.body);
    axiosConfig.data = JSON.parse(bodyString);
  }

  try {
    const response = await axios(axiosConfig);
    console.log("Response URL:", `${API_BASE_URL}${endpoint}`);
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
    return response.data as T;
  } catch (error) {
    const axiosError = error as AxiosError<any>;

    console.log("Response status:", axiosError.response?.status);
    console.log("Response data:", axiosError.response?.data);

    let errorMessage = "API request failed";
    let status = axiosError.response?.status || 500;

    if (axiosError.response?.data) {
      const errorData = axiosError.response.data;
      errorMessage = errorData.message || errorMessage;
    } else if (axiosError.message) {
      errorMessage = axiosError.message;
    }

    // Check for JWT expiration error (401 with jwt expired message)
    if (
      status === 401 &&
      (errorMessage?.toLowerCase().includes("jwt expired") ||
        errorMessage?.toLowerCase().includes("access denied"))
    ) {
      // Clear auth state to logout user
      useAuthStore.getState().clearAuth();
      // Reset navigation to Auth stack → Signin
      resetRootToAuthSignIn();
      // Don't show error toast for expired token
    } else if (!fetchConfig?.suppressErrorToast) {
      // Show error toast for other errors
      showErrorToast(errorMessage, { position: "top" });
    }

    const apiError: APIError = {
      message: errorMessage,
      status: status,
    };
    throw apiError;
  }
}

type QueryConfig<TData> = Omit<
  UseQueryOptions<TData, APIError, TData>,
  "queryKey" | "queryFn"
>;

type MutationConfig<TData, TVariables> = Omit<
  UseMutationOptions<TData, APIError, TVariables>,
  "mutationFn"
>;

/**
 * Reusable hook for GET requests
 * @param endpoint - API endpoint
 * @param queryKey - Unique key for the query (for caching)
 * @param config - Additional React Query configuration
 *
 * @example
 * const { data, isLoading } = useApiQuery<UserProfile>(
 *   '/users/profile',
 *   ['profile'],
 *   { enabled: isAuthenticated }
 * );
 */
export function useApiQuery<TData>(
  endpoint: string,
  queryKey: string[],
  config: QueryConfig<TData> = {},
) {
  return useQuery<TData, APIError>({
    queryKey: queryKey,
    queryFn: () => fetchFromAPI<TData>(endpoint),
    ...config,
  });
}

/**
 * Reusable hook for POST, PUT, DELETE requests
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param config - Additional React Query configuration
 *
 * @example
 * const { mutate, isLoading } = useApiMutation<Response, RequestData>(
 *   '/users/profile',
 *   'PUT',
 *   {
 *     onSuccess: (data) => {
 *       console.log('Profile updated:', data);
 *     }
 *   }
 * );
 */
export function useApiMutation<TData, TVariables>(
  endpoint: string,
  method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST",
  config: MutationConfig<TData, TVariables> = {},
) {
  return useMutation<TData, APIError, TVariables>({
    mutationFn: (variables: TVariables) =>
      fetchFromAPI<TData>(endpoint, {
        method,
        body: JSON.stringify(variables),
      }),
    ...config,
  });
}
