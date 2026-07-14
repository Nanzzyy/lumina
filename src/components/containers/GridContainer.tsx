import type { ReactNode, CSSProperties } from 'react';

export function GridContainer({ children, columns, style, className }: {
  children: ReactNode;
  variant?: string;
  columns?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const cols = columns || 3;
  const colClass = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3';
  return (
    <div className={`mx-auto max-w-[var(--spacing-container-max)] px-4 sm:px-6 lg:px-8 grid ${colClass} gap-4 sm:gap-6 ${className || ''}`} style={style}>
      {children}
    </div>
  );
}
