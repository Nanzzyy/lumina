import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface OversizedTextProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = { md: 'text-6xl sm:text-7xl md:text-8xl', lg: 'text-7xl sm:text-8xl md:text-9xl', xl: 'text-8xl sm:text-9xl md:text-[10rem]' };

export function OversizedText({ children, as: Tag = 'div', size = 'lg', className }: OversizedTextProps) {
  return (
    <Tag className={cn('font-[var(--typography-font-heading)] font-bold leading-[0.85] tracking-tight', sizeClasses[size], className)}>
      {children}
    </Tag>
  );
}
