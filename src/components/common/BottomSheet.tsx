import { Feather } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppImage from "./AppImage";
import AppText from "./AppText";
import { remotePlaceholders } from "../../constants/remotePlaceholders";

export type BottomSheetRef = {
  snapToIndex: (index: number) => void;
  snapToPosition: (position: string | number) => void;
  close: () => void;
  expand: () => void;
  collapse: () => void;
  forceClose: () => void;
};

type BottomSheetProps = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialSnapIndex?: number;
  enablePanDownToClose?: boolean;
  enableOverDrag?: boolean;
  onClose?: () => void;
  onChange?: (index: number) => void;
  // Header props
  title?: string;
  showHeader?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  onRightActionPress?: () => void;
  // Search props
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  searchValue?: string;
  // Custom header content (renders instead of search if provided)
  customHeaderContent?: React.ReactNode;
  showHandle?: boolean;
  backgroundColor?: string;
  handleIndicatorStyle?: object;
  containerStyle?: object;
  contentContainerStyle?: object;
  index?: number;
  enableDynamicSizing?: boolean;
  /** Space reserved above the sheet's fully-expanded top (e.g. status bar height). */
  topInset?: number;
  /**
   * Use `BottomSheetModal` instead of always-mounted `BottomSheet`.
   * Prefer for on-demand sheets (filters, pickers) so a closed sheet cannot
   * peek or steal touches on parent layouts like BottomBar.
   */
  asModal?: boolean;
  /**
   * Render `children` directly without the built-in `BottomSheetView` wrapper.
   * Required when the content provides its own scrollable (e.g.
   * `BottomSheetScrollView`/`BottomSheetFlatList`), since gorhom does not allow
   * a scrollable nested inside `BottomSheetView`.
   */
  disableContentContainer?: boolean;
};

const BottomSheetComponent = React.forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      children,
      snapPoints = ["50%"],
      initialSnapIndex = 0,
      enablePanDownToClose = true,
      enableOverDrag = false,
      onClose,
      onChange,
      title,
      showHeader = false,
      leftAction,
      rightAction,
      onRightActionPress,
      showSearch = false,
      searchPlaceholder = "Search",
      onSearchChange,
      searchValue: controlledSearchValue,
      customHeaderContent,
      showHandle = true,
      backgroundColor = palette.white,
      handleIndicatorStyle,
      containerStyle,
      contentContainerStyle,
      index,
      enableDynamicSizing = false,
      asModal = false,
      disableContentContainer = false,
      topInset,
    },
    ref
  ) => {
    const [internalSearchValue, setInternalSearchValue] = useState("");
    const resolvedIndex = index !== undefined ? index : initialSnapIndex;
    const [currentIndex, setCurrentIndex] = useState(
      asModal ? -1 : resolvedIndex,
    );
    const searchValue =
      controlledSearchValue !== undefined
        ? controlledSearchValue
        : internalSearchValue;

    const handleSearchChange = (text: string) => {
      if (controlledSearchValue === undefined) {
        setInternalSearchValue(text);
      }
      onSearchChange?.(text);
    };
    const sheetRef = useRef<BottomSheetModal>(null);
    const legacySheetRef = useRef<BottomSheet>(null);

    useEffect(() => {
      if (!asModal) {
        setCurrentIndex(resolvedIndex);
      }
    }, [asModal, resolvedIndex]);

    useImperativeHandle(ref, () => ({
      snapToIndex: (nextIndex: number) => {
        setCurrentIndex(nextIndex);
        if (asModal) {
          sheetRef.current?.snapToIndex(nextIndex);
        } else {
          legacySheetRef.current?.snapToIndex(nextIndex);
        }
      },
      snapToPosition: (position: string | number) => {
        setCurrentIndex(0);
        if (asModal) {
          sheetRef.current?.snapToPosition(position);
        } else {
          legacySheetRef.current?.snapToPosition(position);
        }
      },
      close: () => {
        if (asModal) {
          sheetRef.current?.dismiss();
        } else {
          legacySheetRef.current?.close();
        }
      },
      expand: () => {
        setCurrentIndex(0);
        if (asModal) {
          sheetRef.current?.present();
        } else {
          legacySheetRef.current?.expand();
        }
      },
      collapse: () => {
        setCurrentIndex(0);
        if (asModal) {
          sheetRef.current?.collapse();
        } else {
          legacySheetRef.current?.collapse();
        }
      },
      forceClose: () => {
        if (asModal) {
          sheetRef.current?.forceClose();
        } else {
          legacySheetRef.current?.forceClose();
        }
      },
    }));

    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);
    const isClosed = currentIndex === -1;

    const handleSheetChanges = useCallback(
      (nextIndex: number) => {
        setCurrentIndex(nextIndex);
        if (nextIndex === -1 && onClose) {
          onClose();
        }
        if (onChange) {
          onChange(nextIndex);
        }
      },
      [onClose, onChange],
    );

    const handleDismiss = useCallback(() => {
      setCurrentIndex(-1);
      onClose?.();
    }, [onClose]);

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

    const handleClose = () => {
      if (asModal) {
        sheetRef.current?.dismiss();
      } else {
        legacySheetRef.current?.close();
      }
      onClose?.();
    };

    const renderLeftAction = () => {
      if (leftAction) {
        return leftAction;
      }
      if (showHeader) {
        return (
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.7}
            style={styles.closeButton}
          >
            <Feather
              name="x"
              size={moderateScale(24)}
              color={palette.textDark}
            />
          </TouchableOpacity>
        );
      }
      return null;
    };

    const renderRightAction = () => {
      if (rightAction) {
        return (
          <TouchableOpacity
            onPress={onRightActionPress || onClose}
            activeOpacity={0.7}
            style={styles.rightActionButton}
          >
            {rightAction}
          </TouchableOpacity>
        );
      }
      if (showHeader && (onRightActionPress || onClose)) {
        return (
          <TouchableOpacity
            onPress={onRightActionPress || onClose}
            activeOpacity={0.7}
            style={styles.rightActionButton}
          >
            <AppText weight="Medium" size="sm" style={styles.doneButtonText}>
              Done
            </AppText>
          </TouchableOpacity>
        );
      }
      return null;
    };

    const sheetBody = disableContentContainer ? (
      children
    ) : (
      <BottomSheetView style={[styles.contentContainer, contentContainerStyle]}>
        {showHeader && title && (
          <>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.leftActionContainer}>
                  {renderLeftAction()}
                </View>
                <View style={styles.titleContainer}>
                  <AppText
                    weight="Medium"
                    size="base"
                    style={styles.headerTitle}
                  >
                    {title}
                  </AppText>
                </View>
              </View>
              <View style={styles.rightActionContainer}>
                {renderRightAction()}
              </View>
            </View>
            <View style={styles.headerDivider} />
          </>
        )}

        {showHeader && (showSearch || customHeaderContent) && (
          <View style={styles.searchContainer}>
            {customHeaderContent ? (
              customHeaderContent
            ) : showSearch ? (
              <View style={styles.searchInputContainer}>
                <AppImage
                  source={remotePlaceholders.search}
                  style={styles.searchIcon}
                  resizeMode="contain"
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={palette.contentBody}
                  value={searchValue}
                  onChangeText={handleSearchChange}
                />
              </View>
            ) : null}
          </View>
        )}

        {children}
      </BottomSheetView>
    );

    const sharedSheetProps = {
      topInset,
      snapPoints: enableDynamicSizing ? undefined : memoizedSnapPoints,
      enablePanDownToClose,
      enableOverDrag,
      onChange: handleSheetChanges,
      backdropComponent: renderBackdrop,
      keyboardBehavior: "extend" as const,
      keyboardBlurBehavior: "restore" as const,
      android_keyboardInputMode: "adjustResize" as const,
      handleComponent: showHandle ? undefined : null,
      handleIndicatorStyle: [
        styles.handleIndicator,
        handleIndicatorStyle,
        !showHandle && styles.hiddenHandle,
      ],
      backgroundStyle: [styles.background, { backgroundColor }],
      containerStyle: [
        containerStyle,
        !asModal && isClosed && styles.closedContainer,
      ],
      enableDynamicSizing,
    };

    if (asModal) {
      return (
        <BottomSheetModal
          ref={sheetRef}
          onDismiss={handleDismiss}
          {...sharedSheetProps}
        >
          {sheetBody}
        </BottomSheetModal>
      );
    }

    return (
      <BottomSheet
        ref={legacySheetRef}
        index={resolvedIndex}
        {...sharedSheetProps}
      >
        {sheetBody}
      </BottomSheet>
    );
  },
);

BottomSheetComponent.displayName = "BottomSheet";

// Export BottomSheetFlatList and BottomSheetTextInput for use in bottom sheets
export { BottomSheetFlatList, BottomSheetScrollView, BottomSheetTextInput };

export default BottomSheetComponent;

const styles = StyleSheet.create({
  closedContainer: {
    pointerEvents: "none",
  },
  background: {
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
  },
  handleIndicator: {
    backgroundColor: palette.lightGray,
    width: moderateScale(40),
    height: moderateScale(4),
    marginTop: verticalScale(8),
  },
  hiddenHandle: {
    display: "none",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(14),
    minHeight: verticalScale(44),
  },
  headerContent: {
    flexDirection: "row",
    flex: 1,
    gap: scale(12),
  },
  leftActionContainer: {
    width: moderateScale(24),
    height: moderateScale(24),
    justifyContent: "center",
    alignItems: "flex-start",
  },
  closeButton: {
    width: moderateScale(24),
    height: moderateScale(24),
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: palette.textDark,
    fontSize: moderateScale(16),
  },
  rightActionContainer: {
    width: moderateScale(50),
    alignItems: "flex-end",
    justifyContent: "center",
  },
  rightActionButton: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(4),
  },
  doneButtonText: {
    color: palette.darkBlue,
    fontSize: moderateScale(12),
  },
  headerDivider: {
    height: 1,
    backgroundColor: palette.lightGray,
    width: "100%",
    marginBottom: verticalScale(8),
  },
  searchContainer: {
    marginBottom: verticalScale(8),
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: palette.lightGray,
    borderRadius: scale(12),
    height: moderateScale(46),
    paddingHorizontal: scale(12),
    gap: scale(8),
  },
  searchIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(12),
    color: palette.textDark,
    fontFamily: "PlusJakartaSans-Regular",
  },
});
