import type { ReactNode, CSSProperties } from 'react';

export function ContainedContainer({ children, style, className }: {
  children: ReactNode;
  variant?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[var(--spacing-container-max)] px-4 sm:px-6 lg:px-8 ${className || ''}`} style={style}>
      {children}
    </div>
  );
}
