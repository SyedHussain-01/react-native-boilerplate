import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import RangeSlider from "react-native-sticky-range-slider";
import { palette } from "../../theme";

type SeekbarProps = {
  min?: number;
  max?: number;
  currentMin?: number;
  currentMax?: number;
  onValueChange?: (range: { min: number; max: number }) => void;
  activeTrackColor?: string;
  railColor?: string;
  leftEdgeColor?: string;
  rightEdgeColor?: string;
  containerHeight?: number;
  railHeight?: number;
  activeTrackHeight?: number;
  edgeWidth?: number;
  edgeHeight?: number;
  thumbSize?: number;
  thumbColor?: string;
  thumbBorderColor?: string;
  showNotches?: boolean;
  notchCount?: number;
};

const Seekbar: React.FC<SeekbarProps> = ({
  min = 0,
  max = 60,
  currentMin,
  currentMax,
  onValueChange,
  activeTrackColor = "#F79233",
  railColor = palette.background,
  leftEdgeColor = "#D9D9D9",
  rightEdgeColor = "#EAEBEB",
  containerHeight = verticalScale(64),
  railHeight = verticalScale(2),
  activeTrackHeight = verticalScale(4),
  edgeWidth = scale(8),
  edgeHeight = verticalScale(2),
  thumbSize = moderateScale(16),
  thumbColor = "#F79233",
  thumbBorderColor = palette.white,
  showNotches = false,
  notchCount = 5,
}) => {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleValueChanged = useCallback(
    (low: number, high: number) => {
      // Debounce the callback - only fire when user stops dragging
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onValueChange?.({ min: low, max: high });
        debounceTimerRef.current = null;
      }, 300);
    },
    [onValueChange]
  );

  const renderThumb = useCallback(
    (type: "low" | "high") => {
      return (
        <View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              backgroundColor: thumbColor,
              borderColor: thumbBorderColor,
              borderRadius: thumbSize / 2,
              borderWidth: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 2,
            },
          ]}
        />
      );
    },
    [thumbSize, thumbColor, thumbBorderColor]
  );

  const renderRail = useCallback(() => {
    return (
      <View
        style={[
          styles.rail,
          {
            height: railHeight,
            backgroundColor: railColor,
            borderRadius: scale(6),
          },
        ]}
      />
    );
  }, [railHeight, railColor]);

  const renderRailSelected = useCallback(() => {
    return (
      <View
        style={[
          styles.railSelected,
          {
            height: activeTrackHeight,
            backgroundColor: activeTrackColor,
            borderRadius: scale(6),
          },
        ]}
      />
    );
  }, [activeTrackHeight, activeTrackColor]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const renderNotches = () => {
    if (!showNotches) return null;

    const notches = [];
    
    // Calculate positions for evenly spaced notches
    for (let i = 0; i < notchCount; i++) {
      const position = (i / (notchCount - 1)) * 100; // 0%, 25%, 50%, 75%, 100%
      notches.push(
        <View
          key={i}
          style={[
            styles.notch,
            {
              left: `${position}%`,
              transform: [{ translateX: -scale(1) }], // Center the notch (half of width)
            },
          ]}
        />
      );
    }

    return (
      <View style={styles.notchesContainer} pointerEvents="none">
        {notches}
      </View>
    );
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {renderNotches()}
      <View style={styles.sliderContainer}>
        <RangeSlider
          min={min}
          max={max}
          low={currentMin ?? min}
          high={currentMax ?? max}
          step={1}
          onValueChanged={handleValueChanged}
          renderThumb={renderThumb}
          renderRail={renderRail}
          renderRailSelected={renderRailSelected}
        />
      </View>
    </View>
  );
};

export default Seekbar;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    paddingHorizontal: scale(7),
  },
  sliderContainer: {
    position: "relative",
    zIndex: 2,
    elevation: 2,
  },
  rail: {
    width: "100%",
  },
  railSelected: {
    width: "100%",
  },
  thumb: {
  },
  notchesContainer: {
    position: "absolute",
    left: scale(7),
    right: scale(7),
    top: "50%",
    height: verticalScale(6),
    marginTop: -verticalScale(3),
    pointerEvents: "none",
  },
  notch: {
    position: "absolute",
    width: scale(2),
    height: verticalScale(6),
    backgroundColor: "#EAEBEB",
    borderWidth: 1,
    borderColor: "#888E91",
    borderRadius: scale(3),
  },
});

