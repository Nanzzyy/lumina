import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassProps {
  children: ReactNode;
  className?: string;
  blur?: string;
  opacity?: string;
  border?: boolean;
}

export function Glass({
  children,
  className,
  blur,
  opacity,
  border = true,
}: GlassProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)]',
        border && 'border',
        className,
      )}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity ?? 'var(--glass-opacity)'})`,
        backdropFilter: `blur(${blur ?? 'var(--glass-blur)'})`,
        borderColor: border ? 'var(--glass-border)' : undefined,
      }}
    >
      {children}
    </div>
  );
}
