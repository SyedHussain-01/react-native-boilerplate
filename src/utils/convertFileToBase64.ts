import * as FileSystem from "expo-file-system";

/**
 * Converts a file (by URI) to a Base64 string.
 * Uses expo-file-system for React Native compatibility.
 * @param file - Object with a `uri` property (e.g. ImagePickerAsset)
 * @returns Base64 string, or null if read fails
 */
export const fileToBase64 = async (
  file: { uri: string },
): Promise<string | null> => {
  try {
    const fileInstance = new FileSystem.File(file.uri);
    const base64 = await fileInstance.base64();
    return base64;
  } catch {
    return null;
  }
};
