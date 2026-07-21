'use client';

import type { LayoutNode } from '@/lib/layout/tree';
import type { SectionType } from '@/lib/template/types';

const SECTION_META: Record<string, { label: string; icon: string }> = {
  cover: { label: 'Cover', icon: '📔' },
  hero: { label: 'Hero', icon: '✨' },
  quote: { label: 'Quote', icon: '💬' },
  countdown: { label: 'Countdown', icon: '⏱️' },
  story: { label: 'Story', icon: '📖' },
  gallery: { label: 'Gallery', icon: '🖼️' },
  timeline: { label: 'Timeline', icon: '📋' },
  maps: { label: 'Maps', icon: '📍' },
  rsvp: { label: 'RSVP', icon: '✉️' },
  gift: { label: 'Gift', icon: '🎁' },
  guestbook: { label: 'Guestbook', icon: '📝' },
  footer: { label: 'Footer', icon: '🏁' },
};

export function metaFor(type: SectionType | string) {
  return SECTION_META[type] ?? { label: type, icon: '◻' };
}

interface WidgetContentProps {
  node: LayoutNode;
  selected: boolean;
  selectedChildId?: string | null;
  onSelect: (id: string) => void;
  onSwap?: (id: string) => void;
}

export function WidgetContent({ node, selected, selectedChildId, onSelect, onSwap }: WidgetContentProps) {
  const p = node.placement;
  const ring = selected
    ? 'ring-2 ring-[var(--colors-primary)] bg-[var(--colors-primary-light)]'
    : 'ring-1 ring-zinc-200 bg-white hover:bg-zinc-50';

  if (node.kind === 'composite') {
    const children = node.children ?? [];
    return (
      <div
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
        className={`h-full w-full flex flex-col p-2 cursor-pointer rounded-lg transition-colors ${ring}`}
      >
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <span>🧩</span> {node.type ?? 'composite'} · {children.length} slot
          </span>
          {onSwap && children.length >= 2 && (
            <button
              onClick={(e) => { e.stopPropagation(); onSwap(node.id); }}
              title="Swap slot order (image left/right)"
              className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
            >
              ↔ swap
            </button>
          )}
        </div>
        <div className="flex-1 grid grid-cols-2 gap-1.5 min-h-0">
          {children.map((c) => {
            const m = metaFor(c.type ?? c.kind);
            const childSel = selectedChildId === c.id;
            return (
              <button
                key={c.id}
                onClick={(e) => { e.stopPropagation(); onSelect(c.id); }}
                className={`flex flex-col items-center justify-center gap-1 rounded-md border-2 text-center transition-colors ${
                  childSel ? 'border-[var(--colors-primary)] bg-[var(--colors-primary-light)]' : 'border-dashed border-zinc-300 bg-zinc-50 hover:border-zinc-400'
                }`}
              >
                <span className="text-lg">{m.icon}</span>
                <span className="text-[10px] text-zinc-500">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const meta = metaFor(node.type ?? node.kind);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
      className={`h-full w-full flex flex-col justify-between p-3 cursor-pointer rounded-lg transition-colors ${ring}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg flex-shrink-0">{meta.icon}</span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-800 truncate">{meta.label}</div>
          <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1">
            <span>{node.type}</span>
            {node.widgetId && <span className="px-1 rounded bg-zinc-200 text-zinc-500 text-[8px] uppercase tracking-wider">library</span>}
            {node.variant && <span className="text-zinc-300">· {node.variant}</span>}
          </div>
        </div>
      </div>
      <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2">
        {node.variant && <span className="text-zinc-300">v:{node.variant}</span>}
        <span>{p.w}×{p.h} @ ({p.x},{p.y})</span>
      </div>
    </div>
  );
}
