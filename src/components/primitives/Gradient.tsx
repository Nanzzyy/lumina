import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GradientProps {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
  as?: 'div' | 'span';
}

export function Gradient({
  children,
  variant = 'primary',
  className,
  as: Tag = 'div',
}: GradientProps) {
  return (
    <Tag
      className={cn(className)}
      style={{
        background: `var(--gradient-${variant === 'primary' ? 'primary' : variant === 'secondary' ? 'secondary' : 'accent'})`,
      }}
    >
      {children}
    </Tag>
  );
}
