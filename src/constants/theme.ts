import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  bg: {
    deep: '#0D0B1A',
    base: '#1A1035',
    surface: '#221845',
    card: '#2A1F55',
    elevated: '#332660',
  },
  purple: {
    DEFAULT: '#9B7BFF',
    light: '#B794FF',
    muted: '#6B4FCC',
    dim: '#4A3580',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0A8D0',
    muted: '#6B6285',
  },
  success: '#4ADE80',
  warning: '#FACC15',
  error: '#F87171',
  spotify: '#1DB954',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
