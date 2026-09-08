import { ApiResponse } from "../auth/type";

/** Local file URI from expo-image-picker (or similar). */
export interface UploadFileVariables {
  uri: string;
  fileName?: string;
  mimeType?: string;
}

// Upload file response data
export interface UploadFileResponseData {
  url: string;
  fileName: string;
  fileType: string;
  folder: string;
}

// Upload file response
export type UploadFileResponse = ApiResponse<UploadFileResponseData>;
