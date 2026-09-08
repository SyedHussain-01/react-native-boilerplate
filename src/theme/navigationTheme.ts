import { DefaultTheme, Theme } from '@react-navigation/native';
import { palette } from './colors';

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    background: palette.background,
  },
};