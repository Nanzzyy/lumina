import type { ReactNode, CSSProperties } from 'react';

export function FullWidthContainer({ children, style, className }: {
  children: ReactNode;
  variant?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={`w-full ${className || ''}`} style={style}>
      {children}
    </div>
  );
}
