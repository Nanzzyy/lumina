import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
type TextColor = 'default' | 'secondary' | 'muted' | 'primary' | 'accent';

interface TextProps {
  children: ReactNode;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  font?: 'heading' | 'body' | 'accent';
}

const sizeMap: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
};

const weightMap: Record<TextWeight, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorMap: Record<TextColor, string> = {
  default: 'text-[var(--colors-text)]',
  secondary: 'text-[var(--colors-text-secondary)]',
  muted: 'text-[var(--colors-text-muted)]',
  primary: 'text-[var(--colors-primary)]',
  accent: 'text-[var(--colors-accent)]',
};

const fontMap: Record<string, string> = {
  heading: 'font-[var(--typography-font-heading)]',
  body: 'font-[var(--typography-font-body)]',
  accent: 'font-[var(--typography-font-accent)]',
};

export function Text({
  children,
  size = 'base',
  weight = 'normal',
  color = 'default',
  as: Tag = 'p',
  className,
  font = 'body',
}: TextProps) {
  return (
    <Tag
      className={cn(
        sizeMap[size],
        weightMap[weight],
        colorMap[color],
        fontMap[font],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
