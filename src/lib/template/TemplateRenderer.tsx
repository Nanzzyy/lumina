'use client';

import type { SectionConfig, TemplateDefinition, AnimationConfig } from './types';
import type { InvitationContent, SectionBackground } from '@/lib/content/types';
import { SectionRegistry } from './SectionRegistry';
import { FloralDecoration } from '@/components/primitives';

interface TemplateRendererProps {
  template: TemplateDefinition;
  content: InvitationContent;
  /** CSS class for theming scope — passed to wrapper div so ThemeProvider vars target it. */
  scopeClass?: string;
}

interface SectionRendererProps {
  section: SectionConfig;
  content: InvitationContent;
  animation?: AnimationConfig;
  index: number;
  background?: SectionBackground;
}

/** Convert SectionBackground to inline style */
function backgroundToStyle(bg?: SectionBackground): React.CSSProperties {
  if (!bg) return {};
  const style: React.CSSProperties = {};

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

function SectionRenderer({
  section,
  content,
  animation,
  index,
  background,
}: SectionRendererProps) {
  if (section.hidden) return null;

  const SectionComponent = SectionRegistry[section.type];
  if (!SectionComponent) {
    console.warn(`[TemplateRenderer] Unknown section type: "${section.type}"`);
    return null;
  }

  return (
    <SectionComponent
      content={content}
      variant={section.variant}
      animation={animation}
      sectionIndex={index}
      {...section.props}
    />
  );
}

export function TemplateRenderer({
  template,
  content,
  scopeClass,
}: TemplateRendererProps) {
  const sectionBackgrounds = content.sectionBackgrounds || {};

  return (
    <div className={`overflow-x-hidden ${template.layout?.wrapperClass ?? ''} ${scopeClass ?? ''}`}>
      {template.decorations
        ?.filter((d) => d.anchor === 'global' && d.layer === 'behind')
        .map((d) => {
          const Component = DecorationRegistry[d.type];
          return Component ? <Component key={d.id} {...d.props} /> : null;
        })}

      {template.sections.map((section, index) => {
        const bg = sectionBackgrounds[section.id];
        const bgStyle = backgroundToStyle(bg);

        return (
          <section
            key={section.id}
            id={`section-${section.id}`}
            className={template.layout?.containerClass ?? ''}
            style={bgStyle}
          >
            {/* Darken overlay */}
            {bg?.overlay === 'darken' && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  opacity: bg.overlayOpacity ?? 0.4,
                }}
              />
            )}

            {/* Blur overlay */}
            {bg?.overlay === 'blur' && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
              />
            )}

            {template.decorations
              ?.filter(
                (d) =>
                  d.anchor === index &&
                  (d.layer === 'behind' || d.layer === 'floating'),
              )
              .map((d) => {
                const Component = DecorationRegistry[d.type];
                return Component ? <Component key={d.id} {...d.props} /> : null;
              })}

            <SectionRenderer
              section={section}
              content={content}
              animation={template.animation}
              index={index}
              background={bg}
            />
          </section>
        );
      })}

      {template.decorations
        ?.filter((d) => d.anchor === 'global' && d.layer === 'overlay')
        .map((d) => {
          const Component = DecorationRegistry[d.type];
          return Component ? <Component key={d.id} {...d.props} /> : null;
        })}
    </div>
  );
}

/** Decoration component registry — maps type strings to components */
const DecorationRegistry: Record<string, React.FC<Record<string, unknown>>> = {
  'floral-decoration': FloralDecoration as React.FC<Record<string, unknown>>,
};
