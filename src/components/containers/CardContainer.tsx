import type { ReactNode, CSSProperties } from 'react';

export function CardContainer({ children, style, className }: {
  children: ReactNode;
  variant?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className="mx-auto max-w-[var(--spacing-container-narrow)] px-4 sm:px-6" style={style}>
      <div className={`bg-[var(--colors-surface)] rounded-2xl border border-[var(--colors-border)] shadow-sm p-6 sm:p-10 ${className || ''}`}>
        {children}
      </div>
    </div>
  );
}
