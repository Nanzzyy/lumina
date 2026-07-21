import type { CSSProperties, ReactNode } from 'react';
import type { SectionBackground } from '@/lib/content/types';

function backgroundToStyle(bg?: SectionBackground): CSSProperties {
  if (!bg) return {};
  const style: CSSProperties = {};

  if (bg.type === 'color' && bg.color) {
    style.backgroundColor = bg.color;
  } else if (bg.type === 'image' && bg.image) {
    style.backgroundImage = `url(${bg.image})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
    style.backgroundAttachment = 'fixed';
  } else if (bg.type === 'gradient' && bg.gradient) {
    style.backgroundImage = bg.gradient;
  }

  if (bg.overlay === 'darken') {
    style.position = 'relative';
  }

  return style;
}

interface SectionShellProps {
  id: string;
  index?: number;
  background?: SectionBackground;
  /** Pre-rendered behind/floating decorations for this section. */
  decorations?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Shared section wrapper: applies background, dark/blur overlays, and slot for decorations.
 * Extracted from TemplateRenderer so both the legacy renderer and TreeRenderer reuse it.
 * The caller owns placement (grid/flex) — this component only handles section semantics.
 */
export function SectionShell({ id, index, background, decorations, className, style, children }: SectionShellProps) {
  const bgStyle = backgroundToStyle(background);
  return (
    <section
      id={`section-${id}`}
      data-section-index={index}
      className={className}
      style={{ ...bgStyle, ...style }}
    >
      {background?.overlay === 'darken' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', opacity: background.overlayOpacity ?? 0.4 }}
        />
      )}
      {background?.overlay === 'blur' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        />
      )}
      {decorations}
      {children}
    </section>
  );
}
