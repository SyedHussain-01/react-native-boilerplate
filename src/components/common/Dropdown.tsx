import React from "react";
import { Control, Controller, ControllerProps, FieldValues, Path } from "react-hook-form";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { Dropdown as RNDropdown } from "react-native-element-dropdown";
import { scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppText from "./AppText";

export type DropdownItem = {
  label: string;
  value: string;
};

type DropdownProps<T extends FieldValues = FieldValues> = {
  label?: string;
  showLabel?: boolean;
  required?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
  placeholder?: string;
  data: DropdownItem[];
  // react-hook-form props
  name?: Path<T>;
  control?: Control<T>;
  rules?: ControllerProps<T>["rules"];
  // Dropdown specific props
  search?: boolean;
  searchPlaceholder?: string;
  disable?: boolean;
  dropdownStyle?: ViewStyle;
  selectedTextStyle?: TextStyle;
  placeholderStyle?: TextStyle;
};

const Dropdown = <T extends FieldValues = FieldValues>({
  label,
  showLabel = true,
  required = false,
  error: externalError,
  containerStyle,
  placeholder = "Select an option",
  data,
  name,
  control,
  rules,
  search = false,
  searchPlaceholder = "Search...",
  disable = false,
  dropdownStyle,
  selectedTextStyle,
  placeholderStyle,
}: DropdownProps<T>) => {
  // Render the actual dropdown component
  const renderDropdown = (
    value?: string,
    onChange?: (item: DropdownItem) => void,
    fieldError?: string
  ) => {
    const displayError = fieldError || externalError;
    const selectedItem = data.find((item) => item.value === value);

    return (
      <View style={[styles.container, containerStyle]}>
        {showLabel && label && (
          <AppText weight="Medium" size="base" style={styles.label}>
            {label}
            {required && <AppText style={styles.asterisk}> *</AppText>}
          </AppText>
        )}
        <RNDropdown
          style={[styles.dropdown, displayError && styles.dropdownError, disable && styles.dropdownDisabled, dropdownStyle]}
          placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
          selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          search={search}
          maxHeight={verticalScale(300)}
          labelField="label"
          valueField="value"
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          value={value}
          onChange={(item: DropdownItem) => {
            onChange?.(item);
          }}
          disable={disable}
        />
        {displayError && (
          <AppText weight="Regular" size="sm" style={styles.errorText}>
            {displayError}
          </AppText>
        )}
      </View>
    );
  };

  // If name and control are provided, use Controller
  if (name && control) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value }, fieldState: { error } }) =>
          renderDropdown(
            value,
            (item) => {
              onChange(item.value);
            },
            error?.message
          )
        }
      />
    );
  }

  // Otherwise, render as standalone dropdown (not recommended, but supported)
  return renderDropdown();
};

export default Dropdown;

const styles = StyleSheet.create({
  container: {
    marginVertical: verticalScale(6),
  },
  label: {
    marginBottom: verticalScale(8),
    color: palette.textDark,
  },
  asterisk: {
    color: palette.orange,
  },
  dropdown: {
    height: scale(45),
    borderWidth: 1,
    borderColor: palette.lightGray,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    backgroundColor: palette.white,
  },
  dropdownError: {
    borderColor: palette.orange,
  },
  dropdownDisabled: {
    backgroundColor: palette.lightGray,
    opacity: 0.6,
  },
  placeholderStyle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Regular",
    color: palette.textGray,
  },
  selectedTextStyle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Regular",
    color: palette.textDark,
  },
  inputSearchStyle: {
    height: verticalScale(40),
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Regular",
    borderRadius: scale(8),
    borderColor: palette.lightGray,
  },
  iconStyle: {
    width: scale(20),
    height: scale(20),
  },
  errorText: {
    color: palette.orange,
    marginTop: verticalScale(4),
  },
});

