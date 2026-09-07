import { Feather } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useRef, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import AppText from "../components/common/AppText";
import { palette } from "../theme";

export type ImagePickerAsset = {
  uri: string;
  width: number;
  height: number;
  fileName?: string;
  fileSize?: number;
  type?: string;
  mimeType?: string;
  compressedUri?: string;
};

type ImagePickerOptions = {
  allowsMultipleSelection?: boolean;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  mediaTypes?: ImagePicker.MediaType[];
};

type UseImagePickerReturn = {
  images: ImagePickerAsset[];
  pickImageFromLibrary: (options?: ImagePickerOptions) => Promise<void>;
  pickImageFromCamera: (options?: ImagePickerOptions) => Promise<void>;
  pickImage: (options?: ImagePickerOptions) => void;
  clearImages: () => void;
  removeImage: (index: number) => void;
  isLoading: boolean;
  ImagePickerBottomSheet: React.FC;
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
};

/**
 * Custom hook for image picking using expo-image-picker
 * 
 * @param {ImagePickerOptions} defaultOptions - Default options for image picker
 * @returns {UseImagePickerReturn} Object containing images state and picker methods
 * 
 * @example
 * const { images, pickImageFromLibrary, clearImages } = useImagePicker({
 *   allowsMultipleSelection: true,
 *   quality: 0.8
 * });
 */
const useImagePicker = (
  defaultOptions: ImagePickerOptions = {}
): UseImagePickerReturn => {
  const [images, setImages] = useState<ImagePickerAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [pendingOptions, setPendingOptions] = useState<ImagePickerOptions | undefined>();

  /**
   * Placeholder for image compression logic
   * This method will be implemented when a compression library is added
   * 
   * @param {string} uri - Original image URI
   * @param {number} quality - Compression quality (0-1)
   * @returns {Promise<string>} Compressed image URI
   */
  const compressImage = async (
    uri: string,
    quality: number = 0.8
  ): Promise<string> => {
    // TODO: Implement image compression when library is added
    // Example implementation structure:
    // 1. Load image from URI
    // 2. Apply compression based on quality parameter
    // 3. Save compressed image to cache/temp directory
    // 4. Return compressed image URI
    
    // For now, return original URI
    return uri;
  };

  /**
   * Request media library permissions
   */
  const requestMediaLibraryPermissions = async (): Promise<boolean> => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Permission to access the media library is required to select images."
      );
      return false;
    }
    return true;
  };

  /**
   * Request camera permissions
   */
  const requestCameraPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Permission to access the camera is required to take photos."
      );
      return false;
    }
    return true;
  };

  /**
   * Process selected images and apply compression if needed
   */
  const processImages = async (
    assets: ImagePicker.ImagePickerAsset[],
    options: ImagePickerOptions
  ): Promise<ImagePickerAsset[]> => {
    const processedImages: ImagePickerAsset[] = [];

    for (const asset of assets) {
      const imageAsset: ImagePickerAsset = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName ?? undefined,
        fileSize: asset.fileSize,
        type: asset.type ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      };

      // Apply compression if quality is specified and less than 1
      if (options.quality && options.quality < 1) {
        try {
          const compressedUri = await compressImage(asset.uri, options.quality);
          imageAsset.compressedUri = compressedUri;
        } catch (error) {
          console.warn("Image compression failed:", error);
          // Continue with original image if compression fails
        }
      }

      processedImages.push(imageAsset);
    }

    return processedImages;
  };

  /**
   * Pick image(s) from the device's image library
   */
  const pickImageFromLibrary = useCallback(
    async (options: ImagePickerOptions = {}) => {
      try {
        setIsLoading(true);

        // Merge default options with provided options
        const mergedOptions = {
          ...defaultOptions,
          ...options,
        };

        // Request permissions
        const hasPermission = await requestMediaLibraryPermissions();
        if (!hasPermission) {
          setIsLoading(false);
          return;
        }

        // Launch image library
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: mergedOptions.mediaTypes || ["images"],
          allowsMultipleSelection:
            mergedOptions.allowsMultipleSelection ?? false,
          allowsEditing: mergedOptions.allowsEditing ?? false,
          aspect: mergedOptions.aspect,
          quality: mergedOptions.quality ?? 1,
        });

        if (!result.canceled && result.assets) {
          // Process images (apply compression if needed)
          const processedImages = await processImages(
            result.assets,
            mergedOptions
          );

          // Update state based on multiple selection
          if (mergedOptions.allowsMultipleSelection) {
            setImages((prev) => [...prev, ...processedImages]);
          } else {
            setImages(processedImages);
          }
        }
      } catch (error) {
        console.error("Error picking image from library:", error);
        Alert.alert("Error", "Failed to pick image from library.");
      } finally {
        setIsLoading(false);
      }
    },
    [defaultOptions]
  );

  /**
   * Pick image(s) from the device's camera
   */
  const pickImageFromCamera = useCallback(
    async (options: ImagePickerOptions = {}) => {
      try {
        setIsLoading(true);

        // Merge default options with provided options
        const mergedOptions = {
          ...defaultOptions,
          ...options,
        };

        // Request permissions
        const hasPermission = await requestCameraPermissions();
        if (!hasPermission) {
          setIsLoading(false);
          return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: mergedOptions.mediaTypes || ["images"],
          allowsMultipleSelection:
            mergedOptions.allowsMultipleSelection ?? false,
          allowsEditing: mergedOptions.allowsEditing ?? false,
          aspect: mergedOptions.aspect,
          quality: mergedOptions.quality ?? 1,
        });

        if (!result.canceled && result.assets) {
          // Process images (apply compression if needed)
          const processedImages = await processImages(
            result.assets,
            mergedOptions
          );

          // Update state based on multiple selection
          if (mergedOptions.allowsMultipleSelection) {
            setImages((prev) => [...prev, ...processedImages]);
          } else {
            setImages(processedImages);
          }
        }
      } catch (error) {
        console.error("Error picking image from camera:", error);
        Alert.alert("Error", "Failed to take photo with camera.");
      } finally {
        setIsLoading(false);
      }
    },
    [defaultOptions]
  );

  /**
   * Clear all selected images
   */
  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  /**
   * Remove a specific image by index
   */
  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Open bottom sheet to choose between camera and gallery
   */
  const pickImage = useCallback((options?: ImagePickerOptions) => {
    setPendingOptions(options);
    bottomSheetRef.current?.present();
  }, []);

  /**
   * Handle camera selection
   */
  const handleCameraPress = useCallback(async () => {
    bottomSheetRef.current?.dismiss();
    if (pendingOptions) {
      await pickImageFromCamera(pendingOptions);
      setPendingOptions(undefined);
    } else {
      await pickImageFromCamera();
    }
  }, [pendingOptions, pickImageFromCamera]);

  /**
   * Handle gallery selection
   */
  const handleGalleryPress = useCallback(async () => {
    bottomSheetRef.current?.dismiss();
    if (pendingOptions) {
      await pickImageFromLibrary(pendingOptions);
      setPendingOptions(undefined);
    } else {
      await pickImageFromLibrary();
    }
  }, [pendingOptions, pickImageFromLibrary]);

  /**
   * Render backdrop for bottom sheet
   */
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  /**
   * Bottom Sheet Component
   */
  const ImagePickerBottomSheet: React.FC = () => {
    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.background}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Camera Option */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleCameraPress}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <Feather
                name="camera"
                size={moderateScale(24)}
                color={palette.contentTitle}
              />
            </View>
            <AppText weight="Medium" size="base" style={styles.optionText}>
              Camera
            </AppText>
          </TouchableOpacity>

          {/* Gallery Option */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleGalleryPress}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <Feather
                name="image"
                size={moderateScale(24)}
                color={palette.contentTitle}
              />
            </View>
            <AppText weight="Medium" size="base" style={styles.optionText}>
              Gallery
            </AppText>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  };

  return {
    images,
    pickImageFromLibrary,
    pickImageFromCamera,
    pickImage,
    clearImages,
    removeImage,
    isLoading,
    ImagePickerBottomSheet,
    bottomSheetRef,
  };
};

export default useImagePicker;

const styles = StyleSheet.create({
  background: {
    backgroundColor: palette.white,
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
  },
  handleIndicator: {
    backgroundColor: "#D1D5DB",
    width: scale(40),
    height: verticalScale(4),
  },
  contentContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
    gap: verticalScale(12),
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    borderRadius: scale(12),
    backgroundColor: palette.background,
    gap: scale(12),
  },
  optionIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: palette.white,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    color: palette.contentTitle,
    fontSize: moderateScale(16),
  },
});

