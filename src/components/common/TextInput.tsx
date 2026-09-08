import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Control, Controller, ControllerProps, FieldValues, Path } from "react-hook-form";
import {
  Platform,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppText from "./AppText";

type TextInputProps<T extends FieldValues = FieldValues> = RNTextInputProps & {
  label?: string;
  showLabel?: boolean;
  required?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  InputComponent?: React.ComponentType<RNTextInputProps>;
  // react-hook-form props
  name?: Path<T>;
  control?: Control<T>;
  rules?: ControllerProps<T>["rules"];
};

const IS_ANDROID = Platform.OS === "android";

const TextInput = <T extends FieldValues = FieldValues>({
  label,
  showLabel = true,
  required = false,
  error: externalError,
  containerStyle,
  inputContainerStyle,
  rightIcon,
  showPasswordToggle = false,
  secureTextEntry,
  style,
  placeholderTextColor = palette.textGray,
  name,
  control,
  rules,
  InputComponent = RNTextInput,
  autoCapitalize,
  autoCorrect,
  ...rest
}: TextInputProps<T>) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = Boolean(secureTextEntry && showPasswordToggle);
  const isSecureHidden = Boolean(
    isPassword ? !isPasswordVisible : secureTextEntry,
  );
  /**
   * On Android, a controlled `value` on a secure field cancels the native
   * "peek last character" timer. Keep the field uncontrolled while hidden.
   */
  const useUncontrolledSecureAndroid = IS_ANDROID && isSecureHidden;
  const secureSeedRef = useRef<string | null>(null);

  if (!useUncontrolledSecureAndroid) {
    secureSeedRef.current = null;
  }

  const handleTogglePassword = () => {
    setIsPasswordVisible((visible) => !visible);
  };

  const renderInput = (
    value?: string,
    onChange?: (text: string) => void,
    onBlur?: () => void,
    fieldError?: string
  ) => {
    const displayError = fieldError || externalError;
    const {
      value: restValue,
      defaultValue: _restDefaultValue,
      onChangeText: restOnChangeText,
      onBlur: restOnBlur,
      ...inputRest
    } = rest;

    const resolvedValue = value !== undefined ? value : restValue;
    const stringValue =
      resolvedValue === undefined || resolvedValue === null
        ? ""
        : String(resolvedValue);

    if (useUncontrolledSecureAndroid && secureSeedRef.current === null) {
      secureSeedRef.current = stringValue;
    }

    const secureDefaults = secureTextEntry
      ? {
          autoCapitalize: (autoCapitalize ?? "none") as typeof autoCapitalize,
          autoCorrect: autoCorrect ?? false,
        }
      : {
          autoCapitalize,
          autoCorrect,
        };

    const valueProps = useUncontrolledSecureAndroid
      ? { defaultValue: secureSeedRef.current ?? "" }
      : { value: stringValue };

    return (
      <View style={[styles.container, containerStyle]}>
        {showLabel && label && (
          <AppText weight="Medium" size="base" style={styles.label}>
            {label}
            {required && <AppText style={styles.asterisk}> *</AppText>}
          </AppText>
        )}
        <View
          style={[
            styles.inputContainer,
            displayError && styles.inputContainerError,
            inputContainerStyle,
          ]}
        >
          <InputComponent
            key={
              isPassword
                ? isPasswordVisible
                  ? "password-visible"
                  : "password-hidden"
                : undefined
            }
            style={[
              styles.input,
              isPassword && styles.inputWithIcon,
              useUncontrolledSecureAndroid && styles.secureAndroidInput,
              style,
            ]}
            placeholderTextColor={placeholderTextColor}
            secureTextEntry={isSecureHidden}
            onChangeText={onChange || restOnChangeText}
            onBlur={onBlur || restOnBlur}
            underlineColorAndroid="transparent"
            {...secureDefaults}
            {...inputRest}
            {...valueProps}
          />
          {(rightIcon || isPassword) && (
            <View style={styles.rightIconContainer}>
              {isPassword ? (
                <TouchableOpacity
                  onPress={handleTogglePassword}
                  style={styles.iconButton}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={isPasswordVisible ? "eye-off" : "eye"}
                    size={20}
                    color={palette.textGray}
                  />
                </TouchableOpacity>
              ) : (
                rightIcon
              )}
            </View>
          )}
        </View>
        {displayError && (
          <AppText weight="Regular" size="sm" style={styles.errorText}>
            {displayError}
          </AppText>
        )}
      </View>
    );
  };

  if (name && control) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) =>
          renderInput(value, onChange, onBlur, error?.message)
        }
      />
    );
  }

  return renderInput();
};

export default TextInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: verticalScale(6),
  },
  label: {
    marginBottom: verticalScale(8),
  },
  asterisk: {
    color: palette.orange,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: scale(45),
    borderWidth: 1,
    borderColor: palette.lightGray,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    backgroundColor: palette.white,
  },
  inputContainerError: {
    borderColor: palette.orange,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Regular",
    color: palette.textDark,
    backgroundColor: "transparent",
  },
  /** System font — custom fonts break Android's last-character peek. */
  secureAndroidInput: {
    fontFamily: undefined,
  },
  inputWithIcon: {
    paddingRight: scale(8),
  },
  rightIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    padding: scale(4),
  },
  errorText: {
    color: palette.orange,
    marginTop: verticalScale(4),
  },
});
