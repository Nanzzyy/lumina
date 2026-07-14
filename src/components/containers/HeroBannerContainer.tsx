import type { ReactNode, CSSProperties } from 'react';

export function HeroBannerContainer({ children, style, className }: {
  children: ReactNode;
  variant?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className || ''}`} style={style}>
      {children}
    </div>
  );
}
