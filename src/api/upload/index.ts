import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { Platform } from "react-native";
import { UPLOAD } from "../endpoints";
import type { UploadFileResponse, UploadFileVariables } from "./type";

const API_BASE_URL =
  `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1` || "https://api.example.com";

interface APIError {
  message: string;
  status: number;
}

/** RN FormData uploads often fail with axios "Network Error" (XHR + multipart). */
function normalizeUploadUri(uri: string): string {
  if (Platform.OS !== "android") return uri;
  // Android: ensure file URIs use three slashes so the native stack resolves the path.
  if (uri.startsWith("file://") && !uri.startsWith("file:///")) {
    return `file:///${uri.replace(/^file:\/*/, "")}`;
  }
  return uri;
}

// POST multipart/form-data `file` — server auth uses EXPO_PUBLIC_UPLOAD_FILE_KEY
async function uploadFile(
  variables: UploadFileVariables,
): Promise<UploadFileResponse> {
  const uploadKey = process.env.EXPO_PUBLIC_UPLOAD_FILE_KEY;
  const {
    uri: rawUri,
    fileName = "image.jpg",
    mimeType = "image/jpeg",
  } = variables;
  const uri = normalizeUploadUri(rawUri);

  const formData = new FormData();
  // @ts-expect-error React Native FormData file part
  formData.append("file", { uri, name: fileName, type: mimeType });

  const url = `${API_BASE_URL}${UPLOAD.UPLOAD_IMAGE}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        ...(uploadKey && { Authorization: `Bearer ${uploadKey}` }),
      },
      body: formData,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "File upload failed (network)";
    const apiError: APIError = { message, status: 0 };
    throw apiError;
  }

  const text = await response.text();
  let parsed: Record<string, unknown>;
  try {
    parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    const apiError: APIError = {
      message: "Invalid response from upload server",
      status: response.status,
    };
    throw apiError;
  }

  const responseData = (parsed.body ?? parsed) as UploadFileResponse;

  if (!response.ok) {
    const msg =
      (responseData as { message?: string })?.message ||
      (parsed as { message?: string })?.message ||
      `Upload failed (${response.status})`;
    const apiError: APIError = { message: msg, status: response.status };
    throw apiError;
  }

  return responseData;
}

type MutationConfig<TData, TVariables> = Omit<
  UseMutationOptions<TData, APIError, TVariables>,
  "mutationFn"
>;

/**
 * Hook for uploading files (multipart `file` field, upload service key).
 */
export function useUploadFileMutation(
  config?: MutationConfig<UploadFileResponse, UploadFileVariables>,
) {
  return useMutation<UploadFileResponse, APIError, UploadFileVariables>({
    mutationFn: uploadFile,
    ...config,
  });
}
