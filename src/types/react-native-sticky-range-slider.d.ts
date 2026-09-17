declare module "react-native-sticky-range-slider" {
  import type { ComponentType } from "react";
  import type { StyleProp, ViewStyle } from "react-native";

  type RangeSliderProps = {
    min?: number;
    max?: number;
    low?: number;
    high?: number;
    step?: number;
    disableRange?: boolean;
    disabled?: boolean;
    allowOverlap?: boolean;
    floatingLabel?: boolean;
    renderThumb?: (...args: any[]) => React.ReactNode;
    renderRail?: () => React.ReactNode;
    renderRailSelected?: () => React.ReactNode;
    renderLabel?: (value: number) => React.ReactNode;
    renderNotch?: () => React.ReactNode;
    onValueChanged?: (low: number, high: number, fromUser: boolean) => void;
    style?: StyleProp<ViewStyle>;
  };

  const RangeSlider: ComponentType<RangeSliderProps>;
  export default RangeSlider;
}
