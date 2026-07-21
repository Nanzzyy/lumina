'use client';

import type { SectionConfig, AnimationConfig } from './types';
import type { InvitationContent, SectionBackground } from '@/lib/content/types';
import type { LayoutDefinition } from '@/lib/layout/types';
import { SectionRegistry } from './SectionRegistry';
import { FloralDecoration, OrnamentGroup } from '@/components/primitives';
import { TreeRenderer } from './TreeRenderer';
import { CanvasRenderer } from '@/components/mobile/CanvasRenderer';

interface TemplateRendererProps {
  template: { id: string; kind?: 'composed' | 'monolithic' | 'mobile-canvas'; component?: React.FC<{ content: InvitationContent; slug?: string; preview?: boolean }>; theme?: Record<string, unknown>; decorations?: { id: string; layer: string; anchor: string | number; type: string; props?: Record<string, unknown>; hiddenMobile?: boolean }[] };
  /** Required for composed/tree; ignored by monolithic templates. */
  layout?: LayoutDefinition;
  content: InvitationContent;
  scopeClass?: string;
  hideOrnaments?: boolean;
  slug?: string;
}

interface SectionRendererProps {
  section: SectionConfig;
  content: InvitationContent;
  animation?: AnimationConfig;
  index: number;
  background?: SectionBackground;
  slug?: string;
}

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
  slug,
}: SectionRendererProps) {
  if (section.hidden) return null;

  const SectionComponent = SectionRegistry.get(section.type);

  return (
    <SectionComponent
      content={content}
      variant={section.variant}
      animation={animation}
      sectionIndex={index}
      slug={slug}
      {...section.props}
    />
  );
}

export function TemplateRenderer({
  template,
  layout,
  content,
  scopeClass,
  hideOrnaments,
  slug,
}: TemplateRendererProps) {
  // Monolithic switch: a self-contained template renders the whole page itself.
  if (template.kind === 'monolithic' && template.component) {
    const Monolithic = template.component;
    return <Monolithic content={content} slug={slug} preview={true} />;
  }

  // Mobile-canvas switch: free-position element canvas.
  if (template.kind === 'mobile-canvas') {
    return <CanvasRenderer content={content} />;
  }

  // Composed paths require a layout.
  if (!layout) return null;

  // Engine switch: tree layouts render via the responsive CSS-grid TreeRenderer.
  if (layout.engine === 'tree') {
    return <TreeRenderer template={template} layout={layout} content={content} scopeClass={scopeClass} hideOrnaments={hideOrnaments} slug={slug} />;
  }

  const sectionBackgrounds = content.sectionBackgrounds || {};

  return (
    <div className={`overflow-x-hidden relative ${layout.wrapper?.containerClass ?? ''} ${scopeClass ?? ''}`} style={layout.wrapper?.bgClass ? {} : undefined}>
      {template.decorations
        ?.filter((d) => d.anchor === 'global' && d.layer === 'behind')
        .map((d) => {
          const Component = DecorationRegistry[d.type];
          return Component ? <Component key={d.id} {...d.props} /> : null;
        })}

      {layout.sections.map((section, index) => {
        const bg = sectionBackgrounds[section.id];
        const bgStyle = backgroundToStyle(bg);

        return (
          <section
            key={section.id}
            id={`section-${section.id}`}
            style={bgStyle}
          >
            {bg?.overlay === 'darken' && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  opacity: bg.overlayOpacity ?? 0.4,
                }}
              />
            )}

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
              animation={layout.animation}
              index={index}
              background={bg}
              slug={slug}
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

      {!hideOrnaments && content.ornaments && content.ornaments.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <OrnamentGroup ornaments={content.ornaments} />
        </div>
      )}
    </div>
  );
}

const DecorationRegistry: Record<string, React.FC<Record<string, unknown>>> = {
  'floral-decoration': FloralDecoration as React.FC<Record<string, unknown>>,
};
