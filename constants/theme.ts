/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#007B50';
const tintColorDark = '#007B50';

export const Colors = {
  light: {
    text: '#333333',
    background: '#F5F9F5',
    tint: tintColorLight,
    icon: '#007B50',
    tabIconDefault: '#999999',
    tabIconSelected: tintColorLight,
    primary: '#007B50',
    secondary: '#005A3C',
    accent: '#00FF88',
    surface: '#FFFFFF',
    surfaceVariant: '#F0F0F0',
    error: '#FF6B6B',
    warning: '#FFA500',
    success: '#007B50',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorDark,
    icon: '#007B50',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
    primary: '#007B50',
    secondary: '#005A3C',
    accent: '#00FF88',
    surface: '#1A1A1A',
    surfaceVariant: '#333333',
    error: '#FF6B6B',
    warning: '#FFA500',
    success: '#007B50',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
