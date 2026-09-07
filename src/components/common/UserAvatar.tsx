import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { palette } from "../../theme";
import AppImage from "./AppImage";

export type UserAvatarProps = {
  uri?: string | null;
  /** Outer width and height (logical px). */
  size: number;
  /** Defaults to a circle (`size / 2`). */
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Gray user icon when there is no URL; same icon stays visible until the remote image finishes loading.
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  uri,
  size,
  borderRadius: borderRadiusProp,
  style,
}) => {
  const trimmed = uri?.trim() ?? "";
  const [loaded, setLoaded] = useState(false);
  const borderRadius = borderRadiusProp ?? size / 2;

  useEffect(() => {
    setLoaded(false);
  }, [trimmed]);

  const hasUri = trimmed.length > 0;
  const iconSize = Math.min(Math.max(Math.round(size * 0.4), 14), 36);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      <View style={[styles.placeholder, StyleSheet.absoluteFill]}>
        <Feather name="user" size={iconSize} color={palette.textGray} />
      </View>
      {hasUri ? (
        <AppImage
          source={{ uri: trimmed }}
          style={[
            styles.image,
            { borderRadius },
            !loaded && styles.imageHidden,
          ]}
          resizeMode="cover"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      ) : null}
    </View>
  );
};

export default UserAvatar;

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    backgroundColor: palette.lightGray,
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.lightGray,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imageHidden: {
    opacity: 0,
  },
});
