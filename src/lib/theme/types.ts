export interface ThemeColors {
  primary: string;
  'primary-hover': string;
  'primary-light': string;
  secondary: string;
  'secondary-hover': string;
  accent: string;
  background: string;
  'background-alt': string;
  surface: string;
  text: string;
  'text-secondary': string;
  'text-muted': string;
  border: string;
  'border-light': string;
  error: string;
  success: string;
}

export interface ThemeTypography {
  'font-heading': string;
  'font-body': string;
  'font-accent': string;
}

export interface ThemeSpacing {
  'section-padding': string;
  'section-padding-mobile': string;
  'container-max': string;
  'container-narrow': string;
  'gap-section': string;
  'gap-element': string;
}

export interface ThemeRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeShadow {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  glow: string;
}

export interface ThemeGlass {
  opacity: string;
  blur: string;
  border: string;
}

export interface ThemeGradient {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadow: ThemeShadow;
  glass: ThemeGlass;
  gradient: ThemeGradient;
}

export type ThemePath =
  | `colors.${keyof ThemeColors}`
  | `typography.${keyof ThemeTypography}`
  | `spacing.${keyof ThemeSpacing}`
  | `radius.${keyof ThemeRadius}`
  | `shadow.${keyof ThemeShadow}`
  | `glass.${keyof ThemeGlass}`
  | `gradient.${keyof ThemeGradient}`;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
