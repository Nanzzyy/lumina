'use client';

import type { SectionType } from '@/lib/template/types';

export const PALETTE_SECTIONS: { type: SectionType; label: string; icon: string }[] = [
  { type: 'cover', label: 'Cover', icon: '📔' },
  { type: 'hero', label: 'Hero', icon: '✨' },
  { type: 'quote', label: 'Quote', icon: '💬' },
  { type: 'countdown', label: 'Countdown', icon: '⏱️' },
  { type: 'story', label: 'Story', icon: '📖' },
  { type: 'gallery', label: 'Gallery', icon: '🖼️' },
  { type: 'timeline', label: 'Timeline', icon: '📋' },
  { type: 'maps', label: 'Maps', icon: '📍' },
  { type: 'rsvp', label: 'RSVP', icon: '✉️' },
  { type: 'gift', label: 'Gift', icon: '🎁' },
  { type: 'guestbook', label: 'Guestbook', icon: '📝' },
  { type: 'footer', label: 'Footer', icon: '🏁' },
];

export const PALETTE_COMPOSITES: { id: string; label: string; icon: string }[] = [
  { id: 'group-default', label: 'Group (Empty)', icon: '📦' },
  { id: 'hero-split', label: 'Hero Split', icon: '🧩' },
];

interface SectionPaletteProps {
  onAdd: (type: SectionType) => void;
  onAddComposite?: (templateId: string) => void;
  onAddWidget?: (widgetId: string) => void;
  widgets?: { id: string; name: string; thumbnail?: string }[];
  readOnly?: boolean;
}

export function SectionPalette({ onAdd, onAddComposite, onAddWidget, widgets, readOnly }: SectionPaletteProps) {
  return (
    <div className="w-52 flex-shrink-0 bg-white border border-zinc-200 rounded-xl p-3 overflow-y-auto">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sections</h3>
      <div className="space-y-1">
        {PALETTE_SECTIONS.map((s) => (
          <button
            key={s.type}
            onClick={() => onAdd(s.type)}
            disabled={readOnly}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-[var(--colors-primary-light)] hover:text-[var(--colors-primary)] transition-colors flex items-center gap-2 disabled:opacity-40"
          >
            <span className="text-base">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {onAddComposite && (
        <>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-5 mb-3">Composites</h3>
          <div className="space-y-1">
            {PALETTE_COMPOSITES.map((c) => (
              <button
                key={c.id}
                onClick={() => onAddComposite(c.id)}
                disabled={readOnly}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-[var(--colors-primary-light)] hover:text-[var(--colors-primary)] transition-colors flex items-center gap-2 disabled:opacity-40"
              >
                <span className="text-base">{c.icon}</span>
                {c.label}
                <span className="ml-auto text-[9px] text-zinc-400">img+text</span>
              </button>
            ))}
          </div>
        </>
      )}

      {onAddWidget && widgets && widgets.length > 0 && (
        <>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-5 mb-3">Widget Library</h3>
          <div className="space-y-1">
            {widgets.map((w) => (
              <button
                key={w.id}
                onClick={() => onAddWidget(w.id)}
                disabled={readOnly}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-[var(--colors-primary-light)] hover:text-[var(--colors-primary)] transition-colors flex items-center gap-2 disabled:opacity-40"
              >
                <span className="text-base">📚</span>
                <span className="truncate">{w.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <p className="mt-4 text-[10px] text-zinc-400 leading-relaxed">
        Klik untuk tambah. Drag/resize di canvas. Composite bisa swap slot (image kiri/kanan). Mobile auto-stack.
      </p>
    </div>
  );
}
