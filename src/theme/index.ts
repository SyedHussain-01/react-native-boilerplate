import { palette } from './colors';
import { navigationTheme } from './navigationTheme';

export const theme = {
  palette,
  navigation: navigationTheme,
};

export type AppTheme = typeof theme;
export { palette };
