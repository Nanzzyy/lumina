'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { InvitationContent, SectionBackground } from '@/lib/content/types';
import type { LayoutDefinition } from '@/lib/layout/types';
import type { LayoutNode } from '@/lib/layout/tree';
import { normalizeLayout } from '@/lib/layout/migrate';
import { resolveNode } from '@/lib/layout/resolve';
import { SectionRegistry } from './SectionRegistry';
import { SectionShell } from './SectionShell';
import { FloralDecoration, OrnamentGroup } from '@/components/primitives';

interface TreeRendererProps {
  template: {
    id: string;
    theme?: Record<string, unknown>;
    decorations?: { id: string; layer: string; anchor: string | number; type: string; props?: Record<string, unknown>; hiddenMobile?: boolean }[];
  };
  layout: LayoutDefinition;
  content: InvitationContent;
  scopeClass?: string;
  hideOrnaments?: boolean;
  slug?: string;
}

const DecorationRegistry: Record<string, React.FC<Record<string, unknown>>> = {
  'floral-decoration': FloralDecoration as React.FC<Record<string, unknown>>,
};

function NodeView({
  node,
  index,
  content,
  decorations,
  slug,
  nested,
}: {
  node: LayoutNode;
  index: number;
  content: InvitationContent;
  decorations?: React.ReactNode;
  slug?: string;
  nested?: boolean;
}) {
  // Nested children (inside a composite) flow in the composite's own grid/flex — no 12-col placement.
  const gridStyle: CSSProperties = nested
    ? { isolation: 'isolate' }
    : {
        gridColumn: `${node.placement.x + 1} / span ${node.placement.w}`,
        gridRow: `${node.placement.y + 1} / span ${node.placement.h}`,
        isolation: 'isolate',
      };

  const background: SectionBackground | undefined = content.sectionBackgrounds?.[node.id];

  if (node.kind === 'composite') {
    // Composite: render slot children. Split = 2-col, else stack. Order = children array (swap flips it).
    // ponytail: on-canvas nested editing caps at gridstack sub-grid depth 1; deeper slots render stacked here.
    const isSplit = node.wrapper?.container === 'split' || node.type === 'split';
    return (
      <SectionShell id={node.id} index={index} background={background} decorations={decorations} style={gridStyle}>
        <div className={isSplit ? 'grid md:grid-cols-2 gap-8 items-center' : 'flex flex-col gap-4'}>
          {(node.children ?? []).map((child, i) => (
            <NodeView key={child.id} node={child} index={i} content={content} slug={slug} nested />
          ))}
        </div>
      </SectionShell>
    );
  }

  // Leaf section: hand off to SectionRegistry (guard so unresolved types never throw).
  // SectionRegistry is populated once at app init (initializeRegistries), so get() returns a
  // stable component identity across renders — no remount. Safe to look up during render.
  // eslint-disable-next-line react-hooks/static-components
  const SectionComponent = node.type && SectionRegistry.has(node.type as never) ? SectionRegistry.get(node.type as never) : null;

  return (
    <SectionShell id={node.id} index={index} background={background} decorations={decorations} style={gridStyle}>
      {SectionComponent ? (
        <SectionComponent
          content={content}
          variant={node.variant}
          sectionIndex={index}
          slug={slug}
          {...node.props}
        />
      ) : (
        <div className="p-8 text-center text-sm text-zinc-400">Unknown section: {node.type}</div>
      )}
    </SectionShell>
  );
}

export function TreeRenderer({ template, layout, content, scopeClass, hideOrnaments, slug }: TreeRendererProps) {
  const [widgets, setWidgets] = useState<Map<string, LayoutNode>>(new Map());

  useEffect(() => {
    let alive = true;
    fetch('/api/widgets')
      .then((r) => r.json())
      .then((list: { id: string; definition: LayoutNode }[]) => {
        if (alive) setWidgets(new Map(list.map((w) => [w.id, w.definition])));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const tree = normalizeLayout(layout);
  const nodes = tree.nodes.map((n) => resolveNode(n, widgets)).filter((n) => !n.hidden);

  return (
    <div
      className={`lumina-tree overflow-x-hidden relative ${layout.wrapper?.containerClass ?? ''} ${scopeClass ?? ''}`}
    >
      {template.decorations
        ?.filter((d) => d.anchor === 'global' && d.layer === 'behind')
        .map((d) => {
          const Component = DecorationRegistry[d.type];
          return Component ? <Component key={d.id} {...d.props} /> : null;
        })}

      {nodes.map((node, index) => {
        const localDecorations = template.decorations
          ?.filter((d) => d.anchor === index && (d.layer === 'behind' || d.layer === 'floating'))
          .map((d) => {
            const Component = DecorationRegistry[d.type];
            return Component ? <Component key={d.id} {...d.props} /> : null;
          });

        return (
          <NodeView
            key={node.id}
            node={node}
            index={index}
            content={content}
            decorations={localDecorations}
            slug={slug}
          />
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
