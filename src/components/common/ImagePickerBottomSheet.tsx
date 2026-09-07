import { Feather } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppText from "./AppText";

type ImagePickerBottomSheetProps = {
  onCameraPress: () => void;
  onGalleryPress: () => void;
  onClose?: () => void;
};

export type ImagePickerBottomSheetRef = {
  expand: () => void;
  close: () => void;
};

const ImagePickerBottomSheet = forwardRef<
  ImagePickerBottomSheetRef,
  ImagePickerBottomSheetProps
>(({ onCameraPress, onGalleryPress, onClose }, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useImperativeHandle(ref, () => ({
    expand: () => {
      bottomSheetRef.current?.present();
    },
    close: () => {
      bottomSheetRef.current?.dismiss();
    },
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const handleCameraPress = () => {
    bottomSheetRef.current?.dismiss();
    onCameraPress();
  };

  const handleGalleryPress = () => {
    bottomSheetRef.current?.dismiss();
    onGalleryPress();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.background}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <AppText weight="SemiBold" size="lg" style={styles.title}>
            Select Photo
          </AppText>
          <AppText weight="Regular" size="sm" style={styles.subtitle}>
            Choose an option to add your photo
          </AppText>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleCameraPress}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIconContainer, styles.cameraIconContainer]}>
              <Feather
                name="camera"
                size={moderateScale(28)}
                color={palette.darkBlue}
              />
            </View>
            <View style={styles.optionTextContainer}>
              <AppText weight="SemiBold" size="base" style={styles.optionText}>
                Take Photo
              </AppText>
              <AppText weight="Regular" size="xs" style={styles.optionSubtext}>
                Capture a new photo
              </AppText>
            </View>
            <Feather
              name="chevron-right"
              size={moderateScale(20)}
              color={palette.textGray}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleGalleryPress}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIconContainer, styles.galleryIconContainer]}>
              <Feather
                name="image"
                size={moderateScale(28)}
                color={palette.orange}
              />
            </View>
            <View style={styles.optionTextContainer}>
              <AppText weight="SemiBold" size="base" style={styles.optionText}>
                Choose from Gallery
              </AppText>
              <AppText weight="Regular" size="xs" style={styles.optionSubtext}>
                Select from your photos
              </AppText>
            </View>
            <Feather
              name="chevron-right"
              size={moderateScale(20)}
              color={palette.textGray}
            />
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

ImagePickerBottomSheet.displayName = "ImagePickerBottomSheet";

export default ImagePickerBottomSheet;

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
    marginTop: verticalScale(8),
  },
  contentContainer: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(50),
  },
  header: {
    marginBottom: verticalScale(24),
    alignItems: "center",
  },
  title: {
    color: palette.contentTitle,
    fontSize: moderateScale(20),
    marginBottom: verticalScale(4),
  },
  subtitle: {
    color: palette.textGray,
    fontSize: moderateScale(13),
    textAlign: "center",
  },
  optionsContainer: {
    gap: verticalScale(16),
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(18),
    borderRadius: scale(16),
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#E9EAEB",
    gap: scale(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIconContainer: {
    backgroundColor: "rgba(19, 39, 111, 0.08)",
  },
  galleryIconContainer: {
    backgroundColor: "rgba(247, 146, 51, 0.08)",
  },
  optionTextContainer: {
    flex: 1,
    gap: verticalScale(2),
  },
  optionText: {
    color: palette.contentTitle,
    fontSize: moderateScale(16),
  },
  optionSubtext: {
    color: palette.textGray,
    fontSize: moderateScale(12),
  },
});
