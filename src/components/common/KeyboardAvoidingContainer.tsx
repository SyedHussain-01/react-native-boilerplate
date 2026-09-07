import React, { useState } from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
  KeyboardStickyView,
} from "react-native-keyboard-controller";

type KeyboardAvoidingScrollViewProps = KeyboardAwareScrollViewProps & {
  /**
   * Optional sticky element pinned to the bottom of the screen. It rises with
   * the keyboard and the focused input is automatically kept above it.
   */
  footer?: React.ReactNode;
  /** Style applied to the footer wrapper (padding, background, etc.). */
  footerStyle?: StyleProp<ViewStyle>;
  /** Style for the flex wrapper rendered around the scroll view + footer. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Extra gap kept between the focused input and the keyboard/footer. */
  bottomOffset?: number;
  /** Toggle keyboard handling (auto-scroll + sticky footer). */
  enabled?: boolean;
};

/**
 * Scroll view that keeps the focused `TextInput` (and an optional sticky
 * `footer`) above the keyboard, with native-like animations. Backed by
 * `react-native-keyboard-controller`. Works under Android edge-to-edge.
 *
 * - Without `footer`: behaves like a keyboard-aware `ScrollView`.
 * - With `footer`: pins the footer above the keyboard and measures its height
 *   so the focused input always clears it (no manual wiring needed).
 */
export const KeyboardAvoidingScrollView: React.FC<
  KeyboardAvoidingScrollViewProps
> = ({
  children,
  footer,
  footerStyle,
  containerStyle,
  contentContainerStyle,
  style,
  bottomOffset = 16,
  enabled = true,
  keyboardShouldPersistTaps = "handled",
  showsVerticalScrollIndicator = false,
  ...scrollViewProps
}) => {
  const [footerHeight, setFooterHeight] = useState(0);

  const handleFooterLayout = (event: LayoutChangeEvent) => {
    setFooterHeight(event.nativeEvent.layout.height);
  };

  const scrollView = (
    <KeyboardAwareScrollView
      {...scrollViewProps}
      style={[styles.fill, style]}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      enabled={enabled}
      bottomOffset={(footer ? footerHeight : 0) + bottomOffset}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      {children}
    </KeyboardAwareScrollView>
  );

  if (!footer) {
    return scrollView;
  }

  return (
    <View style={[styles.fill, containerStyle]}>
      {scrollView}
      <KeyboardStickyView enabled={enabled}>
        <View style={footerStyle} onLayout={handleFooterLayout}>
          {footer}
        </View>
      </KeyboardStickyView>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default KeyboardAvoidingScrollView;
