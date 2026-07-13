import type { ThemeConfig } from './types';

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#db2777',
    'primary-hover': '#be185d',
    'primary-light': '#fdf2f8',
    secondary: '#7c3aed',
    'secondary-hover': '#6d28d9',
    accent: '#f59e0b',
    background: '#ffffff',
    'background-alt': '#faf5ff',
    surface: '#ffffff',
    text: '#171717',
    'text-secondary': '#525252',
    'text-muted': '#a3a3a3',
    border: '#e5e5e5',
    'border-light': '#f5f5f5',
    error: '#ef4444',
    success: '#22c55e',
  },
  typography: {
    'font-heading': "'Playfair Display', Georgia, serif",
    'font-body': "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    'font-accent': "'Great Vibes', handwriting, cursive",
  },
  spacing: {
    'section-padding': '5rem',
    'section-padding-mobile': '2.5rem',
    'container-max': '1024px',
    'container-narrow': '640px',
    'gap-section': '2rem',
    'gap-element': '1rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    glow: '0 0 20px rgb(236 72 153 / 0.3)',
  },
  glass: {
    opacity: '0.15',
    blur: '12px',
    border: '1px solid rgb(255 255 255 / 0.2)',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #db2777, #7c3aed)',
    secondary: 'linear-gradient(135deg, #fdf2f8, #faf5ff)',
    accent: 'linear-gradient(135deg, #f59e0b, #db2777)',
  },
};
