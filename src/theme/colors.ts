/**
 * DailyLoop Productivity Suite — Central Theme System
 * Supports 2 visual themes:
 * 1. Dark (darkTheme)
 * 2. Light (lightTheme)
 */

export interface ThemePalette {
  name: 'dark' | 'light';
  isDark: boolean;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceVariant: string;
  surfaceElevated: string;
  glassSurface: string;
  glassSurfaceElevated: string;
  glassBorder: string;
  glassBorderSubtle: string;
  glassShadow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  border: string;
  borderPrimary: string;
  borderSecondary: string;
  divider: string;
  outline: string;
  primary: string;
  onPrimary: string;
  primaryButton: string;
  primaryButtonText: string;
  secondaryButton: string;
  secondaryButtonText: string;
  accent: string;
  accentMuted: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  priorityHighBg: string;
  priorityHighText: string;
  priorityMediumBg: string;
  priorityMediumText: string;
  priorityLowBg: string;
  priorityLowText: string;
  statusCompleted: string;
  statusPending: string;
  statusOverdue: string;
  statusInformation: string;
  success: string;
  danger: string;
  navBackground: string;
  navSelectedItemBg: string;
  navSelectedItemText: string;
  navUnselectedItemText: string;
  fabBackground: string;
  fabIcon: string;
}

// 1. Dark Theme (Pitch Black #0D0D0D)
export const darkTheme: ThemePalette = {
  name: 'dark',
  isDark: true,
  background: '#0D0D0D',
  backgroundSecondary: '#121212',
  surface: '#1A1A1A',
  surfaceContainer: '#121212',
  surfaceContainerLow: '#0D0D0D',
  surfaceContainerHigh: '#222222',
  surfaceVariant: '#222222',
  surfaceElevated: '#222222',
  glassSurface: '#1A1A1A',
  glassSurfaceElevated: '#222222',
  glassBorder: '#282828',
  glassBorderSubtle: '#202020',
  glassShadow: 'rgba(0, 0, 0, 0.40)',
  textPrimary: '#F5F5F5',
  textSecondary: '#A0A0A0',
  textMuted: '#686868',
  textDisabled: '#4A4A4A',
  border: '#282828',
  borderPrimary: '#282828',
  borderSecondary: '#202020',
  divider: '#202020',
  outline: '#333333',
  primary: '#FFFFFF',
  onPrimary: '#0D0D0D',
  primaryButton: '#FFFFFF',
  primaryButtonText: '#0D0D0D',
  secondaryButton: '#222222',
  secondaryButtonText: '#F5F5F5',
  accent: '#FFFFFF',
  accentMuted: 'rgba(255, 255, 255, 0.08)',
  priorityHigh: '#EB5757',
  priorityMedium: '#D9A441',
  priorityLow: '#4DAA8A',
  priorityHighBg: 'rgba(235, 87, 87, 0.15)',
  priorityHighText: '#EB5757',
  priorityMediumBg: 'rgba(217, 164, 65, 0.15)',
  priorityMediumText: '#D9A441',
  priorityLowBg: 'rgba(77, 170, 138, 0.15)',
  priorityLowText: '#4DAA8A',
  statusCompleted: '#4DAA8A',
  statusPending: '#D9A441',
  statusOverdue: '#EB5757',
  statusInformation: '#529CCA',
  success: '#4DAA8A',
  danger: '#EB5757',
  navBackground: '#161616',
  navSelectedItemBg: '#FFFFFF',
  navSelectedItemText: '#0D0D0D',
  navUnselectedItemText: '#A0A0A0',
  fabBackground: '#FFFFFF',
  fabIcon: '#0D0D0D',
};

// 2. Light Theme
export const lightTheme: ThemePalette = {
  name: 'light',
  isDark: false,
  background: '#F7F6F3',
  backgroundSecondary: '#F1F1EF',
  surface: '#FFFFFF',
  surfaceContainer: '#F1F1EF',
  surfaceContainerLow: '#F7F6F3',
  surfaceContainerHigh: '#EFEFEF',
  surfaceVariant: '#EFEFEF',
  surfaceElevated: '#FFFFFF',
  glassSurface: '#FFFFFF',
  glassSurfaceElevated: '#FFFFFF',
  glassBorder: '#E9E9E7',
  glassBorderSubtle: '#E6E6E4',
  glassShadow: 'rgba(0, 0, 0, 0.05)',
  textPrimary: '#37352F',
  textSecondary: '#787774',
  textMuted: '#9B9A97',
  textDisabled: '#C4C4C0',
  border: '#E9E9E7',
  borderPrimary: '#E9E9E7',
  borderSecondary: '#E6E6E4',
  divider: '#E6E6E4',
  outline: '#D3D3D0',
  primary: '#191919',
  onPrimary: '#FFFFFF',
  primaryButton: '#191919',
  primaryButtonText: '#FFFFFF',
  secondaryButton: '#F1F1EF',
  secondaryButtonText: '#37352F',
  accent: '#191919',
  accentMuted: 'rgba(25, 25, 25, 0.08)',
  priorityHigh: '#E03E3E',
  priorityMedium: '#D9730D',
  priorityLow: '#0F7B6C',
  priorityHighBg: '#FBE4E4',
  priorityHighText: '#E03E3E',
  priorityMediumBg: '#FBF3DB',
  priorityMediumText: '#D9730D',
  priorityLowBg: '#DDEDEA',
  priorityLowText: '#0F7B6C',
  statusCompleted: '#0F7B6C',
  statusPending: '#D9730D',
  statusOverdue: '#E03E3E',
  statusInformation: '#0B6E99',
  success: '#0F7B6C',
  danger: '#E03E3E',
  navBackground: '#FFFFFF',
  navSelectedItemBg: '#191919',
  navSelectedItemText: '#FFFFFF',
  navUnselectedItemText: '#787774',
  fabBackground: '#191919',
  fabIcon: '#FFFFFF',
};

// Aliases
export const darkGlassTheme = darkTheme;
export const darkMinimalTheme = darkTheme;
export const lightMinimalTheme = lightTheme;
export const colors = darkTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  containerPadding: 24,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const fontFamilies = {
  heading: 'Manrope',
  body: 'Inter',
};

export const typography = {
  displayLarge: { fontFamily: fontFamilies.heading, fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.4 },
  display: { fontFamily: fontFamilies.heading, fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  title: { fontFamily: fontFamilies.heading, fontSize: 16, fontWeight: '600' as const },
  body: { fontFamily: fontFamilies.body, fontSize: 15, fontWeight: '400' as const },
  bodySm: { fontFamily: fontFamilies.body, fontSize: 13, fontWeight: '400' as const },
  caption: { fontFamily: fontFamilies.body, fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.3 },
};
