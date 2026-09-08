import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import React from 'react';
import { ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';

type AppImageProps = {
  source: ImageSourcePropType | string | { uri: string };
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  [key: string]: any; // Allow other props to pass through
};

const AppImage: React.FC<AppImageProps> = ({ source, style, resizeMode, ...rest }) => {
  // Check if source is a URI (string or object with uri property)
  // const isUriSource =
  //   typeof source === 'string' ||
  //   (typeof source === 'object' && source !== null && 'uri' in source);

  // If it's a URI source, use TurboImage
  // if (isUriSource) {
  //   const uri = typeof source === 'string' ? source : (source as { uri: string }).uri;
  //   return (
  //     <TurboImage
  //       source={{ uri }}
  //       style={style as any}
  //       resizeMode={resizeMode}
  //       {...(rest as any)}
  //     />
  //   );
  // }

  // For local images (require()), use ExpoImage
  // Map resizeMode to contentFit for ExpoImage
  const contentFitMap: Record<string, ExpoImageProps['contentFit']> = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'fill',
    center: 'scale-down',
  };
  
  return (
    <ExpoImage
      source={source as ImageSourcePropType}
      style={style}
      contentFit={resizeMode ? contentFitMap[resizeMode] || 'contain' : undefined}
      {...(rest as ExpoImageProps)}
    />
  );
};

export default AppImage;

